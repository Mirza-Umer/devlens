import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FilesService {
  ignoredFiles = [
    'package-lock.json',
    'package.json',
    'README.md',
    'README.txt',
    '.gitignore',
  ];

  private isIgnored(path: string): boolean {
    return this.ignoredFiles.some((ignore) => path.includes(ignore));
  }

  private scoreFile(path: string, keywords: string[]): number {
    let score = 0;
    const lowerPath = path.toLowerCase();

    for (const keyword of keywords) {
      if (lowerPath.includes(keyword)) {
        score += 5;
      }
    }

    if (lowerPath.includes('/core/services/')) score += 2;
    if (lowerPath.includes('/pages/')) score += 1;

    if (
      lowerPath.includes('snackbar') ||
      lowerPath.includes('dialog') ||
      lowerPath.includes('health')
    ) {
      score -= 2; // utility noise penalty
    }

    return score;
  }

  constructor(
    @InjectRepository(FileEntity)
    private fileRepo: Repository<FileEntity>,
  ) {}

  // SAVE SCANNED FILES
  async saveFiles(projectId: number, files: any[]) {
    // Clear old files for this project to prevent duplicates on rescan
    await this.fileRepo.delete({ projectId });

    const entities = files.map((f) =>
      this.fileRepo.create({
        projectId,
        path: f.path,
        content: f.content,
      }),
    );

    // Save in chunks to avoid Postgres parameter limit errors for large projects
    return this.fileRepo.save(entities, { chunk: 100 });
  }

  async search(projectId: number, query: string) {
    return this.fileRepo
      .createQueryBuilder('file')
      .where('file.projectId = :projectId', { projectId })
      .andWhere(
        '(LOWER(file.path) LIKE LOWER(:q) OR LOWER(file.content) LIKE LOWER(:q))',
        { q: `%${query}%` },
      )
      .orderBy(
        `CASE
          WHEN LOWER(file.path) LIKE LOWER(:exact) THEN 1
          WHEN LOWER(file.content) LIKE LOWER(:exact) THEN 2
          ELSE 3
        END`,
      )
      .setParameter('exact', `%${query}%`)
      .take(10)
      .getMany();
  }

  async searchMany(projectId: number, keywords: string[]) {
    let results: any = [];

    for (const keyword of keywords) {
      const files = await this.search(projectId, keyword);

      results.push(
        ...files.filter(
          (file) =>
            !this.ignoredFiles.some((ignore) => file.path.includes(ignore)),
        ),
      );
    }

    results = results.filter((file) => !this.isIgnored(file.path));

    // 🔥 FIX: Removed the filter that drops score <= 0.
    // Now we ONLY sort, meaning content-only matches are preserved!
    results.sort(
      (a, b) =>
        this.scoreFile(b.path, keywords) - this.scoreFile(a.path, keywords),
    );

    // 🔥 fallback if nothing found
    if (results.length === 0 && keywords.length > 0) {
      const fallback = await this.search(projectId, keywords.join(' '));

      results = fallback.filter(
        (file) =>
          !this.ignoredFiles.some((ignore) => file.path.includes(ignore)),
      );
    }

    const uniqueFiles = [
      ...new Map(results.map((file: any) => [file.id, file])).values(),
    ];

    return uniqueFiles.slice(0, 10);
  }

  // GET FILES BY PROJECT
  getByProject(projectId: number) {
    return this.fileRepo.find({
      where: { projectId },
    });
  }

  // GET SINGLE FILE
  getOne(id: number) {
    return this.fileRepo.findOneBy({ id });
  }
}
