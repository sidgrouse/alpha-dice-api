import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from 'src/common/middleware';
import { getEnvironmentData } from 'worker_threads';

import { MainTgScene } from '../telegram/main.telegram';
import { ServiceModule } from 'src/services/services.module';
import { HelpTgScene } from './help.telegram';

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
  providers: [MainTgScene, HelpTgScene],
  exports: [],
})
@Module({})
export class TelegramModule {}
