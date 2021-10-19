import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from '../controllers/invoice.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from 'src/common/middleware';
import { getEnvironmentData } from 'worker_threads';

import { MainTgScene } from '../telegram/main.telegram';
import { AddInvoiceTgScene } from 'src/telegram/add-invoice.telegram';
import { AddOrderTgScene } from 'src/telegram/add-order.telegram';

import { User } from 'src/storage/entities/user.entity';
import { Item } from 'src/storage/entities/item.entity';
import { Order } from '../storage/entities/order.entity';
import { Invoice } from 'src/storage/entities/invoice.entity';
import { Project } from 'src/storage/entities/project.entity';
import { Debt } from 'src/storage/entities/payment.entity';

import { InvoiceService } from './invoice.service';
import { UserService } from './user.service';
import { DeclarePaymentTgScene } from 'src/telegram/declare-payment.telegram';
import { AddProjectTgSceneController as AddProjectTgScene } from 'src/telegram/add-project.telegram';
import { ProjectService } from './project.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Item, Order, Invoice, Project, Debt]),
  ConfigModule.forRoot({envFilePath: 'development.env'}),
  TelegrafModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
          token: configService.get('TELEGRAM_BOT_TOKEN') || getEnvironmentData('TELEGRAM_BOT_TOKEN').toString(),
          middlewares: [sessionMiddleware]
      }),
      inject: [ConfigService]
  })],
  providers: [InvoiceService, UserService, ProjectService, MainTgScene, AddInvoiceTgScene, AddOrderTgScene, DeclarePaymentTgScene, AddProjectTgScene],
  controllers: [InvoiceController],
  exports: [InvoiceService, UserService, ProjectService]
})
@Module({})
export class ServiceModule {}
