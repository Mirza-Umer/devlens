import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ChatRole {
  USER = 'user',
  AI = 'ai',
}

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: number;

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
