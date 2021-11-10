import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { Order } from './order.entity';
import { Project } from './project.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ nullable: true })
  originalPrice: number;

  @Column({ length: 3, default: 'USD' })
  originalCurrencyIsoCode: string; //TODO: so currency conv can be added later

  @Column({ nullable: true })
  discountPrice: number;

  @Column({ length: 100, nullable: true })
  details: string;

  @OneToMany(() => Order, (order) => order.item)
  orders: Order[];

  @OneToMany(() => Invoice, (inv) => inv.item)
  invoices: Invoice[];

  @ManyToOne(() => Project, (proj) => proj.items, { eager: true }) //TODO: use https://github.com/bashleigh/typeorm-polymorphic ?
  project: Project;
}
