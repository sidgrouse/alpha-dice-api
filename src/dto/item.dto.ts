import { InvoiceDto } from './invoice.dto';

export class ItemDto {
  constructor(
    public id: number,
    public name: string,
    public originalPrice: number,
    public discountPrice: number,
    public userOrders: string[],
    public invoices: InvoiceDto[],
  ) {}
}
