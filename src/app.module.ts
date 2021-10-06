import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_NAME } from './constants';
import { InvoicesModule } from './invoice/invoices.module';
import { Invoice } from './invoice/invoice.entity';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task.service';

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
      entities: [Invoice],
      synchronize: true
    }),
    InvoicesModule,
    ConfigModule
  ],
  providers: [TasksService]
})
export class AppModule {}
