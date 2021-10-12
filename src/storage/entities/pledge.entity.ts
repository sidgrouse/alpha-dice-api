import { InvoiceStatus } from 'src/constants/invoice-status';
import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Order } from './order.entity';

@Entity()
export class Pledge{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50, unique: true})
    shortName: string;

    @Column({length: 50, unique: true})
    name: string;

    @Column({nullable: true})
    originalPrice: number;
    
    @Column({ length: 3, default: 'USD'})
    originalCurrencyIsoCode: string; //TODO: so currency convestion can be added later

    @Column({nullable: true})
    estimatedPrice: number;

    @Column({length: 100, nullable: true})
    details: string;

    @OneToMany(type => Order, order => order.pledge)
    orders: Order[];

    @OneToMany(type => Invoice, inv => inv.pledge)
    invoices: Invoice[];

    //project
}