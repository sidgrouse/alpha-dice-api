import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { InvoiceService } from './invoice.service';

@Injectable()
export class NotificationsService {
  constructor(
    private _invoiceService: InvoiceService,
    @InjectBot() private bot: Telegraf<any>,
  ) {}

  async notifyDebtsToPay() {
    const debptors = await this._invoiceService.getDebptors();
    debptors.forEach(async (user) => {
      const debt = await this._invoiceService.getUserDebtsToPay(
        user.telegramId,
      );
      const debtDetails = debt.invoices
        .map(
          (itm) =>
            `${itm.itemName}${
              itm.invoiceName ? '(' + itm.invoiceName + ') ' : ' '
            } ${itm.amount + debt.identificationalAmount}руб`,
        )
        .join('\n'); //TODO: helper?
      this.bot.telegram.sendMessage(
        user.telegramId,
        `Активные платежи за игры\nИтого: ${debt.getTotal()}\nДетали:${debtDetails}\n` +
          `Не забудьте добавить ${debt.identificationalAmount.toFixed(
            2,
          )} к каждому переводу для идентификации его как вашего\n\n` +
          `/declare_payment для подтверждения платежей`,
      );
      await this.delay(100);
    });
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
