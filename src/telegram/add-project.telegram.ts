import { UseFilters } from '@nestjs/common';
import {Ctx, Help, Command, Message, Scene, SceneEnter, On, TelegrafException, } from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { ProjectService } from 'src/services/project.service';
import { Context } from 'telegraf';
  
  @UseFilters(TelegrafExceptionFilter)
  @Scene(SceneNames.ADD_PROJECT)
  export class AddProjectTgSceneController {
    constructor(private _projectService: ProjectService){
    }

  @SceneEnter()
  onSceneEnter(): string {
    return "Формат ввода: имя проекта:url:детали:названия пледжей через запятую\n/cancel - назад в главное меню";///////////////////////
  }

    @Help()
    async onHelp(): Promise<string> {
      return "Формат ввода: имя проекта:url:детали:названия пледжей через запятую\n/cancel - назад в главное меню";
    }

    @Command('cancel')
    async onAddInvoice(@Ctx() context: SceneCtx) {
      await context.scene.leave();
      return 'back to main menu';
    }

    @On('text')
    async onMessage(@Ctx() ctx: Context, @Message() messageObject : any){
      const message : string = messageObject.text;
      if(message.startsWith('/')){
        return;
      }

      const elmts = message.split(':');
      if(elmts.length < 4){
        throw new TelegrafException('Wrong format in project');
      }

      const success = this._projectService.tryAddProject(elmts[0], elmts[1], elmts[2], elmts[3].split(','));
      return success ? `${elmts[0]} добавлен` : 'Ошибка';
    }
  }
