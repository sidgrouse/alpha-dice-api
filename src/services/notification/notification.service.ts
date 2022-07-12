import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { ADMIN_IDS } from 'src/constants';
import { InvoiceStatus } from 'src/constants/invoice-status';
import { Telegraf } from 'telegraf';
import { BalanceService } from '../balance/balance.service';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class NotificationService {
  constructor(
    private _invoiceService: InvoiceService,
    private _financeService: BalanceService,
    @InjectBot() private bot: Telegraf<any>,
  ) {}

  async notifyDebtsToPay() {
    const debptors = await this._financeService.getDebptors();
    const knownDebptors = debptors.filter((d) => d.telegramId);
    const unknownDebptors = debptors.filter((d) => !d.telegramId);

    await Promise.allSettled(
      knownDebptors.map(async (debpt) => {
        try {
          const balance = NotificationService.escapeMessage(
            debpt.balance.toLocaleString(),
          );
          const message = `Вы должны ${balance} рублей денях\n*Копейки важны\\!* Напишите _/help_ для инструкции по переводу`;
          await this.bot.telegram.sendMessage(debpt.telegramId, message, {
            parse_mode: 'MarkdownV2',
          });
        } catch (e) { // TODO: check catch Error: 403: Forbidden: bot was blocked by the user
          console.log('ERROR', e);
          unknownDebptors.push(debpt);
        }
      }),
    );

    let message = `Напомнено о долге ${knownDebptors.length} морячкам.`;
    if (unknownDebptors.length > 0) {
      message += `\n\nОбнаружены дезертиры:\n${unknownDebptors
        .map((d) => d.name)
        .join('\n')}`;
    }
    await this.notifyAdmins(message);
  }

  async notifyNewInvoices() {
    const newInvoices = await this._invoiceService.getNewInvoices();

    if (newInvoices.length == 0) {
      return;
    }
    const knownInvoices = newInvoices.filter((d) => d.userId);
    const unknownInvoices = newInvoices.filter((d) => !d.userId);

    await Promise.allSettled(
      knownInvoices.map(async (invoice) => {
        try {
          const balance = NotificationService.escapeMessage(
            invoice.content.total.toLocaleString(),
          );
          // eslint-disable-next-line prettier/prettier
          const message = `✏ Обнаружен новый инвойс за *${NotificationService.escapeMessage(invoice.content.item)}* \\(${NotificationService.escapeMessage(invoice.content.comment)}\\)\n${balance} рублей\\.`;
          await this.bot.telegram.sendMessage(invoice.userId, message, {
            parse_mode: 'MarkdownV2',
          });

          invoice.content.status = InvoiceStatus.NOTIFIED;
          invoice.content.save();
        } catch (e) {
          console.log('ERROR', e);
          unknownInvoices.push(invoice);
        }
      }),
    );

    unknownInvoices.forEach((x) => {
      x.content.status = InvoiceStatus.PROBLEMS;
      x.content.save();
    });

    let message = `Разослано ${knownInvoices.length} инвойсов.`;
    if (unknownInvoices.length > 0) {
      message += `\n\nОбнаружены проблемные инвойсы:\n${unknownInvoices
        // eslint-disable-next-line prettier/prettier
        .map((x) => `${x.content.name} ${(x.content.item)}`)
        .join('\n')}`;
    }
    await this.notifyAdmins(message);
  }

  async notifyAdmins(message: string) {
    message = '*ADMIN NOTIFICATION*\n' + NotificationService.escapeMessage(message);
    console.log('ADMIN NOTE', message);
    ADMIN_IDS.forEach(async (id) => this.bot.telegram.sendMessage(id, message, {
        parse_mode: 'MarkdownV2',
      }),
    );
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static escapeMessage(message: string) {
    //'_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
    return message
      .replaceAll('_', '\\_')
      .replaceAll('*', '\\*')
      .replaceAll('[', '\\[')
      .replaceAll(']', '\\]')
      .replaceAll('(', '\\(')
      .replaceAll(')', '\\)')
      .replaceAll('~', '\\~')
      .replaceAll('`', '\\`')
      .replaceAll('>', '\\>')
      .replaceAll('#', '\\#')
      .replaceAll('+', '\\+')
      .replaceAll('-', '\\-')
      .replaceAll('=', '\\=')
      .replaceAll('|', '\\|')
      .replaceAll('{', '\\{')
      .replaceAll('}', '\\}')
      .replaceAll('.', '\\.')
      .replaceAll('!', '\\!');
  }
}