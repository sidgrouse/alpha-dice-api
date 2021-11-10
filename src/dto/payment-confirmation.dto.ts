import { InvoiceItemDto } from './invoice-item.dto';

export class PaymentConfirmationDto {
  constructor(
    public telegramName: string,
    public isFulfilled: boolean,
    public invoices: InvoiceItemDto[],
    public payments: PaymentDto[],
  ) {}
}

export class PaymentDto {
  constructor(
    public telegramId: number,
    public amount: number,
    public log: string,
  ) {}
}
