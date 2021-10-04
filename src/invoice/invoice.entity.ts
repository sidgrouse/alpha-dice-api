import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { InvoiceStatus } from "./invoice-status";

@Entity()
export class Invoice{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 500})
    userId: string;

    @Column('int')
    pledjeId: number;
    
    @Column('int')
    status: InvoiceStatus;
}