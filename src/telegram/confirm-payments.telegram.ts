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
import { SceneNames } from 'src/constants';
import { BankService } from 'src/services/bank.service';

@UseFilters(TelegrafExceptionFilter)
@Scene(SceneNames.CONFIRM_PAYMENT)
export class ConfirmPaymentTgScene {
  constructor(private _bankService: BankService) {}

  @SceneEnter()
  onSceneEnter(): string {
    return 'Логи сюда\n/cancel - назад в главное меню'; ///////////////////////
  }

  @Help()
  async onHelp(): Promise<string> {
    return 'Send Tinkof logs\n/cancel - назад в главное меню';
  }

  @Command('cancel')
  async onCancel(@Ctx() context: SceneCtx) {
    await context.scene.leave();
    return 'back to main menu';
  }

  @On('text')
  async onMessage(@Message() messageObject: any) {
    const message: string = messageObject.text;
    if (message.startsWith('/')) {
      return;
    }

    const cnt = await this._bankService.parseLogs(message);
    return cnt ? `${cnt} добавлено` : 'Ошибка'; /////////////////
  }
}
