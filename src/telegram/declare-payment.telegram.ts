import { UseFilters, UseGuards } from '@nestjs/common';
import {Ctx, Help, Command, Message, Scene, SceneEnter, On, TelegrafException, Action, InjectBot, } from 'nestjs-telegraf';
import { async, from } from 'rxjs';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { InvoiceService } from 'src/services/invoice.service';
import { Context, Telegraf } from 'telegraf';
  
  @Scene(SceneNames.DECLARE_PAYMENT)
  @UseFilters(TelegrafExceptionFilter)
  export class DeclarePaymentTgScene {
    private _declaredInvoiceIds: number[];
    private _people: string[];
    
    constructor(
      @InjectBot() private _bot: Telegraf<any>,
      private _invoiceService: InvoiceService){
        this._declaredInvoiceIds = [];
    }

  @SceneEnter()
  async onSceneEnter(@Ctx() context: SceneCtx): Promise<void> {
    const debt = await this._invoiceService.getAllUserDebts(context.from.id);
    
    if(debt.invoices.length > 0){
      const inlineKeyboardOrders = debt.invoices.map(inv => 
        [{
            text: inv.toString(debt.identificationalAmount),
            callback_data: `declare_payment_${context.from.username}_${inv.invoiceId}`
        }]
      );
      await this._bot.telegram.sendMessage(context.from.id,
        "Выберите инвойсы для подтверждения оплаты",
        {
          reply_markup: {
            inline_keyboard: inlineKeyboardOrders
          }
        });
      debt.invoices.map(inv => this._bot.action(`declare_payment_${context.from.username}_${inv.invoiceId}`, async itm => {
        this._declaredInvoiceIds.push(inv.invoiceId); //check if exist
        await this._bot.telegram.sendMessage(context.from.id, `${inv.pledjeName} добавлен в список. /confirm - подтвердить`);
      }));
    }
    else{
      await this._bot.telegram.sendMessage(context.from.id, "У вас нет инвойсов, ожидающих оплаты");
      context.scene.leave();
    }
  }

    @Help()
    async onHelp(@Ctx() context: Context): Promise<string> {
      const debt = await this._invoiceService.getAllUserDebts(context.from.id);
      const userTotal = debt.invoices.reduce((sum, inv) => sum + inv.amount, debt.identificationalAmount).toFixed(2); //helper?
      return this._people.join(',');
      //return `Активный долг - ${userTotal}руб\n/cancel - назад в главное меню`;
    }

    @Command('confirm')
    async onConfirm(@Ctx() context: SceneCtx) {
      const declared = await this._invoiceService.declarePayment(context.from.id, this._declaredInvoiceIds);
      const invoices = declared.map(itm => itm.toString()).join('\n -');
      await context.scene.leave();
      return `Отмечены оплаченными:\n\n -${invoices}`;
    }

    @Command('cancel')
    async onCancel(@Ctx() context: SceneCtx) {
      await context.scene.leave();
      return 'back to main menu';
    }
  }
