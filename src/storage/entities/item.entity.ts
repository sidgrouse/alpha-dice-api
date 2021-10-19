import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, ManyToOne } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Order } from './order.entity';
import { Project } from './project.entity';

@Entity()
export class Item{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50, unique: true})
    name: string;

    @Column({nullable: true})
    originalPrice: number;
    
    @Column({ length: 3, default: 'USD'})
    originalCurrencyIsoCode: string; //TODO: so currency conv can be added later

    @Column({nullable: true})
    priceK1rub: number; //TODO: discuss, add other price parts

    @Column({length: 100, nullable: true})
    details: string;

    @OneToMany(_ => Order, order => order.item)
    orders: Order[];

    @OneToMany(_ => Invoice, inv => inv.pledge)
    invoices: Invoice[];

    @ManyToOne(_ => Project, proj => proj.items, {eager: true}) //TODO: use https://github.com/bashleigh/typeorm-polymorphic ?
    project: Project;
}