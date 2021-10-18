import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Project } from 'src/storage/entities/project.entity';
import { ProjectStatus } from 'src/constants/project-status';
import { Item } from 'src/storage/entities/item.entity';

@Injectable()
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private _projectRepository: Repository<Project>
      ) {}

    async tryAddProject(name: string, url: string, details: string, items: string[]): Promise<boolean> {
        const existedProject = await this._projectRepository.findOne({where: {name: name}})

        if(!existedProject){
            const project = new Project();
            project.name = name;
            project.items = items.map(itm => {let ret = new Item(); ret.name = itm; return ret;});
            project.status = ProjectStatus.NO_INFO;
            project.url = url;
            project.details = details;

            console.log('================',items);
            console.log('===============-',project.items);
            await this._projectRepository.save(project);
            return true;
        }

        return false;
    }
}