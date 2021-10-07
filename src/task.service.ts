import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf';
import { CRON_INVOICE_NOTIFICSTIONS as CRON_INVOICE_NOTIFICATIONS } from './constants';
import { InvoiceService } from './invoice/invoice.service';
import { User } from './storage/entities/user.entity';

@Injectable()
export class TasksService {

    constructor(private _invoiceService: InvoiceService, @InjectBot() private bot: Telegraf<any>){}

  @Cron(CRON_INVOICE_NOTIFICATIONS)
  async handleCron() {
    const debptors = await this._invoiceService.getDebptors();
    console.log('===cron==', debptors);
    debptors.forEach(async user => {
        const invoices = await this._invoiceService.getAllUserInvoices(user.telegramId);
        this.bot.telegram.sendMessage(user.telegramId, `time to pay ${invoices.reduce((sum, inv) => sum + inv.priceToPay, 0)} for ${invoices.map(itm => itm.pledjeName).join(', ')}`);
    });
    
  }
}