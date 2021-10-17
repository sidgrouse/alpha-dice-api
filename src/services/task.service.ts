import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf';
import { CRON_INVOICE_NOTIFICSTIONS as CRON_INVOICE_NOTIFICATIONS } from '../constants';
import { InvoiceService } from './invoice.service';

@Injectable()
export class TasksService {

    constructor(private _invoiceService: InvoiceService, @InjectBot() private bot: Telegraf<any>){}

  @Cron(CRON_INVOICE_NOTIFICATIONS)
  async handleCron() {
    const debptors = await this._invoiceService.getDebptors();
    console.log('===cron==', debptors);
    return;
    debptors.forEach(async user => {
        const debt = await this._invoiceService.getAllUserDebts(user.telegramId);
        const userTotal = debt.invoices.reduce((sum, inv) => sum + inv.amount, debt.identificationalAmount).toFixed(2); //helper?
        const debtDetails = debt.invoices.map(itm => 
          `${itm.pledjeName}${itm.invoiceName ? '('+itm.invoiceName+') ' : ' '} ${itm.amount + debt.identificationalAmount}руб`)
          .join('\n'); //TODO: helper?
        this.bot.telegram.sendMessage(user.telegramId, 
          `Активные платежи за игры\nИтого:${userTotal}\nДетали:${debtDetails}\n` +
          `Не забудьте добавить ${debt.identificationalAmount.toFixed(2)} к каждому переводу для идентификации его как вашего\n` +
          `/declare_payment для подтверждения платежей`);
        await this.delay(100);
    });
    
  }

  private delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}