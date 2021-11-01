import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from 'src/common/middleware';
import { getEnvironmentData } from 'worker_threads';

import { User } from 'src/storage/entities/user.entity';
import { Item } from 'src/storage/entities/item.entity';
import { Order } from '../storage/entities/order.entity';
import { Invoice } from 'src/storage/entities/invoice.entity';
import { Project } from 'src/storage/entities/project.entity';
import { Debt } from 'src/storage/entities/debt.entity';

import { InvoiceService } from './invoice.service';
import { UserService } from './user.service';
import { ProjectService } from './project.service';
import { BankService } from './bank.service';
import { Payment } from 'src/storage/entities/payment.entity';
import { InvoiceController } from '../controllers/invoice.controller';
import { ProjectController } from 'src/controllers/project.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Item,
      Order,
      Invoice,
      Project,
      Debt,
      Payment,
    ]),
    ConfigModule.forRoot({
      envFilePath: ['development.env', 'local.development.env'],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token:
          configService.get('TELEGRAM_BOT_TOKEN') ||
          getEnvironmentData('TELEGRAM_BOT_TOKEN').toString(),
        middlewares: [sessionMiddleware],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [InvoiceService, UserService, ProjectService, BankService],
  controllers: [InvoiceController, ProjectController], //TODO: move out
  exports: [InvoiceService, UserService, ProjectService, BankService],
})
@Module({})
export class ServiceModule {}
