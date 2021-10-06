import { ExecutionContext, UseFilters, UseGuards } from '@nestjs/common';
import {Update, Ctx, Start, Help, Command } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { Context } from 'telegraf';
import { InvoiceService } from './invoice.service';
  
  @Update()
  @UseFilters(TelegrafExceptionFilter)
  export class InvoiceTgController {
    constructor(private readonly invoiceService: InvoiceService){}

    @Start()
    async onStart(): Promise<string> {
      return "Hey, I'm an alpha dice bot";
    }

    @Help()
    async onHelp(): Promise<string> {
      return 'Send me any text';
    }

    @Command('get_info')
    async onGetInfo(@Ctx() context: Context) : Promise<string>{
      const userName = context.from.username;
      const ret = await this.invoiceService.getAllInvoices();
      return JSON.stringify(ret.filter(itm => itm.userId === userName));
    }


    @Command('add_invoice')
    @UseGuards(AdminGuard)
    async onAddInvoice(@Ctx() context: SceneCtx) {
      await context.scene.enter(SceneNames.ADD_INVOICES);
    }
  }