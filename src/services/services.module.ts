import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from 'src/common/middleware';
import { getEnvironmentData } from 'worker_threads';
import { FinanceController } from '../controllers/invoice.controller';
import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { UserService } from './user.service';
import { SheetsModule } from 'src/sheets/sheets.module';

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
  providers: [FinanceService, UserService],
  controllers: [FinanceController],
  exports: [FinanceService, UserService],
})
@Module({})
export class ServiceModule {}
