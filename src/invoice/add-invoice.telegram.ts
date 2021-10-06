import {Update, Ctx, Start, Help, Command, Message, TelegrafExecutionContext, Scene, SceneEnter, On, Hears, TelegrafException, } from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { SceneNames } from 'src/constants';
import { CreateInvoiceDto } from 'src/dto/create-invoice.dto';
import { InvoiceService } from './invoice.service';
  
  @Scene(SceneNames.ADD_INVOICES)
  export class AddInvoiceTgSceneController {
    private _invoiceBuffer: CreateInvoiceDto[];
    constructor(private _invoiceService: InvoiceService){
      
    }

  @SceneEnter()
  onSceneEnter(): string {
    this._invoiceBuffer = [];
    return "Send me invoices in format nickname:pledgeid \n/save - save sent invoices. DON'T FORGET TO DO IT!  \n/leave - back to the main menu";
  }

    @Help()
    async onHelp(): Promise<string> {
      return 'Send me invoices in format nickname:pledgeid';
    }

    @Command('save')
    async onSave() {
      await this._invoiceBuffer.forEach(async itm => await this._invoiceService.addInvoice(itm));
      //console.log(ret);
      return 'saved';
    }

    @Command('leave')
    async onAddInvoice(@Ctx() context: SceneCtx) {
      await context.scene.leave();
      return 'back to main menu';
    }

    @On('text')
    async onMessage(@Message() messageObject : any){
      const message : string = messageObject.text;
      if(message.startsWith('/')){
        return;
      }

      const invoiceStrs = message.split(' ');
      invoiceStrs.forEach(str => {
        const invoiceElements = str.split(':');
        if(invoiceElements.length !== 2){
          throw new TelegrafException('Wrong format');
        }
        const dto = new CreateInvoiceDto( invoiceElements[0], Number.parseInt(invoiceElements[1]));
        this._invoiceBuffer.push(dto);
      });
      return this._invoiceBuffer.map(itm => `${itm.userId} (${itm.pledjeId})`).join('\n');
    }
  }
