import { ExecutionContext, UseFilters, UseGuards } from '@nestjs/common';
import {Update, Ctx, Start, Help, Command } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { InvoiceStatus } from 'src/constants/invoice-status';
import { Context } from 'telegraf';
import { InvoiceService } from './invoice.service';
  
  @Update()
  @UseFilters(TelegrafExceptionFilter)
  export class InvoiceTgController {
    constructor(private readonly invoiceService: InvoiceService){}

    @Start()
    async onStart(@Ctx() ctx : Context): Promise<string> {
      this.invoiceService.addUser(ctx.from.username, ctx.from.id);
      return "Hey, I'm an alpha dice bot. Thank u for registration \n/invoices - to get all of your invoices";
    }

    @Help()
    async onHelp(): Promise<string> {
      return '/invoices - to get all of your invoices';
    }

    @Command('invoices')
    async onGetInfo(@Ctx() context: Context) : Promise<string>{
      const invoices = await this.invoiceService.getAllUserInvoices(context.from.id);
      console.log(invoices);
      const invString = invoices.map(inv => `${inv.priceToPay.toFixed(2)} for ${inv.pledjeName} (${inv.status})`).join('\n');

      return `${invString}\nPlease note that it is essential to pay the exact price without rounding! Otherwise we cannot map you with your payment`;
    }


    @Command('add_invoice')
    @UseGuards(AdminGuard)
    async onAddInvoice(@Ctx() context: SceneCtx) {
      await context.scene.enter(SceneNames.ADD_INVOICES);
    }
  }