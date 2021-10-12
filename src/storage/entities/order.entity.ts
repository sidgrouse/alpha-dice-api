import { InvoiceStatus } from 'src/constants/invoice-status';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Payment } from './payment.entity';
import { Pledge } from './pledge.entity';
import { User } from './user.entity';

@Entity()
export class Order{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 1})
    count: number;

    @ManyToOne(() => User, user => user.orders, {eager: true})
    user: User;

    @ManyToOne(() => Pledge)
    pledge: Pledge;

    @OneToMany(type => Payment, payment => payment.order, {cascade: true})
    payments: Payment[]
}