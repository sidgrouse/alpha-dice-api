import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { CRON_INVOICE_NOTIFICSTIONS as CRON_INVOICE_NOTIFICATIONS } from './constants';
import { InvoiceService } from './invoice/invoice.service';

@Injectable()
export class TasksService {
  constructor(
    private _invoiceService: InvoiceService,
    @InjectBot() private bot: Telegraf<any>,
  ) {}

  @Cron(CRON_INVOICE_NOTIFICATIONS)
  async handleCron() {
    const allInvoices = await this._invoiceService.getAllUserInvoices(
      'k_matroskin',
    );
    this.bot.telegram.sendMessage(
      1098810534,
      `time to pay for ${allInvoices.map((itm) => itm.pledjeId).join(',')}`,
    );
  }
}
