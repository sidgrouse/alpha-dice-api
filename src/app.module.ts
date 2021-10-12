import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_NAME } from './constants';
import { InvoicesModule } from './services/services.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './services/task.service';

import { Order } from './storage/entities/order.entity';
import { User } from './storage/entities/user.entity';
import { Pledge } from './storage/entities/pledge.entity';
import { Invoice } from './storage/entities/invoice.entity';
import { Project } from './storage/entities/project.entity';
import { Payment } from './storage/entities/payment.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: DB_NAME,
      migrations: ["storage/migrations/*.js"],
      cli: {
        migrationsDir: "storage/migrations"
      },
      entities: [User, Pledge, Order, Invoice, Project, Payment],
      synchronize: true
    }),
    InvoicesModule,
    ConfigModule
  ],
  providers: [TasksService]
})
export class AppModule {}
