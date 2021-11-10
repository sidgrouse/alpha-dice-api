import { UseFilters } from '@nestjs/common';
import {
  Ctx,
  Help,
  Command,
  Message,
  Scene,
  SceneEnter,
  On,
  TelegrafException,
} from 'nestjs-telegraf';
import { SceneCtx } from 'src/common/scene-context.interface';
import { TelegrafExceptionFilter } from 'src/common/telegram-exception-filter';
import { SceneNames } from 'src/constants';
import { AddItemDto } from 'src/dto/item.add.dto';
import { AddProjectDto } from 'src/dto/project.add.dto';
import { ProjectService } from 'src/services/project.service';

@UseFilters(TelegrafExceptionFilter)
@Scene(SceneNames.ADD_PROJECT)
export class AddProjectTgScene {
  constructor(private _projectService: ProjectService) {}

  @SceneEnter()
  onSceneEnter(): string {
    return 'Формат ввода: имя проекта|url|детали\n/cancel - назад в главное меню';
  }

  @Help()
  async onHelp(): Promise<string> {
    return 'Формат ввода: имя проекта|url|детали\n/cancel - назад в главное меню';
  }

  @Command('cancel')
  async onCancel(@Ctx() context: SceneCtx) {
    await context.scene.leave();
    return 'Гаааля, отмену сделай!';
  }

  @On('text')
  async onMessage(@Message() messageObject: any, @Ctx() context: SceneCtx) {
    const message: string = messageObject.text;
    if (message.startsWith('/')) {
      return;
    }

    const elmts = message.split('|');
    if (elmts.length < 3) {
      return 'Неверный формат';
    }

    context.state.project = new AddProjectDto(elmts[0], elmts[1], elmts[2], []);

    await context.scene.enter(SceneNames.ADD_PROJECT_DETAILS);
    return `Добавляем проект ${elmts[0]}`;
  }
}

@UseFilters(TelegrafExceptionFilter)
@Scene(SceneNames.ADD_PROJECT_DETAILS)
export class AddProjectItemsTgScene {
  private _project: AddProjectDto;

  constructor(private _projectService: ProjectService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() context: SceneCtx): Promise<string> {
    this._project = context.state.project;
    return (
      `Почти готово, осталось добавить хотя-бы один пледж для ${this._project.name}\n` +
      '(пока не оч ясно что делать с валютами)\n' +
      `Добавляем по одному. Формат:\nназвание:цена для всех[:цена для нас]\n\n` +
      `Например:\nбаза:50\nall-in:100\nалень:100:80`
    );
  }

  @Command('cancel')
  async onCancel(@Ctx() context: SceneCtx) {
    await context.scene.leave();
    return 'Гаааля, отмену сделай!';
  }

  @Command('ok')
  async onConfirm(@Ctx() context: SceneCtx) {
    const result = await this._projectService.tryAddProject(this._project);
    const message = result
      ? `Проект ${this._project.name} успешно добавлен`
      : 'Ошибка';

    await context.scene.leave();
    return message;
  }

  @On('text')
  async onMessage(@Message() messageObject: any) {
    const message: string = messageObject.text;
    if (message.startsWith('/')) {
      return;
    }

    if (!this._project) {
      throw new TelegrafException('Project is not found in context');
    }

    const itemElements = message.split(':');
    if (itemElements.length < 2) {
      return 'Неверный формат';
    }
    try {
      const item = new AddItemDto(
        itemElements[0],
        Number.parseFloat(itemElements[1]),
        itemElements.length > 2
          ? Number.parseFloat(itemElements[2])
          : Number.parseFloat(itemElements[1]),
      );

      this._project.items.push(item);
    } catch {
      return 'Неверный формат';
    }

    return (
      `Пледж ${itemElements[0]} добавлен. Введите еще один, либо\n` +
      `/ok - для подтверждения\n` +
      `/cancel - отмена`
    );
  }
}
