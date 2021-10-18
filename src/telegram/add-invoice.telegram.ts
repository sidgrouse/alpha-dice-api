import { UseFilters, UseGuards } from '@nestjs/common';
import {Ctx, Help, Command, Message, Scene, SceneEnter, On, TelegrafException, } from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { InvoiceService } from 'src/services/invoice.service';
  

  @UseFilters(TelegrafExceptionFilter)
  @Scene(SceneNames.ADD_INVOICE)
  export class AddInvoiceTgSceneController {
    constructor(private _invoiceService: InvoiceService){
    }

  @SceneEnter()
  onSceneEnter(): string {
    return "Send me invoices in format pledgename:amount:description \n/cancel - назад в главное меню";
  }

    @Help()
    async onHelp(): Promise<string> {
      return 'Send me invoices in format pledgename:amount:description \n/cancel - назад в главное меню';
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
