import { UseGuards } from '@nestjs/common';
import {Ctx, Help, Command, Message, Scene, SceneEnter, On, TelegrafException, } from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { SceneNames } from 'src/constants';
import { InvoiceDto } from 'src/dto/invoice.dto';
import { InvoiceService } from 'src/services/invoice.service';
import { Context } from 'telegraf';
  
  @Scene(SceneNames.DECLARE_PAYMENT)
  export class DeclarePaymentTgSceneController {
    constructor(private _invoiceService: InvoiceService){
    }

  @SceneEnter()
  async onSceneEnter(@Ctx() context: Context): Promise<string> {
    const debt = await this._invoiceService.getAllUserDebts(context.from.id);
    const userTotal = debt.invoices.reduce((sum, inv) => sum + inv.amount, debt.identificationalAmount).toFixed(2); //helper?
    return `/confirm - подтвердить перевод ${userTotal}руб\n/cancel - back to the main menu`;
  }

    @Help()
    async onHelp(@Ctx() context: Context): Promise<string> {
      const debt = await this._invoiceService.getAllUserDebts(context.from.id);
      const userTotal = debt.invoices.reduce((sum, inv) => sum + inv.amount, debt.identificationalAmount).toFixed(2); //helper?
      return `/confirm - подтвердить перевод ${userTotal}руб\n/cancel - back to the main menu`;
    }

    @Command('confirm')
    async onConfirm(@Ctx() context: SceneCtx) {
      const debt = await this._invoiceService.getAllUserDebts(context.from.id);
      this._invoiceService.declarePayment(context.from.id);
      return 'back to main menu';
    }

    @Command('cancel')
    async onCancel(@Ctx() context: SceneCtx) {
      await context.scene.leave();
      return 'back to main menu';
    }

    @On('text')
    async onMessage(@Message() messageObject : any){
      const message : string = messageObject.text;
      if(message.startsWith('/')){
        return;
      }

      const invoiceElements = message.split(':');
      if(invoiceElements.length < 2){
        throw new TelegrafException('Wrong format');
      }

      this._invoiceService.addInvoice(invoiceElements[0], Number.parseFloat(invoiceElements[1]));
      return 'done';
    }
  }
