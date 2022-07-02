import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_NAME } from 'src/constants';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: DB_NAME,
      migrations: ['migrations/*.js'],
      cli: {
        migrationsDir: 'migrations',
      },
      entities: [],
      synchronize: true,
    }),
  ],
})
export class StorageModule {}
