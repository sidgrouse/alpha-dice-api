import { UseFilters } from '@nestjs/common';
import {
  Ctx,
  Help,
  Command,
  Scene,
  SceneEnter,
  InjectBot,
} from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { DebtDto } from 'src/dto/debt.dto';
import { InvoiceItemDto } from 'src/dto/invoice-item.dto';
import { InvoiceService } from 'src/services/invoice.service';
import { Telegraf } from 'telegraf';

@Scene(SceneNames.DECLARE_PAYMENT)
@UseFilters(TelegrafExceptionFilter)
export class DeclarePaymentTgScene {
  private _debt: DebtDto;
  private _declaredInvoices: InvoiceItemDto[];

  constructor(
    @InjectBot() private _bot: Telegraf<any>,
    private _invoiceService: InvoiceService,
  ) {
    this._declaredInvoices = [];
  }

  @SceneEnter()
  async onSceneEnter(@Ctx() context: SceneCtx): Promise<void> {
    this._debt = await this._invoiceService.getUserDebtsToPay(context.from.id);

    if (this._debt.invoices.length > 0) {
      const inlineKeyboardOrders = this._debt.invoices.map((inv) => [
        {
          text: inv.toString(this._debt.identificationalAmount),
          callback_data: `declare_payment_${context.from.username}_${inv.invoiceId}`,
        },
      ]);
      await this._bot.telegram.sendMessage(
        context.from.id,
        'Выберите инвойсы для подтверждения оплаты одним платежом',
        {
          reply_markup: {
            inline_keyboard: inlineKeyboardOrders,
          },
        },
      );
      this._debt.invoices.map((inv) =>
        this._bot.action(
          `declare_payment_${context.from.username}_${inv.invoiceId}`,
          async () => {
            const isAlreadyAdded = this._declaredInvoices.some(
              (di) => di.invoiceId === inv.invoiceId,
            );
            if (isAlreadyAdded) {
              this._declaredInvoices = this._declaredInvoices.filter(
                (di) => di.invoiceId === inv.invoiceId,
              );
            } else {
              this._declaredInvoices.push(inv);
            }

            await this._bot.telegram.sendMessage(
              context.from.id,
              `${this._declaredInvoices
                .map((inv) => inv.toString())
                .join(', ')}\n К оплате одним платежом ` +
                `${this._declaredInvoices
                  .reduce(
                    (sum, inv) => sum + inv.amount,
                    this._debt.identificationalAmount,
                  )
                  .toFixed(2)}р.\n/confirm - отметить оплаченным`,
            );
          },
        ),
      );
    } else {
      await this._bot.telegram.sendMessage(
        context.from.id,
        'У вас нет инвойсов, ожидающих оплаты',
      );
      context.scene.leave();
    }
  }

  @Help()
  async onHelp(): Promise<string> {
    return `Активный долг - ${this._debt.getTotal()}руб\n\n/cancel - назад в главное меню`;
  }

  @Command('confirm')
  async onConfirm(@Ctx() context: SceneCtx) {
    const declared = await this._invoiceService.declarePayment(
      context.from.id,
      this._declaredInvoices.map((inv) => inv.invoiceId),
    );
    const invoices = declared.map((itm) => itm.toString()).join('\n -');
    await context.scene.leave();
    return `Отмечены оплаченными:\n\n -${invoices}`;
  }

  @Command('cancel')
  async onCancel(@Ctx() context: SceneCtx) {
    await context.scene.leave();
    return 'Гаааля, отмену сделай!';
  }
}
