import { ProjectStatus } from 'src/constants/project-status';

export class CreateProjectDto {
  constructor(
    public name: string,
    public status: ProjectStatus,
    public url: string,
    public details: string,
  ) {}
}
