// REMOVE?
import { InvoiceItemDto } from './invoice-item.dto';
import { PaymentDto } from './payment.dto';

export class UserPaymentLogDto {
  constructor(
    public userId: number,
    public telegramId: number,
    public telegramName: string,
    public linkedPayments: PaymentDto[],
    public paymentsToCheck: PaymentDto[],
    public invoicesToCheck: InvoiceItemDto[],
  ) {}

  getTotalToLink(): number {
    return this.invoicesToCheck.reduce((sum, inv) => sum + inv.amount, 0);
  }
}
