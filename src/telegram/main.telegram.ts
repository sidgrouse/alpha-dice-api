import { UseFilters, UseGuards } from '@nestjs/common';
import { Update, Ctx, Start, Help, Command, On } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { BalanceService } from 'src/services/balance/balance.service';
import { InvoiceService } from 'src/services/invoice/invoice.service';
import { OrderService } from 'src/services/order/order.service';
import { PaymentService } from 'src/services/payment/payment.service';
import { UserService } from 'src/services/user/user.service';
import { Context } from 'telegraf';
// import { SceneContext } from 'telegraf/typings/scenes';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class MainTgScene {
  constructor(
    private readonly _userService: UserService,
    private readonly _balanceService: BalanceService,
    private readonly _invoiceService: InvoiceService,
    private readonly _orderService: OrderService,
    private readonly _paymentService: PaymentService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<string> {
    try {
      await this._userService.registerUser(ctx.from.username, ctx.from.id);
      return 'Привет! Вы добавлены, начните вводить / чтоб увидеть список комманд\n';
    } catch (e) {
      return 'Не удалось вас добавить. Обратитесь к кому-нибудь умному(@Nginnn или @k_matroskin).';
    }
  }

  @Help()
  async onHelp(@Ctx() context: SceneCtx) {
    context.scene.enter(SceneNames.GET_HELP);
  }

  @Command('balance')
  async onBalanceRequest(@Ctx() ctx: Context): Promise<string> {
    const balance = await this._balanceService.getBalanceInfo(ctx.from.username);
    return `Баланс плюс (аванс): ${balance.bPlus}\nБаланс минус (задолженность): ${balance.bMinus}\n\n❗Платить ВОТ СТОЛЬКО (здесь сумма + личный ID): ${balance.balance}`;
  }

  @Command('invoices')
  async onInvoicesRequest(@Ctx() ctx: Context, limit = 10): Promise<string> {
    const payments = await this._invoiceService.getUserInvoices(ctx.from.username, limit);
    return (
      'Последние инвойсы:\n\n' +
      payments
        // eslint-disable-next-line prettier/prettier
        .map((p) => `✏ ${p.amount} (${p.date}) за ${p.item} [${p.comment}]: `)
        .join('\n')
    );
  }

  @Command('invoices100')
  async onInvoicesRequestBig(@Ctx() ctx: Context): Promise<string> {
    return this.onInvoicesRequest(ctx, 100);
  }

  @Command('payments')
  async onPaymentsRequest(@Ctx() ctx: Context, limit = 10): Promise<string> {
    const payments = await this._paymentService.getUserPayments(ctx.from.username, limit);
    return (
      'Последние платежи:\n\n' +
      payments
        // eslint-disable-next-line prettier/prettier
        .map((p) => `💲 ${p.amount} (${p.payDate})` + (p.project ? ` за ${p.project}` : '')  + (p.category ? ` [${p.category}]` : ''))
        .join('\n')
    );
  }

  @Command('orders')
  async onOrdersRequest(@Ctx() ctx: Context): Promise<string> {
    const orders = await this._orderService.getUserWHouseOrders(ctx.from.username);
    if (orders.length == 0){
      return 'На складе для вас ничего не обнаружено 😒';
    }
    return (
      'На складе обнаружено:\n\n' +
      orders
        // eslint-disable-next-line prettier/prettier
        .map((ord) => `📦 ${ord.item}`)
        .join('\n')
    );
  }

  @Command('payments100')
  async onPaymentsRequestBig(@Ctx() ctx: Context): Promise<string> {
    return this.onPaymentsRequest(ctx, 100);
  }

  @Command('notify')
  @UseGuards(AdminGuard)
  async onNotification(): Promise<string> {
    return 'пока пусто';
  }

  @On('text')
  async onMessage() {
    return 'Ничего не понятно, но очень интересно.\n/help для справки. Останутся вопросы - пиши @Nginnn или @k_matroskin';
  }
}
