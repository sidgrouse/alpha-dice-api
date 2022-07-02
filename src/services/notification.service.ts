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
      const chatId = await this._userService.getTelegramIdByName(debpt.userName);
      let message = 'здрасьте, я коллектор';
      message = message.replace(/\./g, ',');
      this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'MarkdownV2',
      });
    });

    await this.delay(100);
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
