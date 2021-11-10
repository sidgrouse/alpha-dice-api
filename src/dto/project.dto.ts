import { ProjectStatus } from 'src/constants/project-status';
import { ItemDto } from './item.dto';

export class ProjectDto {
  constructor(
    public id: number,
    public name: string,
    public status: ProjectStatus,
    public url: string,
    public details: string,
    public items: ItemDto[],
  ) {}
}
