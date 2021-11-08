import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProjectDto } from 'src/dto/create-project.dto';
import { ProjectDto } from 'src/dto/project.dto';
import { ProjectService } from 'src/services/project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getAll(): Promise<ProjectDto[]> {
    return await this.projectService.getAll();
  }

  @Patch(':id')
  async updateProject(@Param() id: number, @Body() projectPatch: any) {
    console.log(id, projectPatch);
    await this.projectService.patchProject(id, projectPatch);
  }

  @Post()
  async createProject(@Body() project: CreateProjectDto) {
    await this.projectService.tryAddProject(
      project.name,
      project.url,
      project.details,
      null,
    );
  }
}
