import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_NAME } from './constants';
import { InvoicesModule } from './invoice/invoices.module';
import { Invoice } from './invoice/invoice.entity';
import { TelegramModule } from './telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { ActionsModule } from './actions/actions.module';

@Module({
  imports: [
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
    TelegramModule,
    ActionsModule
  ]
})
export class AppModule {}
