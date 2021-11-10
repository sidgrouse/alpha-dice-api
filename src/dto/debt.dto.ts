import { InvoiceItemDto } from './invoice-item.dto';

export class DebtDto {
  constructor(
    public invoices: InvoiceItemDto[],
    public identificationalAmount: number,
  ) {}

  getTotal(): string {
    return this.invoices
      .reduce((sum, inv) => sum + inv.amount, this.identificationalAmount)
      .toFixed(2);
  }
}
