import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Project } from 'src/storage/entities/project.entity';
import { ProjectStatus } from 'src/constants/project-status';
import { Item } from 'src/storage/entities/item.entity';
import { ItemDto } from 'src/dto/item.dto';
import { InvoiceService } from './invoice.service';

@Injectable()
export class ProjectService {
  constructor(
    private _invoiceService: InvoiceService,
    @InjectRepository(Project)
    private _projectRepository: Repository<Project>,
    @InjectRepository(Item)
    private _itemRepository: Repository<Item>,
  ) {}

  async tryAddProject(
    name: string,
    url: string,
    details: string,
    itemsWithK1: { name: string; invoiceK1Amount: number }[],
  ): Promise<boolean> {
    const existedProject = await this._projectRepository.findOne({
      where: { name: name },
    });
    if (!existedProject) {
      const project = new Project();
      project.name = name;
      project.items = itemsWithK1.map((itm) => {
        const ret = new Item();
        ret.name = itm.name;
        ret.priceK1rub = itm.invoiceK1Amount;
        ret.invoices = [];
        return ret;
      });
      project.status = ProjectStatus.NO_INFO;
      project.url = url;
      project.details = details;

      const result = await this._projectRepository.save(project);
      if (result) {
        result.items.forEach(
          async (itm) =>
            await this._invoiceService.addInvoice(itm.id, itm.priceK1rub, 'K1'),
        );
      }
      return true;
    }

    return false;
  }

  async getAllAvailableItems(): Promise<ItemDto[]> {
    const items = await this._itemRepository.find({ relations: ['project'] });
    return (
      items
        ////.filter(itm => itm.project.status !== ProjectStatus.NO_INFO) //TODO: apply busines logic
        .map(
          (itm) =>
            new ItemDto(itm.id, itm.name, itm.project.name, itm.project.status),
        )
    ); //TODO: add details to order
  }
}
