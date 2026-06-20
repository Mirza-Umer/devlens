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

  async create(dto: CreateProjectDto, userId: string) {
    const project = this.projectRepo.create({ ...dto, userId });
    const savedProject = await this.projectRepo.save(project);
    try {
      // Automatically scan the project after creating it
      await this.scanProject(savedProject.id);
      return savedProject;
    } catch (err) {
      await this.projectRepo.delete(savedProject.id);
      throw err;
    }
  }

  // FIND ALL
  findAll(userId: string) {
    return this.projectRepo.find({ where: { userId } });
  }

  // FIND ONE
  findOne(id: number, userId: string) {
    return this.projectRepo.findOneBy({ id, userId });
  }

  // DELETE
  async remove(id: number, userId: string) {
    await this.projectRepo.delete({ id, userId });
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
