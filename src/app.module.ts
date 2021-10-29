import { Module } from '@nestjs/common';
import { ServiceModule } from './services/services.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService as TaskService } from './services/task.service';
import { StorageModule } from './storage/storage.module';
import { NotificationsService as NotificationService } from './services/notification.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServiceModule,
    ConfigModule,
    StorageModule,
  ],
  providers: [TaskService, NotificationService],
})
export class AppModule {}
