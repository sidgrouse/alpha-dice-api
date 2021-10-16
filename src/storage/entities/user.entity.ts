import { ServiceModule } from 'src/services/services.module';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, Index, OneToOne } from 'typeorm';
import { Order } from './order.entity';
import { TempIdentifier } from './temp-identifier.entity';

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

    @Column({length: 50, nullable: true})
    firstName: string;

    @Column({length: 50, nullable: true})
    city: string;

    @Column({length: 500, nullable: true})
    fullPostalAddress: string;

    @OneToOne(_ => TempIdentifier, id => id.user, {nullable: true})
    fractionalAddition: TempIdentifier;

    @OneToMany(_ => Order, inv => inv.user)
    orders: Order[]
}