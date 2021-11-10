import { InvoiceStatus } from 'src/constants/invoice-status';

export class InvoiceDto {
  constructor(
    public invoiceName: string,
    public amount: number,
    public status: InvoiceStatus,
  ) {}
}
