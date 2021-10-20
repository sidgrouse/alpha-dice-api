import { UseFilters } from '@nestjs/common';
import { captureRejections } from 'events';
import {Ctx, Help, Command, Message, Scene, SceneEnter, On, TelegrafException, InjectBot, } from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { ItemDto } from 'src/dto/item.dto';
import { InvoiceService } from 'src/services/invoice.service';
import { ProjectService } from 'src/services/project.service';
import { Context, Telegraf } from 'telegraf';
  
  @UseFilters(TelegrafExceptionFilter)
  @Scene(SceneNames.ADD_ORDER)
  export class AddOrderTgScene {
    private item: ItemDto;
    constructor(
      @InjectBot() private _bot: Telegraf<any>,
      private _projectService: ProjectService,
      private _invoiceService: InvoiceService){
      
    }

    @SceneEnter()
    async onSceneEnter(@Ctx() context: SceneCtx, @Ctx() c: Context): Promise<void> {
      const projects = await this._projectService.getAllAvailableItems();
      
      if(projects.length > 0){
        const inlineKeyboardOrders = projects.map(prj => 
          [{
              text: prj.toString(),
              callback_data: `prj_${context.from.username}_${prj.id}`
          }]
        );
        await this._bot.telegram.sendMessage(context.from.id,
          "Выберите проект, в котором хотите поучаствовать",
          {
            reply_markup: {
              inline_keyboard: inlineKeyboardOrders
            }
          });
        projects.map(prj => this._bot.action(`prj_${context.from.username}_${prj.id}`, async localContext => {
          try{
            await this._invoiceService.addOrder(prj.id, context.from.id);
            await this._bot.telegram.sendMessage(context.from.id, `${prj.toString()} добавлен в список ваших заказов.`);
            await localContext.editMessageReplyMarkup({inline_keyboard: null});
          } 
          catch(exception){
            console.warn(exception);
            await this._bot.telegram.sendMessage(context.from.id, exception.message);
          }
        }));
      }
      else{
        await this._bot.telegram.sendMessage(context.from.id, "Нет доступных проектов. Можете предложить интересующий вас проект в главном меню");
      }
      context.scene.leave();
    }

    @Help()
    async onHelp(): Promise<string> {
      return 'Здесь можно вписаться в проект';
    }

    @Command('cancel')
    async onAddInvoice(@Ctx() context: SceneCtx) {
      await context.scene.leave();
      return 'back to main menu';
    }
  }
