import { InvoicesModule } from 'src/invoice/invoices.module';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity()
export class User{
    @PrimaryColumn()
    telegramId: number;

    @Column({length: 50})
    name: string;

    @Column({length: 50, nullable: true})
    city: string;

    @Column({length: 500, nullable: true})
    fullPostalAddress: string;

    @OneToMany(type => Invoice, inv => inv.user)
    invoices: Invoice[]
}