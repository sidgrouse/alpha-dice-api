import { PaymentStatus as PaymentStatus } from 'src/constants/payment-status';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Order } from './order.entity';
import { Payment } from './payment.entity';

@Entity()
export class Debt{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: PaymentStatus,
        default: PaymentStatus.NO_INFO
    })
    status: PaymentStatus;

    @ManyToOne(() => Payment, pmnt => pmnt.debts)
    payment: Payment;

    @ManyToOne(() => Order, order => order.debts, {eager: true})
    order: Order;

    @ManyToOne(() => Invoice, inv => inv.userDebts, {eager: true})
    invoice: Invoice;
}