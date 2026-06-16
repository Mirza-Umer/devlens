import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: number;

  @Column()
  path: string; // full file path inside project

  @Column({nullable: true})
  name: string; // file name only (optional but useful)

  @Column({nullable: true})
  extension: string; // .ts, .html, .js etc

  @Column({ type: 'text' })
  content: string; // full file content

  @Column({ nullable: true })
  size: number; // file size in bytes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
