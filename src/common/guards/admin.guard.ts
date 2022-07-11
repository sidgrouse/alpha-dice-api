import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext, TelegrafException } from 'nestjs-telegraf';
import { ADMIN_IDS } from 'src/constants';
import { Context } from 'telegraf';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = TelegrafExecutionContext.create(context);
    const { from } = ctx.getContext<Context>();

    const isAdmin = ADMIN_IDS.includes(from.id);
    if (!isAdmin) {
      throw new TelegrafException('You are not admin 😡');
    }

    return true;
  }
}
