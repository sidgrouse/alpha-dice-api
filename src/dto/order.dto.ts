import { ProjectStatus } from 'src/constants/project-status';

export class OrderDto {
  constructor(
    public id: number,
    public projectName: string,
    public itemName: string,
    public projectStatus: ProjectStatus,
    public count: number,
    public comment: string,
  ) {}
}
