import { InvoiceStatus } from 'src/constants/invoice-status';

export class InvoiceDto {
  constructor(
    public name: string,
    public item: string,
    public amount: number,
    public comment: string,
    public total: number,
    public status: InvoiceStatus,
    public date: string,
  ) {}
}
