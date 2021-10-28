import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from '../controllers/invoice.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from 'src/common/middleware';
import { getEnvironmentData } from 'worker_threads';

import { MainTgScene } from '../telegram/main.telegram';
import {
  AddInvoiceTgScene,
  DetailsAddInvoiceTgScene,
} from 'src/telegram/add-invoice.telegram';
import { AddOrderTgScene } from 'src/telegram/add-order.telegram';

import { User } from 'src/storage/entities/user.entity';
import { Item } from 'src/storage/entities/item.entity';
import { Order } from '../storage/entities/order.entity';
import { Invoice } from 'src/storage/entities/invoice.entity';
import { Project } from 'src/storage/entities/project.entity';
import { Debt } from 'src/storage/entities/debt.entity';

import { InvoiceService } from './invoice.service';
import { UserService } from './user.service';
import { DeclarePaymentTgScene } from 'src/telegram/declare-payment.telegram';
import { AddProjectTgSceneController as AddProjectTgScene } from 'src/telegram/add-project.telegram';
import { ProjectService } from './project.service';
import { BankService } from './bank.service';
import { ConfirmPaymentTgScene } from 'src/telegram/confirm-payments.telegram';
import { Payment } from 'src/storage/entities/payment.entity';

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
    ConfigModule.forRoot({ envFilePath: 'development.env' }),
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
  providers: [
    InvoiceService,
    UserService,
    ProjectService,
    BankService,
    MainTgScene,
    AddInvoiceTgScene,
    AddOrderTgScene,
    DeclarePaymentTgScene,
    AddProjectTgScene,
    DetailsAddInvoiceTgScene,
    ConfirmPaymentTgScene,
  ],
  controllers: [InvoiceController],
  exports: [InvoiceService, UserService, ProjectService, BankService],
})
@Module({})
export class ServiceModule {}
