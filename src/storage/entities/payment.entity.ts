import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Debt } from './debt.entity';
import { User } from './user.entity';

@Entity()
export class Payment{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    amount: number;

    @Column()
    log: string;

    @Column()
    nameFrom: string;

    @OneToMany(_ => Debt, debt => debt.payment)
    debts: Debt[];

    @ManyToOne(_ => User, user => user.payments)
    user: User;
}