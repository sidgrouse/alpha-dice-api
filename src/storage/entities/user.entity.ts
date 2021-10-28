import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { Payment } from './payment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_user_telegramId')
  @Column({ unique: true })
  telegramId: number;

  @Index('IDX_user_telegramName')
  @Column({ length: 50, unique: true })
  telegramName: string;

  @Column({ length: 50, nullable: true })
  firstName: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 500, nullable: true })
  fullPostalAddress: string;

  @Column({ nullable: true, unique: true })
  utid: number;

  @OneToMany(() => Order, (inv) => inv.user)
  orders: Order[];

  @OneToMany(() => Payment, (pmnt) => pmnt.user)
  payments: Payment[];
}
