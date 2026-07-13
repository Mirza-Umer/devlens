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

  @Column({ nullable: true })
  password!: string;

  @Column({ nullable: true })
  ipAddress!: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  region?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  latitude?: string;

  @Column({ nullable: true })
  longitude?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ nullable: true })
  org?: string;

  @Column({ default: 'user' })
  role!: string;

  @Column({ nullable: true, select: false })
  gitHubToken?: string;

  @OneToMany(() => Project, project => project.user)
  projects!: Project[];

  @CreateDateColumn()
  createdAt!: Date;
}
