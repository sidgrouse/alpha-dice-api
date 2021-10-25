import { InvoiceStatus } from 'src/constants/invoice-status';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  userId: string;

  @Column('int')
  pledjeId: number;

  @Column('int')
  status: InvoiceStatus;
}
