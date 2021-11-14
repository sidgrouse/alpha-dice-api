import { UseFilters, UseGuards } from '@nestjs/common';
import { Update, Ctx, Start, Help, Command, On } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { OrderService } from 'src/services/order.service';
import { UserService } from 'src/services/user.service';
import { Context } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { InvoiceService } from '../services/invoice.service';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class MainTgScene {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly userService: UserService,
    private readonly orderService: OrderService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<string> {
    await this.userService.addUser(ctx.from.username, ctx.from.id);
    return (
      'Привет! Вы добавлены, начните вводить / чтоб увидеть список комманд\n' +
      'A еще есть табличка с проектами - http://kmatroskin.ru:4200/'
    );
  }

  @Help()
  async onHelp(): Promise<string> {
    return (
      'При оплате не забывайте добавлять указанное число копеек (до 9.99руб) к каждому вашему платежу.\n' +
      'Для просмотра списка доступных команд, начните вводить /\n' +
      'A еще есть табличка с проектами - http://kmatroskin.ru:4200/'
    );
  }

  @Command('invoices')
  async getInfo(@Ctx() context: Context): Promise<string> {
    const debt = await this.invoiceService.getUserDebtsToPay(context.from.id);
    if (debt.invoices.length === 0) {
      return 'У вас нет активных счетов на оплату';
    }
    const joinedInvoices = debt.invoices
      .map((inv) => '❗ ' + inv.toString())
      .join('\n');

    return (
      `Итого: ${debt.getTotal()}\n\n${joinedInvoices}\n\nВажно! Любой ваш платеж должен содержать ровно указанное число копеек (до 9.99руб) плюсом к ровной сумме\n` +
      `Копейки не являются частью платежа, а служат для его идентификации как вашего, поэтому их нужно прибавить лишь один раз на каждый платеж.\n` +
      `Например, если вы пока готовы перевести 1000р за один проект и 2000 за другой одним платежом, то необходимо сложить эти суммы,` +
      `прибавить ${debt.identificationalAmount}р. и перевести ${
        3000 + debt.identificationalAmount
      }. Либо не заморачивайтесь и просто ` +
      `переведите ${debt.getTotal()}`
    );
  }

  @Command('add_order')
  async addOrder(@Ctx() context: SceneCtx) {
    context.scene.enter(SceneNames.ADD_ORDER);
  }

  @Command('admin') // TODO: move to help with check
  @UseGuards(AdminGuard)
  async onAdminHelp(): Promise<string> {
    return (
      '/add_invoice - выставить инвойс за существующий проект\n' +
      '/confirm_payments - парсить логи'
    );
  }

  @Command('add_project')
  async addProject(@Ctx() context: SceneCtx) {
    context.scene.enter(SceneNames.ADD_PROJECT);
  }

  @Command('orders')
  async getOrders(@Ctx() context: SceneCtx) {
    const orders = await this.orderService.getUserOrderedItems(context.from.id);
    if (orders.length === 0) {
      return 'У вас нет активный проектов';
    }
    const joinedOrders = orders
      .map((ord) => `❗ *${ord.projectName}* _${ord.itemName}_`)
      .join('\n');
    context.replyWithMarkdownV2('Ваши заказы:\n' + joinedOrders);
    return null;
  }

  @Command('declare_payment')
  async onDeclarePayment(@Ctx() context: SceneContext) {
    await context.scene.enter(SceneNames.DECLARE_PAYMENT);
  }

  @Command('add_invoice')
  @UseGuards(AdminGuard)
  async onAddInvoice(@Ctx() context: SceneCtx) {
    await context.scene.enter(SceneNames.ADD_INVOICE);
  }

  @Command('confirm_payments')
  @UseGuards(AdminGuard)
  async onConfirmPayments(@Ctx() context: SceneCtx) {
    await context.scene.enter(SceneNames.CONFIRM_PAYMENT);
  }

  @On('text')
  async onMessage() {
    return (
      'Ничего не понятно, но очень интересно.\n/help для справки. Останутся вопросы - пиши @k_matroskin\n' +
      'A еще есть табличка с проектами - http://kmatroskin.ru:4200/'
    );
  }
}
