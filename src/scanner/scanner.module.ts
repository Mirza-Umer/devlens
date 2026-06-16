import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScannerController } from './scanner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../files/entities/file.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
  controllers: [ScannerController],
  providers: [ScannerService],
  imports: [],
})
export class ScannerModule {}
