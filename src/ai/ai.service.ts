import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { FilesService } from '../files/files.service';

@Injectable()
export class AiService {
  constructor(private readonly filesService: FilesService) {}
  private extractKeywords(question: string): string[] {
    return question
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          ![
            'the',
            'is',
            'a',
            'an',
            'and',
            'or',
            'to',
            'of',
            'in',
            'on',
            'for',
            'with',
          ].includes(word),
      );
  }

  async chat(projectId: number, question: string) {
    const keywords = this.extractKeywords(question);

    console.log('Keywords:', keywords);

    const files = await this.filesService.searchMany(projectId, keywords);
    if (files.length === 0) {
      return {
        answer: 'NO_FILES_FOUND',
        filesUsed: [],
      };
    }

    const topFiles = files.slice(0, 10);

    if (topFiles.length > 0) {
      console.log('First file:', topFiles[0]);
    }

    const context = this.buildContext(topFiles);

    const prompt = `
You are a senior software architect.

TASK:
Explain where the requested logic is implemented.

RULES:
- Use ONLY the provided files
- NEVER return full file paths
- ALWAYS summarize in human readable form
- Group related files together
- Explain briefly what each file does

FORMAT:
- bullet points only

FILES:
${context}

QUESTION:
${question}
`;

    console.log('================================');
    console.log(prompt);
    console.log('================================');

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'qwen2.5-coder:7b',
      prompt,
      stream: false,
    });

    return {
      answer: response.data.response,
      filesUsed: topFiles.map((f: any) => f.path),
    };
  }

  // 🧠 Context builder
  private buildContext(files: any[]) {
    return files.map((f) => `FILE_PATH: ${f.path}`).join('\n');
  }
}
