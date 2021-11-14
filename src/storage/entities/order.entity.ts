import { OrderStatus } from 'src/constants/order-status';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Debt } from './debt.entity';
import { Item } from './item.entity';
import { User } from './user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  count: number;

  @Column({ default: OrderStatus.NO_INFO })
  status: OrderStatus;

  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  user: User;

  @ManyToOne(() => Item)
  item: Item;

  @OneToMany(() => Debt, (payment) => payment.order, { cascade: true })
  debts: Debt[];
}
