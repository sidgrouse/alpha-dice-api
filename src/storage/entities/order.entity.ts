import { InvoiceStatus } from 'src/constants/invoice-status';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Debt } from './payment.entity';
import { Item } from './item.entity';
import { User } from './user.entity';

@Entity()
export class Order{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 1})
    count: number;

    @ManyToOne(() => User, user => user.orders, {eager: true})
    user: User;

    @ManyToOne(() => Item)
    item: Item;

    @OneToMany(type => Debt, payment => payment.order, {cascade: true})
    debts: Debt[]
}