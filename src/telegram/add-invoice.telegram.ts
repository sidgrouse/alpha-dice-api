import { UseGuards } from '@nestjs/common';
import {Ctx, Help, Command, Message, Scene, SceneEnter, On, TelegrafException, } from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { SceneNames } from 'src/constants';
import { InvoiceDto } from 'src/dto/invoice.dto';
import { InvoiceService } from 'src/services/invoice.service';
  
  @Scene(SceneNames.ADD_INVOICE)
  export class AddInvoiceTgSceneController {
    constructor(private _invoiceService: InvoiceService){
    }

  @SceneEnter()
  onSceneEnter(): string {
    return "Send me invoices in format pledgename:amount:description \n/cancel - back to the main menu";
  }

    @Help()
    async onHelp(): Promise<string> {
      return 'Send me invoices in format pledgename:amount:description \n/cancel - back to the main menu';
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
