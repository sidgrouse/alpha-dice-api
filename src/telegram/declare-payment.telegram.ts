import { UseFilters, UseGuards } from '@nestjs/common';
import {Ctx, Help, Command, Message, Scene, SceneEnter, On, TelegrafException, Action, InjectBot, } from 'nestjs-telegraf';
import { async, from } from 'rxjs';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { InvoiceService } from 'src/services/invoice.service';
import { Context, Telegraf } from 'telegraf';
import { getFromContainer } from 'typeorm';
  
  @Scene(SceneNames.DECLARE_PAYMENT)
  @UseFilters(TelegrafExceptionFilter)
  export class DeclarePaymentTgSceneController {
    private _declaredInvoiceIds: number[];
    private _people: string[];
    
    constructor(
      @InjectBot() private _bot: Telegraf<any>,
      private _invoiceService: InvoiceService){
        this._declaredInvoiceIds = [];
    }

  @SceneEnter()
  async onSceneEnter(@Ctx() context: Context): Promise<void> {
    const debt = await this._invoiceService.getAllUserDebts(context.from.id);
    const userTotal = debt.invoices.reduce((sum, inv) => sum + inv.amount, debt.identificationalAmount).toFixed(2); //helper?

    const inlineKeyboardOrders = debt.invoices.map(inv => 
      [{
          text: `${inv.pledjeName} ${inv.invoiceName}(${inv.amount + debt.identificationalAmount})`,
          callback_data: `inv_${context.from.username}_${inv.invoiceId}`
      }]
    );
    await this._bot.telegram.sendMessage(context.from.id,
      "Выберите инвойсы для подтверждения оплаты",
      {
        reply_markup: {
          inline_keyboard: inlineKeyboardOrders
        }
      });
    debt.invoices.map(inv => this._bot.action(`inv_${context.from.username}_${inv.invoiceId}`, async itm => {
      this._declaredInvoiceIds.push(inv.invoiceId); //check if exist
      await this._bot.telegram.sendMessage(context.from.id, `${inv.pledjeName} добавлен в список. /confirm - подтвердить`);
    }));
  }

    @Help()
    async onHelp(@Ctx() context: Context): Promise<string> {
      const debt = await this._invoiceService.getAllUserDebts(context.from.id);
      const userTotal = debt.invoices.reduce((sum, inv) => sum + inv.amount, debt.identificationalAmount).toFixed(2); //helper?
      return this._people.join(',');
      //return `Активный долг - ${userTotal}руб\n/cancel - back to the main menu`;
    }

    @Command('confirm')
    async onConfirm(@Ctx() context: SceneCtx) {
      const debt = await this._invoiceService.getAllUserDebts(context.from.id);
      await this._invoiceService.declarePayment(context.from.id, this._declaredInvoiceIds);
      await context.scene.leave();
      return ''
    }

    @Command('cancel')
    async onCancel(@Ctx() context: SceneCtx) {
      await context.scene.leave();
      return 'back to main menu';
    }
  }
