import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { ADMIN_IDS } from 'src/constants';
import { Telegraf } from 'telegraf';
import { BalanceService } from './balance.service';
import { UserService } from './user.service';

@Injectable()
export class NotificationService {
  constructor(
    private _userService: UserService,
    private _financeService: BalanceService,
    @InjectBot() private bot: Telegraf<any>,
  ) {}

  async notifyDebtsToPay() {
    const debptors = await this._financeService.getDebptors();
    const knownDebptors = debptors.filter((d) => d.telegramId);
    const unknownDebptors = debptors.filter((d) => !d.telegramId);

    knownDebptors.forEach(async (debpt) => {
      try {
        const balance = NotificationService.escapeMessage(debpt.balance.toLocaleString());
        const message = `Вы должны ${balance} рублей денях\n*Копейки важны\\!* Напишите _/help_ для инструкции по переводу`;
        this.bot.telegram.sendMessage(debpt.telegramId, message, {
          parse_mode: 'MarkdownV2',
        });
        await this.delay(100);
      } catch (e) { // TODO: why dont catch Error: 403: Forbidden: bot was blocked by the user
        console.log('ERROR', e);
        console.log('MSG', message);
      }
    });

    console.log('note to admins');
    let message = `Напомнено о долге ${knownDebptors.length} морячкам.`;
    if (unknownDebptors.length > 0) {
      message += `\n\nОбнаружены дезертиры:\n${unknownDebptors
        .map((d) => d.name)
        .join('\n')}`;
    }
    await this.notifyAdmins(message);
  }

  async notifyAdmins(message: string) {
    message = NotificationService.escapeMessage(message);
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
      .replace('_', '\\_')
      .replace('*', '\\*')
      .replace('[', '\\[')
      .replace(']', '\\]')
      .replace('(', '\\(')
      .replace(')', '\\)')
      .replace('~', '\\~')
      .replace('`', '\\`')
      .replace('>', '\\>')
      .replace('#', '\\#')
      .replace('+', '\\+')
      .replace('-', '\\-')
      .replace('=', '\\=')
      .replace('|', '\\|')
      .replace('{', '\\{')
      .replace('}', '\\}')
      .replace('.', '\\.')
      .replace('!', '\\!');
  }
}
