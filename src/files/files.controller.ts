import { Controller, Get, Query, Param } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // 🔎 SEARCH CODE
  @Get('search')
  search(@Query('projectId') projectId: number, @Query('q') q: string) {
    return this.filesService.search(projectId, q);
  }
  // 📄 GET FILES OF PROJECT
  @Get('project/:id')
  getByProject(@Param('id') id: string) {
    return this.filesService.getByProject(+id);
  }

  // 📄 GET SINGLE FILE
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.filesService.getOne(+id);
  }
}
