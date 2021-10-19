import { ProjectStatus } from "src/constants/project-status";

export class ItemDto{
    constructor(public id: number, public name: string, public projectName: string, public projectStatus: ProjectStatus){
    }

    toString(): string{
        return `${this.name}${this.projectName === this.name ? ' ' : '('+this.projectName+') '} - ${this.projectStatus}`;
    }
}