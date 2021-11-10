import { AddItemDto } from './item.add.dto';

export class AddProjectDto {
  constructor(
    public name: string,
    public url: string,
    public details: string,
    public items: AddItemDto[],
  ) {}
}
