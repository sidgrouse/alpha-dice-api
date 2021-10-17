import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { Order } from './entities/order.entity';
import { User } from './entities/user.entity';
import { Pledge } from './entities/pledge.entity';
import { Invoice } from './entities/invoice.entity';
import { Project } from './entities/project.entity';
import { Payment } from './entities/payment.entity';
import { DB_NAME } from 'src/constants';

@Module({imports: [
    TypeOrmModule.forRoot({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: DB_NAME,
        migrations: ["migrations/*.js"],
        cli: {
          migrationsDir: "migrations"
        },
        entities: [User, Pledge, Order, Invoice, Project, Payment],
        synchronize: true
      }),
    ]})
export class StorageModule {}
