import { UseFilters, UseGuards } from '@nestjs/common';
import { Update, Ctx, Start, Help, Command, On } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { FinanceService } from 'src/services/finance.service';
import { UserService } from 'src/services/user.service';
import { Context } from 'telegraf';
// import { SceneContext } from 'telegraf/typings/scenes';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class MainTgScene {
  constructor(
    private readonly _userService: UserService,
    private readonly _financeService: FinanceService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<string> {
    await this._userService.addUser(ctx.from.username, ctx.from.id);
    return 'Привет! Вы добавлены, начните вводить / чтоб увидеть список комманд\n';
  }

  @Help()
  async onHelp(): Promise<string> {
    return (
      'При оплате не забывайте добавлять указанное число копеек (до 9.99руб) к каждому вашему платежу.\n' +
      'Для просмотра списка доступных команд, начните вводить /\n'
    );
  }

  @Command('add_order')
  async addOrder(@Ctx() context: SceneCtx) {
    // context.scene.enter(SceneNames.ADD_ORDER);
  }

  @Command('admin') // TODO: move to help with check
  @UseGuards(AdminGuard)
  async onAdminHelp(): Promise<string> {
    return (
      '/add_invoice - выставить инвойс за существующий проект\n' +
      '/confirm_payments - парсить логи'
    );
  }

/*
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
*/

  @On('text')
  async onMessage() {
    return 'Ничего не понятно, но очень интересно.\n/help для справки. Останутся вопросы - пиши @k_matroskin';
  }
}
