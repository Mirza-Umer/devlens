import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { FileEntity } from '../files/entities/file.entity';
import { ScannerService } from '../scanner/scanner.service';
import { FilesModule } from '../files/files.module';
import { ScannerModule } from '../scanner/scanner.module';
import { Scanner } from '../scanner/entities/scanner.entity';
import { FilesService } from '../files/files.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService,ScannerService,FilesService],
  imports: [TypeOrmModule.forFeature([Project,FileEntity])],
})
export class ProjectsModule {}
