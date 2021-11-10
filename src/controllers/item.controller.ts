import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ProjectService } from 'src/services/project.service';

@Controller('item')
export class ItemController {
  constructor(private readonly projectService: ProjectService) {}

  @Patch(':id')
  async updateProject(@Param() id: number, @Body() itemPatch: any) {
    await this.projectService.patchItem(id, itemPatch);
  }
}
