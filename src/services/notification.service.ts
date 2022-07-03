import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { FinanceService } from './finance.service';
import { UserService } from './user.service';

@Injectable()
export class NotificationService {
  constructor(
    private _userService: UserService,
    private _financeService: FinanceService,
    @InjectBot() private bot: Telegraf<any>,
  ) {}

  async notifyDebtsToPay() {
    const debptors = await this._financeService.getDebptors();
    debptors.forEach(async (debpt) => {
      let message = `Вы должны ${debpt.balance.toLocaleString()} рублей денях\n*Копейки важны\\!* Напишите _/help_ для инструкции по переводу`.replace('.','\\.');
      this.bot.telegram.sendMessage(debpt.telegramId, message, {
        parse_mode: 'MarkdownV2',
      });
    });

    await this.delay(100);
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

//replace:
//'_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'