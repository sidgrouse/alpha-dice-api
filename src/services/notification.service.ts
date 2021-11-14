import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { InvoiceService } from './invoice.service';

@Injectable()
export class NotificationService {
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
            `❗ *${itm.project}* _${itm.itemName}_ ${itm.invoiceName} \\- ` +
            `${itm.amount + debt.identificationalAmount}руб`,
        )
        .join('\n'); //TODO: helper?
      let message =
        `*Активные платежи за игры*\nИтого: ${debt.getTotal()}\nДетали:\n${debtDetails}\n\n` +
        `Не забудьте добавить ${debt.identificationalAmount.toFixed(
          2,
        )} к каждому переводу для идентификации его как вашего\n\n` +
        `/declare\\_payment для подтверждения платежей`;
      message = message.replace(/\./g, ',');
      this.bot.telegram.sendMessage(user.telegramId, message, {
        parse_mode: 'MarkdownV2',
      });
      await this.delay(100);
    });
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
