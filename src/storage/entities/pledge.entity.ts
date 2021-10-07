import { InvoiceStatus } from 'src/constants/invoice-status';
import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique('UQ_pledgeName', ['pledgeName'])
export class Pledge{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50})
    pledgeName: string;

    @Column({length: 50})
    projectName: string;

    @Column()
    fullPrice: number;

    @Column({length: 100, nullable: true})
    details: string;
}