import { Module } from '@nestjs/common';
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

import { DeclarePaymentTgScene } from 'src/telegram/declare-payment.telegram';
import {
  AddProjectTgScene,
  AddProjectItemsTgScene,
} from 'src/telegram/add-project.telegram';
import { ConfirmPaymentTgScene } from 'src/telegram/confirm-payments.telegram';
import { ServiceModule } from 'src/services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'development.env' }),
    ServiceModule,
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
    MainTgScene,
    AddInvoiceTgScene,
    AddOrderTgScene,
    DeclarePaymentTgScene,
    AddProjectTgScene,
    DetailsAddInvoiceTgScene,
    ConfirmPaymentTgScene,
    AddProjectItemsTgScene,
  ],
  exports: [],
})
@Module({})
export class TelegramModule {}
