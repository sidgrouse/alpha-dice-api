import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
@Module({})
export class InvoicesModule {}
