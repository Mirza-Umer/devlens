import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatMessage } from '../../ai/entities/chat-message.entity';
import { FileEntity } from '../../files/entities/file.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, user => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column()
  path: string;

  @OneToMany(() => ChatMessage, chat => chat.project)
  chatMessages: ChatMessage[];

  @OneToMany(() => FileEntity, file => file.project)
  files: FileEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
