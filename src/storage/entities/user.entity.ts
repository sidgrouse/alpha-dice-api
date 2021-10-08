import { InvoicesModule } from 'src/invoice/invoices.module';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    telegramId: number;

    @Column({length: 50})
    telegramName: string;

    @Column({length: 50, nullable: true})
    firstName: string;

    @Column({length: 50, nullable: true})
    city: string;

    @Column({length: 500, nullable: true})
    fullPostalAddress: string;

    @OneToMany(type => Invoice, inv => inv.user)
    invoices: Invoice[]
}