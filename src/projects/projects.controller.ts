import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ✅ CREATE PROJECT
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  // ✅ GET ALL PROJECTS
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  // ✅ GET ONE PROJECT
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  // ✅ DELETE PROJECT
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }

  // 🚀 SCAN PROJECT (CORE FEATURE)
  @Post(':id/scan')
  scan(@Param('id') id: string) {
    return this.projectsService.scanProject(+id);
  }
}
