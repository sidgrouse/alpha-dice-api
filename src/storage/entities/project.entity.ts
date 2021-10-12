import { InvoiceStatus } from 'src/constants/invoice-status';
import { ProjectStatus } from 'src/constants/project-status';
import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
export class Project{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50})
    projectName: string;

    @Column({
        type: "enum",
        enum: ProjectStatus,
        default: ProjectStatus.NO_INFO
    })
    status: ProjectStatus;

    @Column({length: 300, nullable: true})
    url: string;

    @Column({length: 100, nullable: true})
    details: string;
}