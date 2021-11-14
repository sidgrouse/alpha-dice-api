import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Debt } from './debt.entity';
import { User } from './user.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  amount: number;

  @Column({ nullable: true })
  log: string;

  @Column({ nullable: true })
  nameFrom: string;

  @Column({ type: 'datetime', nullable: true })
  payDate: Date;

  @Column({ default: false })
  confirmed: boolean;

  @OneToMany(() => Debt, (debt) => debt.payment)
  debts: Debt[];

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
