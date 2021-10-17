import { PaymentStatus as PaymentStatus } from 'src/constants/payment-status';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Timestamp } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Order } from './order.entity';

@Entity()
export class Payment{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: PaymentStatus,
        default: PaymentStatus.NO_INFO
    })
    status: PaymentStatus;
    
    @ManyToOne(() => Order, order => order.payments, {eager: true})
    order: Order;

    @ManyToOne(() => Invoice, inv => inv.userPayments, {eager: true})
    invoice: Invoice;
}