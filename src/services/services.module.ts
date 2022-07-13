import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from 'src/common/middleware';
import { getEnvironmentData } from 'worker_threads';
import { UserController } from '../controllers/invoice.controller';
import { Module } from '@nestjs/common';
import { BalanceService } from './balance/balance.service';
import { UserService } from './user/user.service';
import { SheetsModule } from 'src/sheets/sheets.module';
import { InvoiceService } from './invoice/invoice.service';
import { PaymentService } from './payment/payment.service';
import { OrderService } from './order/order.service';

@Module({
  imports: [
    SheetsModule,
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
    BalanceService,
    InvoiceService,
    OrderService,
    PaymentService,
    UserService,
  ],
  controllers: [UserController],
  exports: [
    BalanceService,
    InvoiceService,
    OrderService,
    PaymentService,
    UserService,
  ],
})
@Module({})
export class ServiceModule {}
