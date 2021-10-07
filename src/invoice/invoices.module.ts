import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { InvoiceTgController } from './invoice.telegram';
import { AddInvoiceTgSceneController } from './add-invoice.telegram';
import { sessionMiddleware } from 'src/common/middleware';
import { User } from 'src/storage/entities/user.entity';
import { Pledge } from 'src/storage/entities/pledge.entity';
import { Invoice } from '../storage/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, User, Pledge]),
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
  exports: [InvoiceService]
})
@Module({})
export class InvoicesModule {}
