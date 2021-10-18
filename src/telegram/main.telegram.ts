import { ExecutionContext, UseFilters, UseGuards } from '@nestjs/common';
import {Update, Ctx, Start, Help, Command } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { UserService } from 'src/services/user.service';
import { Context } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { InvoiceService } from '../services/invoice.service';
  
  @Update()
  @UseFilters(TelegrafExceptionFilter)
  export class MainTgController {
    constructor(private readonly invoiceService: InvoiceService,
      private readonly userService: UserService){}

    @Start()
    async onStart(@Ctx() ctx : Context): Promise<string> {
      await this.userService.addUser(ctx.from.username, ctx.from.id);
      return "Привет! Вы добавлены, начните вводить / чтоб увидеть список комманд";
    }

    @Help()
    async onHelp(): Promise<string> {
      return "При оплате не забывайте добавлять указанное число копеек (до 9.99руб) к каждому вашему платежу. " + 
      "Для просмотра списка доступных команд, начните вводить /";
    }

    @Command('invoices')
    async getInfo(@Ctx() context: Context) : Promise<string>{
      const debt = await this.invoiceService.getAllUserDebts(context.from.id);
      console.log(debt);
      const invString = debt.invoices.map(inv => inv.toString(debt.identificationalAmount)).join('\n');

      return `${invString}\nPlease note that it is essential to pay the exact price without rounding! Otherwise we cannot map you with your payment`;
    }

    @Command('add_order')
    async addOrder(@Ctx() context: SceneCtx){
      context.scene.enter(SceneNames.ADD_ORDER);
    }

    @Command('admin')
    @UseGuards(AdminGuard)
    async onAdminHelp(@Ctx() context: Context) : Promise<string>{
      return '/add_invoice - выставить инвойс за существующий проект (будет доделано)'+
      ///'/pay - -----'+
      '';
    }

    @Command('add_project')
    async addProject(@Ctx() context: SceneCtx){
      context.scene.enter(SceneNames.ADD_PROJECT);
    }

    @Command('add_invoice')
    @UseGuards(AdminGuard)
    async onAddInvoice(@Ctx() context: SceneCtx) {
      await context.scene.enter(SceneNames.ADD_INVOICE);
    }

    @Command('declare_payment')
    async onDeclarePayment(@Ctx() context: SceneContext){
      await context.scene.enter(SceneNames.DECLARE_PAYMENT);
    }
  }