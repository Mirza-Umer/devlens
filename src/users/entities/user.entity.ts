import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  ipAddress!: string;

  @Column({ default: 'user' })
  role!: string;

  @OneToMany(() => Project, project => project.user)
  projects!: Project[];

  @CreateDateColumn()
  createdAt!: Date;
}
