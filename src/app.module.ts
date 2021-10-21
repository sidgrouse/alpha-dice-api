import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_NAME } from './constants';
import { ServiceModule } from './services/services.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './services/task.service';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServiceModule,
    ConfigModule,
    StorageModule
  ],
  providers: [TasksService]
})
export class AppModule {}
