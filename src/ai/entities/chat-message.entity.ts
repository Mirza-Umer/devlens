import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

export enum ChatRole {
  USER = 'user',
  AI = 'ai',
}

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  projectId: number;

  @ManyToOne(() => Project, project => project.chatMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({
    type: 'enum',
    enum: ChatRole,
  })
  role: ChatRole;

  @Column({ type: 'text' })
  content: string;

  @Column('simple-array', { nullable: true })
  filesUsed: string[];

  @CreateDateColumn()
  createdAt: Date;
}
