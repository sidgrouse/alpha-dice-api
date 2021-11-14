import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { DebtDto } from 'src/dto/debt.dto';
import { UserDto } from 'src/dto/user.dto';
import { InvoiceStatus } from 'src/constants/invoice-status';

import { User } from 'src/storage/entities/user.entity';
import { Item } from 'src/storage/entities/item.entity';
import { Order } from '../storage/entities/order.entity';
import { Invoice } from 'src/storage/entities/invoice.entity';
import { Debt } from 'src/storage/entities/debt.entity';
import { DebtStatus } from 'src/constants/debt-status';
import { InvoiceItemDto } from 'src/dto/invoice-item.dto';
import { Payment } from 'src/storage/entities/payment.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Debt)
    private debtRepository: Repository<Debt>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async addOrder(
    itemId: number,
    userTelegramId: number,
    count = 1,
  ): Promise<void> {
    const user = await this.getUserByTgId(userTelegramId);

    const item = await this.itemRepository.findOneOrFail(itemId, {
      relations: ['invoices', 'invoices.userDebts'],
    });

    const existedOrder = await this.orderRepository.findOne({
      where: { user: user, item: item },
    });
    if (existedOrder) {
      throw new Error('Order already exist. You only can edit or remove it');
    }

    const order = new Order();
    order.debts = item.invoices.map((inv) => {
      const payment = new Debt();
      payment.invoice = inv;
      payment.order = order;
      payment.status = DebtStatus.NO_INFO;
      return payment;
    });
    order.item = item;
    order.user = user;
    order.count = count;
    this.orderRepository.save(order);

    console.log('add-inv', order.debts);
    this.checkAssignNewUtid(user);
    //TODO: check invoices added after getting but before saving here
  } //pledgeservice

  async addInvoiceByName(
    itemName: string,
    amount: number,
    description: string,
    status: InvoiceStatus = InvoiceStatus.TO_PAY,
  ): Promise<void> {
    const pledge = await this.itemRepository.findOne({
      where: { name: itemName },
      relations: ['orders', 'orders.user'],
    });
    return this.addInvoice(pledge.id, amount, description, status);
  }

  async addInvoice(
    itemId: number,
    amount: number,
    description: string,
    status: InvoiceStatus = InvoiceStatus.TO_PAY,
  ): Promise<void> {
    const item = await this.itemRepository.findOne(itemId, {
      relations: ['orders', 'orders.user'],
    });

    const invoice = new Invoice();
    invoice.userDebts = item.orders.map((order) => {
      const payment = new Debt();
      payment.order = order;
      payment.invoice = invoice;
      payment.status = DebtStatus.NO_INFO;
      return payment;
    });
    invoice.item = item;
    invoice.amount = amount;
    invoice.name = description;
    invoice.status = status;
    const invEntity = await this.invoiceRepository.save(invoice);

    item.orders.map((ord) => this.checkAssignNewUtid(ord.user));

    //TODO: check orders added after getting but before saving here
    console.log('add-inv', invEntity);
  }

  async declarePayment(
    telegramId: number,
    invoiceIds: number[],
  ): Promise<InvoiceItemDto[]> {
    //TODO: remake, add splitting
    console.log('invIds', invoiceIds);
    const user = await this.userRepository.findOneOrFail({
      relations: [
        'orders',
        'orders.debts',
        'orders.debts.order',
        'orders.debts.order.item',
        'orders.debts.invoice',
        'orders.debts.invoice.item',
      ],
      where: { telegramId: telegramId },
    });

    const declaredDebts = user.orders
      .flatMap((order) => order.debts)
      .filter(
        (p) =>
          p.status === DebtStatus.NO_INFO &&
          p.invoice.status === InvoiceStatus.TO_PAY &&
          invoiceIds.some((declaredInvId) => p.invoice.id === declaredInvId),
      );
    if (declaredDebts.length !== invoiceIds.length) {
      console.error(
        `Some declared payments are not found as payable. Declared ids=${invoiceIds}.` +
          ` Payments=${declaredDebts.map((p) => p.id).join(', ')}`,
      );
    }

    const payment = new Payment();
    payment.debts = declaredDebts;
    payment.user = user;
    const debtIds = declaredDebts.map((d) => d.id);
    await this.paymentRepository.save(payment);
    console.log('declarePmnt', payment);
    await this.debtRepository.update(debtIds, {
      status: DebtStatus.PAYMENT_DECLARED,
    });
    return declaredDebts.map(
      (pmnt) =>
        new InvoiceItemDto(
          pmnt.invoice.id,
          pmnt.order.item.name,
          pmnt.order.item.project.name,
          pmnt.invoice.name,
          pmnt.invoice.amount,
        ),
    );
  }

  async getDebptors(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      relations: ['orders', 'orders.debts', 'orders.debts.invoice'],
    });
    return users
      .filter((usr) => this.isDebtor(usr))
      .map((usr) => new UserDto(usr.id, usr.telegramId, usr.telegramName));
  }

  async getUserDebts(
    telegramId: number,
    debtStatus = DebtStatus.NO_INFO,
  ): Promise<DebtDto> {
    const user = await this.userRepository.findOneOrFail({
      relations: [
        'orders',
        'orders.debts',
        'orders.debts.order',
        'orders.debts.order.item',
        'orders.debts.invoice',
        'orders.debts.invoice.item',
      ],
      where: { telegramId: telegramId },
    }); //TODO: remove "orders.debts.order" etc. Preload or something

    const invoicesToPay = user.orders
      .flatMap((order) => order.debts)
      .filter(
        (p) =>
          p.status === debtStatus && p.invoice.status === InvoiceStatus.TO_PAY,
      )
      .map(
        (pmnt) =>
          new InvoiceItemDto(
            pmnt.invoice.id,
            pmnt.order.item.name,
            pmnt.order.item.project.name,
            pmnt.invoice.name,
            pmnt.invoice.amount,
          ),
      );

    this.checkAssignNewUtid(user);
    console.log('invSrv.get_user', user);
    return new DebtDto(invoicesToPay, this.getIdentificationalAmount(user));
  }

  private getUserByTgId(userTelegramId: number): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { telegramId: userTelegramId },
    });
  }

  private async checkAssignNewUtid(user: User): Promise<number> {
    if (user.utid) {
      return user.utid;
    }

    const assignedUtids = (await this.userRepository.find())
      .filter((usr) => usr.utid)
      .map((usr) => usr.utid)
      .sort();
    for (let attemptNumber = 0; attemptNumber < 3; attemptNumber++) {
      try {
        for (let i = 0; i < 1000; i++) {
          if (!assignedUtids[i] || assignedUtids[i] !== i + 1) {
            user.utid = i + 1;
            await this.userRepository.save(user);
            return user.utid;
          }
        }
      } catch {
        console.warn(
          `An attempt to assign utid to user ${user.telegramName} failed`,
        );
      }
    }
    throw new InternalServerErrorException('Cannot assign an utid');
  }

  public async checkReleaseUtId(telegramName: string): Promise<boolean> {
    const user = await this.userRepository.findOneOrFail({
      where: { telegramName: telegramName },
      relations: ['orders', 'orders.debts', 'orders.debts.invoice'],
    });
    if (!user.utid) {
      console.error('Cannot release an utid, it is already released');
    }

    if (this.isDebtor(user)) {
      console.log(
        `Cannot release utid of user ${user.telegramName} since they has a debt`,
      );
      return false;
    }

    user.utid = null;
    await this.userRepository.save(user);
    return true;
  }

  private isDebtor(user: User): boolean {
    return user.orders
      .flatMap((ord) => ord.debts)
      .some(
        (p) =>
          p.status === DebtStatus.NO_INFO &&
          p.invoice.status === InvoiceStatus.TO_PAY,
      );
  }

  private getIdentificationalAmount(user: User): number {
    if (!user.utid) {
      //throw new InternalServerErrorException(`Cannot get identificational amount of ${user.telegramName}`);
    }
    return (user.utid % 1000) / 100;
  }
}
