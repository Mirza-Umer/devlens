import { Controller, Get, Post, Param, Body, Delete, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ✅ CREATE PROJECT
  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: any) {
    return this.projectsService.create(dto, req.user.id);
  }

  // ✅ GET ALL PROJECTS
  @Get()
  findAll(@Req() req: any) {
    return this.projectsService.findAll(req.user.id);
  }

  // ✅ GET ONE PROJECT
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.projectsService.findOne(+id, req.user.id);
  }

  // ✅ DELETE PROJECT
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.projectsService.remove(+id, req.user.id);
  }

  // 🚀 SCAN PROJECT (CORE FEATURE)
  @Post(':id/scan')
  scan(@Param('id') id: string, @Req() req: any) {
    // In a real app we'd verify project ownership inside the scan method too
    return this.projectsService.scanProject(+id);
  }
}
