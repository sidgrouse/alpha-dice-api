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
import { Debt } from 'src/storage/entities/payment.entity';
import { PaymentStatus } from 'src/constants/payment-status';
import { InvoiceDto } from 'src/dto/invoice.dto';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Item)
        private _itemRepository: Repository<Item>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(Debt)
        private paymentRepository: Repository<Debt>
      ) {}

    async addOrder(itemId: number, userTelegramId : number, count = 1): Promise<void> {
        const user = await this.getUserByTgId(userTelegramId);

        const pledge = await this._itemRepository.findOneOrFail(itemId, {relations: ["invoices", "invoices.userDebts"] });

        let order = new Order();
        order.debts = pledge.invoices.map(inv => {
             const payment = new Debt();
             payment.invoice = inv;
             payment.order = order;
             payment.status = PaymentStatus.NO_INFO;
             return payment;
            });
        order.item = pledge;
        order.user = user;
        order.count = count;
        this.orderRepository.save(order);
        
        console.log('add-inv', order.debts);
        this.checkAssignNewUtid(user);
        //TODO: check invoices added after getting but before saving here
    } //pledgeservice

    async addInvoiceByName(itemName: string, amount : number, description: string, status: InvoiceStatus = InvoiceStatus.TO_PAY): Promise<void> {
        const pledge = await this._itemRepository.findOne({where: {name: itemName}, relations: ["orders", "orders.user"] });
        return this.addInvoice(pledge.id, amount, description, status);
    }

    async addInvoice(itemId: number, amount : number, description: string, status: InvoiceStatus = InvoiceStatus.TO_PAY): Promise<void> {
        const item = await this._itemRepository.findOne(itemId, {relations: ["orders", "orders.user"] });

        const invoice = new Invoice();
        invoice.userDebts = item.orders.map(order => {
            const payment = new Debt();
            payment.order = order;
            payment.invoice = invoice;
            payment.status = PaymentStatus.NO_INFO;
            return payment;
        });
        invoice.pledge = item;
        invoice.amount = amount;
        invoice.name = description;
        invoice.status = status;
        const invEntity = await this.invoiceRepository.save(invoice);

        item.orders.map(ord =>this.checkAssignNewUtid(ord.user));

        //TODO: check orders added after getting but before saving here
        console.log('add-inv', invEntity);
    }

    async declarePayment(telegramId: number, invoiceIds: number[]) : Promise<InvoiceDto[]>{ //TODO: remake, add splitting
        console.log('invIds', invoiceIds);
        const user = await this.userRepository.findOneOrFail({
            relations: ["orders", "orders.debts", "orders.debts.order", "orders.debts.order.item", "orders.debts.invoice", "orders.debts.invoice.pledge"],
            where: {telegramId: telegramId}
        });
    
        const declaredPayments = user.orders
            .flatMap(order => order.debts)
            .filter(
                p => p.status === PaymentStatus.NO_INFO 
                && p.invoice.status === InvoiceStatus.TO_PAY
                && invoiceIds.some(declaredInvId => p.invoice.id === declaredInvId));
        if(declaredPayments.length !== invoiceIds.length){
            console.error(`Some declared payments are not found as payable. Declared ids=${invoiceIds}.`+
            ` Payments=${declaredPayments.map(p => p.id).join(', ')}`);
        }
               
        declaredPayments.forEach(p => p.status = PaymentStatus.PAYMENT_DECLARED);
        console.log('declarePmnts', declaredPayments);
        await this.paymentRepository.save(declaredPayments);

        return declaredPayments.map(pmnt => 
            new InvoiceDto(pmnt.invoice.id, pmnt.order.item.name, pmnt.invoice.name , pmnt.invoice.amount));
    }

    async getDebptors(): Promise<UserDto[]> {
        const users = await this.userRepository.find({relations: ["orders", "orders.debts", "orders.debts.invoice"]})
        return users.filter(usr => this.isDebtor(usr))
            .map(usr => new UserDto(usr.telegramId, usr.telegramName));
    }
    
    async getAllUserDebts(telegramId: number): Promise<DebtDto> {
        const user = await this.userRepository.findOneOrFail({
                relations: ["orders", "orders.debts", "orders.debts.order", "orders.debts.order.item", "orders.debts.invoice", "orders.debts.invoice.pledge"],
                where: {telegramId: telegramId}
            }); //TODO: remove "orders.debts.order" etc. Preload or something
        
        const invoicesToPay = user.orders
            .flatMap(order => order.debts)
            .filter(p => p.status === PaymentStatus.NO_INFO && p.invoice.status === InvoiceStatus.TO_PAY)
            .map(pmnt => new InvoiceDto(pmnt.invoice.id, pmnt.order.item.name, pmnt.invoice.name , pmnt.invoice.amount));

        this.checkAssignNewUtid(user);
        console.log('invSrv.get_user', user);
        return new DebtDto(invoicesToPay, this.getIdentificationalAmount(user));
    }

    private getUserByTgId(userTelegramId: number) : Promise<User> {
        return this.userRepository.findOneOrFail({where: { telegramId: userTelegramId } });
    }

    private async checkAssignNewUtid(user: User) : Promise<number> {
        if(user.utid){
            return user.utid;
        }

        const assignedUtids = (await this.userRepository.find())
            .filter(usr => usr.utid)
            .map(usr =>usr.utid)
            .sort();
        for (let attemptNumber = 0; attemptNumber < 3; attemptNumber++) {
            try{
                for (let i = 0; i < 1000; i++) {
                    if(!assignedUtids[i] || assignedUtids[i] !== i+1){
                        user.utid = i+1;
                        await this.userRepository.save(user);
                        return user.utid;
                    }
                }
            }
            catch{
                console.warn(`An attempt to assign utid to user ${user.telegramName} failed`);
            }
        }
        throw new InternalServerErrorException("Cannot assign an utid");
    }

    private async checkReleaseUtId(telegramId: number) : Promise<boolean> {
        const user = await this.userRepository.findOneOrFail({relations: ["orders", "orders.debts", "orders.debts.invoice"]})
        if(!user.utid){
            console.error("Cannot release an utid, it is already released"); 
        }

        if(this.isDebtor(user)){
            console.log(`Cannot release utid of user ${user.telegramName} since they has a debt`);
            return false;
        }

        user.utid = null;
        await this.userRepository.save(user);
        return true;
    }

    private isDebtor(user: User) : boolean {
        return user.orders.flatMap(ord => ord.debts)
            .some(p => p.status === PaymentStatus.NO_INFO && p.invoice.status === InvoiceStatus.TO_PAY)
    }

    private getIdentificationalAmount(user: User) : number {
        if(!user.utid){
            //throw new InternalServerErrorException(`Cannot get identificational amount of ${user.telegramName}`);
        }
        return (user.utid % 1000) / 100;
    }
}