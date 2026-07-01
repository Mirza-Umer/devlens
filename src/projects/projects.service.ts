import { Injectable, BadRequestException } from '@nestjs/common';
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
    } catch (err: any) {
      await this.projectRepo.delete(savedProject.id);
      throw new BadRequestException(err.message || 'Failed to scan project');
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
    const project = await this.projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect('project.user', 'user')
      .addSelect('user.gitHubToken')
      .where('project.id = :id', { id: projectId })
      .getOne();

    if (!project) {
      throw new Error('Project not found');
    }

    let scanPath = project.path;
    if (project.user?.gitHubToken && (scanPath.startsWith('http') || scanPath.startsWith('git@'))) {
      if (scanPath.startsWith('https://github.com/') && !scanPath.includes('@github.com')) {
        scanPath = scanPath.replace('https://github.com/', `https://${project.user.gitHubToken}@github.com/`);
      } else if (scanPath.startsWith('https://www.github.com/') && !scanPath.includes('@github.com')) {
        scanPath = scanPath.replace('https://www.github.com/', `https://${project.user.gitHubToken}@github.com/`);
      }
    }

    const scannedFiles = await this.scannerService.scan(scanPath);

    await this.filesService.saveFiles(project.id, scannedFiles);

    return {
      message: 'Scan completed',
      filesScanned: scannedFiles.length,
    };
  }
}
