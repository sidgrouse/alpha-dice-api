import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Debt } from './debt.entity';

@Entity()
export class Payment{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    amount: number;

    @Column()
    log: string;

    @OneToMany(type => Debt, debt => debt.payment)
    debts: Debt[]
}