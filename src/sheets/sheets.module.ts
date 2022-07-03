import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SpreadsheetService } from './spreadsheet.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['development.env', 'local.development.env'],
    })],
  providers: [SpreadsheetService],
  exports: [SpreadsheetService],
})
@Module({})
export class SheetsModule {}
