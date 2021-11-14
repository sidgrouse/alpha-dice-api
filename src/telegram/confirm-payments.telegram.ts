import { UseFilters } from '@nestjs/common';
import {
  Ctx,
  Help,
  Command,
  Message,
  Scene,
  SceneEnter,
  On,
} from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { TelegramHelper } from 'src/common/telegram-helper';
import { SceneNames } from 'src/constants';
import { BankService } from 'src/services/bank.service';

@UseFilters(TelegrafExceptionFilter)
@Scene(SceneNames.CONFIRM_PAYMENT)
export class ConfirmPaymentTgScene {
  constructor(private _bankService: BankService) {}

  @SceneEnter()
  onSceneEnter(): string {
    return 'Скопируй сюда логи из Тинькофф\n/cancel - назад в главное меню';
  }

  @Help()
  async onHelp(): Promise<string> {
    return 'Send Tinkof logs\n/cancel - назад в главное меню';
  }

  @Command('cancel')
  async onCancel(@Ctx() context: SceneCtx) {
    await context.scene.leave();
    return 'Гаааля, отмену сделай!';
  }

  @On('text')
  async onMessage(@Message() messageObject: any, @Ctx() context: SceneCtx) {
    const message: string = messageObject.text;
    if (message.startsWith('/')) {
      return;
    }

    const payments = await this._bankService.parseLogs(message);
    payments.forEach(async (p) => {
      const user = p.user.telegramName;
      p.log = '';
      p.user = null;
      const text = ` <b>${user}</b> ` + JSON.stringify(p);
      console.log('---', text);
      await context.replyWithHTML(text);
    });
    context.scene.leave();
    return null;
  }
}
