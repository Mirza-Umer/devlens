import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { FilesModule } from '../files/files.module';
import { ChatMessage } from './entities/chat-message.entity';

@Module({
  imports: [FilesModule, TypeOrmModule.forFeature([ChatMessage])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
