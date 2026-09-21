import { Injectable } from '@nestjs/common';
import fg from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ALLOWED_EXTENSIONS, IGNORE_PATTERNS } from './scanner.ignore';

const execAsync = promisify(exec);

@Injectable()
export class ScannerService {
  async scan(projectPath: string) {
    projectPath = projectPath.trim();
    const isGit = projectPath.startsWith('http') || projectPath.startsWith('git@');
    
    if (!isGit && process.env.NODE_ENV === 'production') {
      throw new Error('Local folder paths cannot be scanned from the cloud. Please provide a GitHub URL instead.');
    }

    let scanTarget = projectPath;
    let tempDir = '';

    if (isGit) {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devlens-clone-'));
      scanTarget = tempDir;
      try {
        const safePath = projectPath.replace(/:\/\/([^@]+)@/, '://***@');
        console.log(`Cloning repository: ${safePath} into ${tempDir}`);
        await execAsync(`git clone -q --depth 1 "${projectPath}" "${tempDir}"`, {
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
        });
      } catch (err: any) {
        console.error('Git clone failed:', err);
        if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
        throw new Error('Failed to clone Git repository: ' + (err.stderr || err.message));
      }
    }

    const normalizedPath = scanTarget.replace(/\\/g, '/');
    const files = await fg(['**/*.*'], {
      cwd: normalizedPath,
      absolute: true,
      onlyFiles: true,
      ignore: IGNORE_PATTERNS,
    });

    const result: any[] = [];

    for (const file of files) {
      if (!this.isValid(file)) continue;

      const content = this.readFile(file);

      if (!content) continue;

      const displayPath = isGit ? file.replace(normalizedPath + '/', '') : file;

      result.push({
        path: displayPath,
        content,
      });
    }

    if (isGit && tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
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
