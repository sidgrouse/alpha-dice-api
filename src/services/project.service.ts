import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Project } from 'src/storage/entities/project.entity';
import { ProjectStatus } from 'src/constants/project-status';
import { Item } from 'src/storage/entities/item.entity';
import { ItemDto } from 'src/dto/item.dto';
import { ProjectDto } from 'src/dto/project.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ProjectItemDto } from 'src/dto/project-item.dto';
import { AddProjectDto } from 'src/dto/project.add.dto';
import { InvoiceDto } from 'src/dto/invoice.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private _projectRepository: Repository<Project>,
    @InjectRepository(Item)
    private _itemRepository: Repository<Item>,
  ) {}

  async tryAddProject(dto: AddProjectDto): Promise<boolean> {
    const existedProject = await this._projectRepository.findOne({
      where: { name: dto.name },
    });
    console.log('existedProject', existedProject);
    if (!existedProject) {
      const project = new Project();
      project.name = dto.name;
      project.items = dto.items.map((itm) => {
        const ret = new Item();
        ret.name = itm.name;
        ret.originalPrice = itm.originalPrice;
        ret.discountPrice = itm.discountPrice;
        return ret;
      });
      project.status = ProjectStatus.NO_INFO;
      project.url = dto.url;
      project.details = dto.details;

      console.log('new project', project);
      await this._projectRepository.save(project);
      return true;
    }

    console.log('project not added');
    return false;
  }

  async getAll(): Promise<ProjectDto[]> {
    const projects = await this._projectRepository.find({
      relations: ['items', 'items.orders', 'items.invoices'],
    });
    return projects.map(
      (p) =>
        new ProjectDto(
          p.id,
          p.name,
          p.status,
          p.url,
          p.details,
          p.items.map(
            (itm) =>
              new ItemDto(
                itm.id,
                itm.name,
                itm.originalPrice,
                itm.discountPrice,
                itm.orders.map((ord) => ord.user.telegramName),
                // eslint-disable-next-line prettier/prettier
                itm.invoices.map(inv => new InvoiceDto(inv.name, inv.amount, inv.status))
              ),
          ),
        ),
    );
  }

  // TODO: remake, remove projectItem
  async getAllAvailableItems(): Promise<ProjectItemDto[]> {
    const items = await this._itemRepository.find({ relations: ['project'] });
    return (
      items
        ////.filter(itm => itm.project.status !== ProjectStatus.NO_INFO) //TODO: apply busines logic
        .map(
          (itm) =>
            // eslint-disable-next-line prettier/prettier
            new ProjectItemDto(itm.id, itm.name, itm.project.name, itm.project.status),
        )
    ); //TODO: add details to order
  }

  public async patchProject(
    id: number,
    patch: QueryDeepPartialEntity<Project>,
  ): Promise<void> {
    await this._projectRepository.update(id, patch);
  }

  public async patchItem(
    id: number,
    patch: QueryDeepPartialEntity<Item>,
  ): Promise<void> {
    console.log(id, patch);
    await this._itemRepository.update(id, patch);
  }
}
