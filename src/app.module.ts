import { Module } from '@nestjs/common';
import { ServiceModule } from './services/services.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService as TaskService } from './services/task.service';
//import { StorageModule } from './storage/storage.module';
import { NotificationService } from './services/notification.service';
import { TelegramModule } from './telegram/telegram.module';
import { SheetsModule } from './sheets/sheets.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServiceModule,
    ConfigModule,
    //StorageModule,
    TelegramModule,
    SheetsModule,
  ],
  providers: [TaskService, NotificationService],
  exports: [NotificationService],
})
export class AppModule {}
