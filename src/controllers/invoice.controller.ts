import { Controller, Get, Param } from '@nestjs/common';
import { InvoiceDto } from 'src/dto/invoice.dto';
import { InvoiceService } from 'src/services/invoice/invoice.service';

@Controller('user')
export class UserController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get(':id/invoices')
  async getInvoices(@Param('id') id: string): Promise<InvoiceDto[]> {
    const invoices = await this.invoiceService.getUserInvoices(id);
    return invoices.map(
      (x) =>
        new InvoiceDto(
          x.name,
          x.item,
          x.amount,
          x.comment,
          x.total,
          x.status,
          x.date,
        ),
    );
  }
}
