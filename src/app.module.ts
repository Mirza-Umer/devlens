import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { FilesModule } from './files/files.module';
import { ScannerModule } from './scanner/scanner.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'POSTGRES',
      database: 'devlens-db',
      autoLoadEntities: true,
      synchronize: false,
      logging: true,
    }),
    ProjectsModule,
    FilesModule,
    ScannerModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
