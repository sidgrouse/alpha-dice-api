import { Controller, Get } from '@nestjs/common';
import { ProjectDto } from 'src/dto/project.dto';
import { ProjectService } from 'src/services/project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getAll(): Promise<ProjectDto[]> {
    return this.projectService.getAll();
  }
}
