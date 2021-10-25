import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateInvoiceDto } from 'src/dto/create-invoice.dto';
import { InvoiceDto } from 'src/dto/invoice.dto';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDto> {
    //TODO: add validation
    return this.invoiceService.addInvoice(createInvoiceDto);
  }

  @Get()
  async getAllInvoices(): Promise<InvoiceDto[]> {
    return this.invoiceService.getAllInvoices();
  }
}
