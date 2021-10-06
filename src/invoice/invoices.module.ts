import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './invoice.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { InvoiceTgController } from './invoice.telegram';
import { AddInvoiceTgSceneController } from './add-invoice.telegram';
import { sessionMiddleware } from 'src/common/middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice]),
  ConfigModule.forRoot({envFilePath: 'development.env'}),
  TelegrafModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
          token: configService.get('TELEGRAM_BOT_TOKEN'),
          middlewares: [sessionMiddleware]
      }),
      inject: [ConfigService]
  })],
  providers: [InvoiceService, InvoiceTgController, AddInvoiceTgSceneController],
  controllers: [InvoiceController],
})
@Module({})
export class InvoicesModule {}
