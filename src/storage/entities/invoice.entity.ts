import { type } from 'os';
import { InvoiceStatus } from 'src/constants/invoice-status';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Payment } from './payment.entity';
import { Pledge as Pledge } from './pledge.entity';
import { User } from './user.entity';

@Entity()
export class Invoice{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: InvoiceStatus,
        default: InvoiceStatus.NO_INFO
    })
    status: InvoiceStatus;
    
    @Column({default: 0})
    amount: number

    @Column({default: 'base'})
    name: string

    @ManyToOne(() => Pledge, {cascade: true, eager: true})
    pledge: Pledge;

    @OneToMany(() => Payment, pmnt =>pmnt.invoice, {cascade: true})
    userPayments: Payment[];
}