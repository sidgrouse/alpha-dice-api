import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { DebtDto } from 'src/dto/debt.dto';
import { UserDto } from 'src/dto/user.dto';
import { InvoiceStatus } from 'src/constants/invoice-status';

import { User } from 'src/storage/entities/user.entity';
import { Pledge } from 'src/storage/entities/pledge.entity';
import { Order } from '../storage/entities/order.entity';
import { Invoice } from 'src/storage/entities/invoice.entity';
import { Payment } from 'src/storage/entities/payment.entity';
import { PaymentStatus } from 'src/constants/payment-status';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Pledge)
        private pledgeRepository: Repository<Pledge>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>
      ) {}

    async addUser(name: string, telegramId : number): Promise<void> {
        const existedUser = this.userRepository.findOne({where: {telegramId: telegramId}})

        if(!existedUser){
            const user = new User();
            user.telegramName = name;
            user.telegramId = telegramId;
            await this.userRepository.save(user);
        }
    } // userservice

    async addOrder(pledgeName: string, userTelegramId : number, count = 1): Promise<void> {
        const user = await this.getUserByTgId(userTelegramId);

        const pledge = await this.pledgeRepository.findOneOrFail({where: { name: pledgeName }, relations: ["invoices", "invoices.userPayments"] })
            || await this.pledgeRepository.findOne({where: { shortName: pledgeName }, relations: ["invoices", "invoices.userPayments"] });

        
        let order = new Order();
        order.payments = pledge.invoices.map(inv => {
             const payment = new Payment();
             payment.invoice = inv;
             payment.order = order;
             payment.status = PaymentStatus.NO_INFO;
             return payment;
            });
        order.pledge = pledge;
        order.user = user;
        order.count = count;
        this.orderRepository.save(order);
        //TODO: check invoices added after getting but before saving here
    } //pledgeservice

    async addInvoice(pledgeName: string, amount : number, description: string = ''): Promise<void> {
        const pledge = await this.pledgeRepository.findOne({where: { name: pledgeName }, relations: ["orders"] })
        || await this.pledgeRepository.findOne({where: { shortName: pledgeName }, relations: ["orders"] });

        const invoice = new Invoice();
        invoice.userPayments = pledge.orders.map(order => {
            const payment = new Payment();
            payment.order = order;
            payment.invoice = invoice;
            payment.status = PaymentStatus.NO_INFO;
            return payment;
           });
        invoice.pledge = pledge;
        invoice.amount = amount;
        invoice.status = InvoiceStatus.TO_PAY; //TODO: make it no_info, change after pay date or after command
        invoice.userPayments
        const invEntity = await this.invoiceRepository.save(invoice);

        //TODO: check orders added after getting but before saving here
        console.log('add-inv', invEntity);
    }
/*
    async getAllDebts(): Promise<InvoiceDto[]> {
        return await (await this.invoiceRepository.find({relations: ["user"]}))
        .map(inv => new InvoiceDto(inv..telegramName, inv.pledge.pledgeName, InvoiceService.getFullPrice(inv), inv.status));
    }
*/
    async getDebptors(): Promise<UserDto[]> {
        /*
        const allInvoices = await await this.orderRepository.find({relations: ["user"]})
        return allInvoices
            .filter(inv => inv.status === InvoiceStatus.TO_PAY)
            .filter((v, i, a) => a.indexOf(v) === i) // distinct
            .map(inv => new UserDto(inv.user.telegramId, inv.user.telegramName));
        */
       const userEntity = await this.userRepository.findOne({where: {telegramName: "k_matroskin"}});
       return [new UserDto(userEntity.telegramId, userEntity.telegramName)]; //TODO: remake mockup
    }
    
    async getAllUserDebts(telegramId: number): Promise<DebtDto[]> {
        const user = await this.userRepository.findOneOrFail({
                relations: ["orders", "orders.payments", "orders.payments.order", "orders.payments.order.pledge", "orders.payments.invoice", "orders.payments.invoice.pledge"],
                where: {telegramId: telegramId}
            }); //TODO: rempve "orders.payments.order" etc. Preload or something
        
        const paymentsToPay = user.orders
            .flatMap(order => order.payments)
            .filter(p => p.status === PaymentStatus.NO_INFO && p.invoice.status === InvoiceStatus.TO_PAY)
            .map(pmnt => new DebtDto(pmnt.order.pledge.name, pmnt.invoice.name , pmnt.invoice.amount));

        console.log('invSrv.get_user', user);
        return paymentsToPay;
    }

    private getUserByTgId(userTelegramId: number) : Promise<User> {
        return this.userRepository.findOneOrFail({where: { telegramId: userTelegramId } });
    }

    //TODO: move
    private static getFullPrice(payment: Payment) : number {
        const intPart = payment.invoice.amount;
        const fractionalPartForPaymentIdentification = (payment.order.user.id % 1000) / 10; //TODO: reimplement fraction part
        return intPart + fractionalPartForPaymentIdentification;
    }
}