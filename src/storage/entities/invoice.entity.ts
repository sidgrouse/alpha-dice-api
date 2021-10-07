import { InvoiceStatus } from 'src/constants/invoice-status';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Pledge } from './pledge.entity';
import { User } from './user.entity';

@Entity()
export class Invoice{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int'}) //TODO: do properly https://typeorm.io/#/entities/enum-column-type
    status: InvoiceStatus;
    
    @ManyToOne(() => User, user => user.invoices, {cascade: true})
    user: User;

    @ManyToOne(() => Pledge, {cascade: true, eager: true})
    pledge: Pledge;
}