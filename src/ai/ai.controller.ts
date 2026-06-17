import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(
    @Body('projectId') projectId: number,
    @Body('question') question: string,
  ) {
    return this.aiService.chat(projectId, question);
  }

  @Get('chat/:projectId')
  getHistory(@Param('projectId') projectId: string) {
    return this.aiService.getHistory(+projectId);
  }
}
