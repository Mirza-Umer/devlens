import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ScannerService } from '../scanner/scanner.service';
import { FilesService } from '../files/files.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    private scannerService: ScannerService,
    private filesService: FilesService,
  ) {}

  // CREATE
  create(dto: CreateProjectDto) {
    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  // FIND ALL
  findAll() {
    return this.projectRepo.find();
  }

  // FIND ONE
  findOne(id: number) {
    return this.projectRepo.findOneBy({ id });
  }

  // DELETE
  async remove(id: number) {
    await this.projectRepo.delete(id);
    return { message: 'Deleted successfully' };
  }

  // SCAN PROJECT (CORE FLOW)
  async scanProject(projectId: number) {
    const project = await this.projectRepo.findOneBy({ id: projectId });

    if (!project) {
      throw new Error('Project not found');
    }

    const scannedFiles = await this.scannerService.scan(project.path);

    await this.filesService.saveFiles(project.id, scannedFiles);

    return {
      message: 'Scan completed',
      filesScanned: scannedFiles.length,
    };
  }
}
