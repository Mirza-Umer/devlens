import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { FilesModule } from '../files/files.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [AiController],
  providers: [AiService,FilesService],
})
export class AiModule {}
