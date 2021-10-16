import { ExecutionContext, UseFilters, UseGuards } from '@nestjs/common';
import {Update, Ctx, Start, Help, Command } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { UserService } from 'src/services/user.service';
import { Context } from 'telegraf';
import { InvoiceService } from '../services/invoice.service';
  
  @Update()
  @UseFilters(TelegrafExceptionFilter)
  export class InvoiceTgController {
    constructor(private readonly invoiceService: InvoiceService,
      private readonly userService: UserService){}

    @Start()
    async onStart(@Ctx() ctx : Context): Promise<string> {
      this.userService.addUser(ctx.from.username, ctx.from.id);
      return "Hey, I'm an alpha dice bot. Thank u for registration \n/invoices - to get all of your invoices";
    }

    @Help()
    async onHelp(): Promise<string> {
      return '/invoices - to get all of your invoices';
    }

    @Command('invoices')
    async getInfo(@Ctx() context: Context) : Promise<string>{
      const debts = await this.invoiceService.getAllUserDebts(context.from.id);
      console.log(debts);
      const invString = debts.map(debt => `${debt.amount.toFixed(2)} for ${debt.pledjeName} (${debt.invoiceName})`).join('\n');

      return `${invString}\nPlease note that it is essential to pay the exact price without rounding! Otherwise we cannot map you with your payment`;
    }

    @Command('add_order')
    async addOrder(@Ctx() context: SceneCtx){
      context.scene.enter(SceneNames.ADD_ORDER) ;
    }


    @Command('add_invoice')
    @UseGuards(AdminGuard)
    async onAddInvoice(@Ctx() context: SceneCtx) {
      await context.scene.enter(SceneNames.ADD_INVOICE);
    }
  }