import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Debt } from './debt.entity';
import { User } from './user.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  log: string;

  @Column()
  nameFrom: string;

  @Column({ type: 'timestamptz' })
  payDate: Date;

  @OneToMany(() => Debt, (debt) => debt.payment)
  debts: Debt[];

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
