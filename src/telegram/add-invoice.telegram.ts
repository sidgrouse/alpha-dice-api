import { UseFilters } from '@nestjs/common';
import {
  Ctx,
  Command,
  Message,
  Scene,
  SceneEnter,
  On,
  TelegrafException,
  InjectBot,
} from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { InvoiceStatus } from 'src/constants/invoice-status';
import { InvoiceService } from 'src/services/invoice.service';
import { ProjectService } from 'src/services/project.service';
import { Telegraf } from 'telegraf';

@UseFilters(TelegrafExceptionFilter)
@Scene(SceneNames.ADD_INVOICE)
export class AddInvoiceTgScene {
  constructor(
    @InjectBot() private _bot: Telegraf<any>,
    private _projectService: ProjectService,
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() context: SceneCtx): Promise<void> {
    const projects = await this._projectService.getAllAvailableItems();

    if (projects.length > 0) {
      const inlineKeyboardOrders = projects.map((prj) => [
        {
          text: prj.toString(),
          callback_data: `addinv_${context.from.username}_${prj.id}`,
        },
      ]);
      await this._bot.telegram.sendMessage(
        context.from.id,
        'Выберите проект, за который хотите выставить счет',
        {
          reply_markup: {
            inline_keyboard: inlineKeyboardOrders,
          },
        },
      );
      projects.map((itm) =>
        this._bot.action(
          `addinv_${context.from.username}_${itm.id}`,
          async (localContext) => {
            context.state.itemId = itm.id;
            context.state.name = itm.toString();
            await localContext.editMessageReplyMarkup({
              inline_keyboard: null,
            });
            context.scene.enter(SceneNames.ADD_INVOICE_DETAILS);
          },
        ),
      );
    } else {
      await this._bot.telegram.sendMessage(
        context.from.id,
        'Нет доступных проектов. Сначала необходимо создать проект и пункт(aka пледж, айтем) в главном меню',
      );
    }
    context.scene.leave();
  }

  @Command('cancel')
  async onCancel(@Ctx() context: SceneCtx) {
    await context.scene.leave();
    return 'back to main menu';
  }
}

@UseFilters(TelegrafExceptionFilter)
@Scene(SceneNames.ADD_INVOICE_DETAILS)
export class DetailsAddInvoiceTgScene {
  private _itemId: number;
  private _itemName: string;
  constructor(
    @InjectBot() private _bot: Telegraf<any>,
    private _invoiceService: InvoiceService,
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() context: SceneCtx): Promise<string> {
    this._itemId = context.state.itemId;
    this._itemName = context.state.name;
    return (
      `Выставление нового инвойса за ${context.state.name}.(${context.state.itemId}) ` +
      `Формат:\nза что:сколько[:${InvoiceStatus.WAITING}]\n\n` +
      `Например:\nK1:5000\nДоставка:1000\nДоставка:100:${InvoiceStatus.WAITING}`
    );
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

    if (!this._itemId) {
      throw new TelegrafException('ItemId is not found in context');
    }

    const invoiceElements = message.split(':');
    if (invoiceElements.length < 2) {
      throw new TelegrafException('Wrong format');
    }

    const status =
      invoiceElements[2] === InvoiceStatus.WAITING
        ? InvoiceStatus.WAITING
        : InvoiceStatus.TO_PAY;
    this._invoiceService.addInvoice(
      this._itemId,
      Number.parseFloat(invoiceElements[1]),
      invoiceElements[0],
      status,
    );
    await context.scene.leave();
    return `Инвойс для ${this._itemName} добавлен`;
  }
}
