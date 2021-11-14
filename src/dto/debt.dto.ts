import { InvoiceItemDto } from './invoice-item.dto';

export class DebtDto {
  constructor(
    public invoices: InvoiceItemDto[],
    public identificationalAmount: number,
  ) {}

  getTotalString(): string {
    return this.invoices
      .reduce((sum, inv) => sum + inv.amount, this.identificationalAmount)
      .toFixed(2);
  }
}
