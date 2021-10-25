import { InvoiceDto } from './invoice.dto';

export class DebtDto {
  constructor(
    public invoices: InvoiceDto[],
    public identificationalAmount: number,
  ) {}

  getTotal(): string {
    return this.invoices
      .reduce((sum, inv) => sum + inv.amount, this.identificationalAmount)
      .toFixed(2);
  }
}
