import { UseFilters, UseGuards } from '@nestjs/common';
import { Update, Ctx, Start, Help, Command, On } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { BalanceService } from 'src/services/balance.service';
import { UserService } from 'src/services/user.service';
import { Context } from 'telegraf';
// import { SceneContext } from 'telegraf/typings/scenes';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class MainTgScene {
  constructor(
    private readonly _userService: UserService,
    private readonly _financeService: BalanceService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<string> {
    try {
      await this._userService.registerUser(ctx.from.username, ctx.from.id);
      return 'Привет! Вы добавлены, начните вводить / чтоб увидеть список комманд\n';
    } catch (e) {
      return 'Не удалось вас добавить. Обратитесь к кому-нибудь умному().';
    }
  }

  @Help()
  async onHelp(): Promise<string> {
    return (
      'При оплате не забывайте добавлять указанное число копеек (до 9.99руб) к каждому вашему платежу.\n' +
      'Для просмотра списка доступных команд, начните вводить /\n'
    );
  }

  @Command('admin')
  @UseGuards(AdminGuard)
  async onAdminHelp(): Promise<string> {
    return 'пока пусто';
  }

  @On('text')
  async onMessage() {
    return 'Ничего не понятно, но очень интересно.\n/help для справки. Останутся вопросы - пиши @k_matroskin';
  }
}
