import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
import { InvoiceDto } from 'src/dto/invoice.dto';

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
        private invoiceRepository: Repository<Invoice>
      ) {}

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
        
        console.log('add-inv', order.payments);
        this.checkAssignNewUtid(user);
        //TODO: check invoices added after getting but before saving here
    } //pledgeservice

    async addInvoice(pledgeName: string, amount : number, description: string = ''): Promise<void> {
        const pledge = await this.pledgeRepository.findOne({where: { name: pledgeName }, relations: ["orders", "orders.user"] })
        || await this.pledgeRepository.findOne({where: { shortName: pledgeName }, relations: ["orders", "order.user"] });

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
        const invEntity = await this.invoiceRepository.save(invoice);

        pledge.orders.map(ord =>this.checkAssignNewUtid(ord.user));

        //TODO: check orders added after getting but before saving here
        console.log('add-inv', invEntity);
    }

    async declarePayment(telegramId: number) : Promise<InvoiceDto[]>{ //TODO: remake, add splitting
        const user = await this.userRepository.findOneOrFail({
            relations: ["orders", "orders.payments", "orders.payments.order", "orders.payments.order.pledge", "orders.payments.invoice", "orders.payments.invoice.pledge"],
            where: {telegramId: telegramId}
        });
    
        const declaredPayments = user.orders
            .flatMap(order => order.payments)
            .filter(p => p.status === PaymentStatus.NO_INFO && p.invoice.status === InvoiceStatus.TO_PAY);
        declaredPayments.map(p => p.status = PaymentStatus.PAYMENT_DECLARED);
        this.userRepository.save(user);

        this.checkReleaseUtId(user.telegramId);
        return declaredPayments.map(pmnt => new InvoiceDto(pmnt.order.pledge.name, pmnt.invoice.name , pmnt.invoice.amount));
    }

    async getDebptors(): Promise<UserDto[]> {
        const users = await this.userRepository.find({relations: ["orders", "orders.payments", "orders.payments.invoice"]})
        return users.filter(usr => this.isDebtor(usr))
            .map(usr => new UserDto(usr.telegramId, usr.telegramName));
    }
    
    async getAllUserDebts(telegramId: number): Promise<DebtDto> {
        const user = await this.userRepository.findOneOrFail({
                relations: ["orders", "orders.payments", "orders.payments.order", "orders.payments.order.pledge", "orders.payments.invoice", "orders.payments.invoice.pledge"],
                where: {telegramId: telegramId}
            }); //TODO: remove "orders.payments.order" etc. Preload or something
        
        const invoicesToPay = user.orders
            .flatMap(order => order.payments)
            .filter(p => p.status === PaymentStatus.NO_INFO && p.invoice.status === InvoiceStatus.TO_PAY)
            .map(pmnt => new InvoiceDto(pmnt.order.pledge.name, pmnt.invoice.name , pmnt.invoice.amount));

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
        console.log('===1', assignedUtids);
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
        const user = await this.userRepository.findOneOrFail({relations: ["orders", "orders.payments", "orders.payments.invoice"]})
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
        return user.orders.flatMap(ord => ord.payments)
            .some(p => p.status === PaymentStatus.NO_INFO && p.invoice.status === InvoiceStatus.TO_PAY)
    }

    private getIdentificationalAmount(user: User) : number {
        if(!user.utid){
            //throw new InternalServerErrorException(`Cannot get identificational amount of ${user.telegramName}`);
        }
        return (user.utid % 1000) / 100;
    }
}