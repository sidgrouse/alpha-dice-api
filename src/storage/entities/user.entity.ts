import { InvoicesModule } from 'src/services/services.module';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number

    @Index("IDX_user_telegramId")
    @Column({unique: true})
    telegramId: number;

    @Index("IDX_user_telegramName")
    @Column({length: 50, unique: true})
    telegramName: string;

    @Column({nullable: true}) //unique in the future
    fractionalAddition: number;

    @Column({length: 50, nullable: true})
    firstName: string;

    @Column({length: 50, nullable: true})
    city: string;

    @Column({length: 500, nullable: true})
    fullPostalAddress: string;

    @OneToMany(type => Order, inv => inv.user)
    orders: Order[]
}