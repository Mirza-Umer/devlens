import { Injectable } from '@nestjs/common';
import fg from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';
import { ALLOWED_EXTENSIONS, IGNORE_PATTERNS } from './scanner.ignore';

@Injectable()
export class ScannerService {
  async scan(projectPath: string) {
    const files = await fg(['**/*.*'], {
      cwd: projectPath,
      absolute: true,
      onlyFiles: true,
      ignore: IGNORE_PATTERNS,
    });

    const result: any[] = [];

    for (const file of files) {
      if (!this.isValid(file)) continue;

      const content = this.readFile(file);

      if (!content) continue;

      result.push({
        path: file,
        content,
      });
    }

    return result;
  }

  private isValid(file: string) {
    return ALLOWED_EXTENSIONS.includes(path.extname(file));
  }

  private readFile(file: string) {
    try {
      const buffer = fs.readFileSync(file);

      if (buffer.includes(0)) return '';

      return buffer.toString('utf-8');
    } catch {
      return '';
    }
  }
}
