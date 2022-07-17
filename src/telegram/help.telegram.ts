import { UseFilters } from '@nestjs/common';
import {
  Ctx,
  Help,
  Command,
  Scene,
  SceneEnter,
  InjectBot,
} from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { HelpService } from 'src/services/help/help.service';
import { Telegraf } from 'telegraf';

@UseFilters(TelegrafExceptionFilter)
@Scene(SceneNames.GET_HELP)
export class HelpTgScene {
  constructor(
    @InjectBot() private _bot: Telegraf<any>,
    private _helpService: HelpService,
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() context: SceneCtx): Promise<void> {
    const helpCmds = await this._helpService.getHelpCommands();

    if (helpCmds.length > 0) {
      const inlineKeyboardOrders = helpCmds.map((cmd) => [
        {
          text: cmd.name,
          callback_data: `help_${context.from.username}_${cmd.name}`,
        },
      ]);
      await this._bot.telegram.sendMessage(context.from.id, 'Чем помочь?', {
        reply_markup: {
          inline_keyboard: inlineKeyboardOrders,
        },
      });
      helpCmds.map((cmd) =>
        this._bot.action(
          `help_${context.from.username}_${cmd.name}`,
          async (localContext) => {
            try {
              await this._bot.telegram.sendMessage(
                context.from.id,
                cmd.message,
              );
            } catch (exception) {
              console.warn(exception);
              await this._bot.telegram.sendMessage(
                context.from.id,
                exception.message,
              );
            }
          },
        ),
      );
    } else {
      await this._bot.telegram.sendMessage(
        context.from.id,
        'помощь недоступна, сорян',
      );
    }
    context.scene.leave();
  }

  @Help()
  async onHelp(): Promise<string> {
    return 'Здесь справочное бюро. /cancel - выйти';
  }

  @Command('cancel')
  async onAddInvoice(@Ctx() context: SceneCtx) {
    await context.scene.leave();
    return 'back to main menu';
  }
}
