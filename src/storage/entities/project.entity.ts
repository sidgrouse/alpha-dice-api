import { ProjectStatus } from 'src/constants/project-status';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NO_INFO,
  })
  status: ProjectStatus;

  @Column({ length: 300, nullable: true })
  url: string;

  @Column({ length: 100, nullable: true })
  details: string;

  @OneToMany(() => Item, (pldg) => pldg.project, { cascade: true })
  items: Item[];

  //comment, usercomments[]?
}
