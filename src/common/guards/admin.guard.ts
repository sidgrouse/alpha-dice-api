import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext, TelegrafException } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly ADMIN_IDS = ['k_matroskin'];

  canActivate(context: ExecutionContext): boolean {
    const ctx = TelegrafExecutionContext.create(context);
    const { from } = ctx.getContext<Context>();

    const isAdmin = this.ADMIN_IDS.includes(from.username);
    if (!isAdmin) {
      throw new TelegrafException('You are not admin 😡');
    }

    return true;
  }
}
