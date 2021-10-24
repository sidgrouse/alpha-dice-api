import { DebtStatus as DebtStatus } from 'src/constants/debt-status';
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
        enum: DebtStatus,
        default: DebtStatus.NO_INFO
    })
    status: DebtStatus;

    @ManyToOne(() => Payment, pmnt => pmnt.debts)
    payment: Payment;

    @ManyToOne(() => Order, order => order.debts, {eager: true})
    order: Order;

    @ManyToOne(() => Invoice, inv => inv.userDebts, {eager: true})
    invoice: Invoice;
}