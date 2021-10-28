import { type } from 'os';
import { InvoiceStatus } from 'src/constants/invoice-status';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Debt as Debt } from './payment.entity';
import { Item as Item } from './item.entity';

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

    @Column({default: 'K1'})
    name: string

    @ManyToOne(() => Item, {cascade: true, eager: true})
    pledge: Item;

    @OneToMany(() => Debt, pmnt =>pmnt.invoice, {cascade: true})
    userDebts: Debt[];
}