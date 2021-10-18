import { UseFilters } from '@nestjs/common';
import {Ctx, Help, Command, Message, Scene, SceneEnter, On, TelegrafException, } from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { InvoiceService } from 'src/services/invoice.service';
import { Context } from 'telegraf';
  
  @UseFilters(TelegrafExceptionFilter)
  @Scene(SceneNames.ADD_ORDER)
  export class AddOrderTgSceneController {
    constructor(private _invoiceService: InvoiceService){
      
    }

  @SceneEnter()
  onSceneEnter(): string {
    return "Send me order name\n/cancel - назад в главное меню";
  }

    @Help()
    async onHelp(): Promise<string> {
      return 'Send me invoices in format nickname:pledgeid';
    }

    @Command('cancel')
    async onAddInvoice(@Ctx() context: SceneCtx) {
      await context.scene.leave();
      return 'back to main menu';
    }

    @On('text')
    async onMessage(@Message() messageObject : any, @Ctx() context: SceneCtx){
      const message : string = messageObject.text;
      if(message.startsWith('/')){
        return;
      }

      await this._invoiceService.addOrder(message, context.from.id);
      await context.scene.leave();
      return "done";
    }
  }
