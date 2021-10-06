import { ExecutionContext, UseGuards } from '@nestjs/common';
import {Update, Ctx, Start, Help, Command, Message, TelegrafExecutionContext, Scene, SceneEnter, On, Hears, } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { SceneNames } from 'src/constants';
import { InvoiceDto } from 'src/dto/invoice.dto';
import { Context } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes/context';
import { InvoiceService } from './invoice.service';
  
  @Scene(SceneNames.ADD_INVOICES)
  export class AddInvoiceTgSceneController {
    constructor(){}

  @SceneEnter()
  ////@UseGuards(AdminGuard)
  onSceneEnter(): string {
    console.log('Enter to scene');
    return 'Welcome on scene ✋ \n Send me invoices in format nickname:pledgeid';
  }

    @Help()
    async onHelp(): Promise<string> {
      return 'Send me invoices in format nickname:pledgeid';
    }

    @On('text')
    async onMessage(@Message() message : string){
      return message;
    }

    async onGetInfo(@Ctx() context: Context) : Promise<void>{
      const userName = context.from.username;
      //const ret = await this.invoiceService.getAllInvoices();
      //return JSON.stringify(ret.every(itm => itm.userId === userName));
    }


    @Command('leave')
    async onAddInvoice(@Ctx() context: SceneContext) {
      await context.scene.leave();
    }
  }
