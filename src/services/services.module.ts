import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from '../controllers/invoice.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from 'src/common/middleware';

import { InvoiceTgController } from '../telegram/invoice.telegram';

import { User } from 'src/storage/entities/user.entity';
import { Pledge } from 'src/storage/entities/pledge.entity';
import { Order } from '../storage/entities/order.entity';
import { Invoice } from 'src/storage/entities/invoice.entity';
import { Project } from 'src/storage/entities/project.entity';
import { Payment } from 'src/storage/entities/payment.entity';
import { getEnvironmentData } from 'worker_threads';
import { AddInvoiceTgSceneController } from 'src/telegram/add-invoice.telegram';
import { AddOrderTgSceneController } from 'src/telegram/add-order.telegram';

@Module({
  imports: [TypeOrmModule.forFeature([User, Pledge, Order, Invoice, Project, Payment]),
  ConfigModule.forRoot({envFilePath: 'development.env'}),
  TelegrafModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
          token: configService.get('TELEGRAM_BOT_TOKEN') || getEnvironmentData('TELEGRAM_BOT_TOKEN').toString(),
          middlewares: [sessionMiddleware]
      }),
      inject: [ConfigService]
  })],
  providers: [InvoiceService, InvoiceTgController, AddInvoiceTgSceneController, AddOrderTgSceneController],
  controllers: [InvoiceController],
  exports: [InvoiceService]
})
@Module({})
export class InvoicesModule {}
