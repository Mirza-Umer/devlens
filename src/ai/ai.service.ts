import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { FilesService } from '../files/files.service';

@Injectable()
export class AiService {
  // Initialize the Gemini Client
  private genAI:GoogleGenerativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
            'how',
            'where',
            'what',
          ].includes(word),
      )
      .map((word) => {
        if (word.endsWith('ing')) return word.slice(0, -3);
        if (word.endsWith('ion')) return word.slice(0, -3);
        if (word.endsWith('ed')) return word.slice(0, -2);
        return word;
      });
  }

  async chat(projectId: number, question: string) {
    const keywords = this.extractKeywords(question);
    const files = await this.filesService.searchMany(projectId, keywords);

    if (files.length === 0) {
      return { answer: 'NO_FILES_FOUND', filesUsed: [] };
    }

    const topFiles = files.slice(0, 10);
    const context = this.buildContext(topFiles);

    // Notice how we removed the <scratchpad> instructions from the prompt
    // because we will enforce it via the JSON schema below.
    const prompt = `
You are a Senior Software Architect.

TASK:
Analyze the provided codebase context and explain where and how the requested logic is implemented.

CONSTRAINTS & RULES:
- Grounding: Use EXCLUSIVELY the provided context. If the answer is truly not present after careful analysis, output: "I cannot determine this from the provided files."
- File Paths: Use base filenames or short module names. NEVER output absolute/full file paths.
- Plain English: Summarize the logic conceptually. Do not just regurgitate raw code.
- Organization: Group related files logically (e.g., by feature, architecture layer, or domain).

<context>
${context}
</context>

<question>
${question}
</question>
`;

    // Initialize Gemini with a strict JSON Schema configuration
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            analysis: {
              type: SchemaType.STRING,
              description: 'Step-by-step analysis of the core concepts and file evaluation. (Hidden from user)',
            },
            markdownSummary: {
              type: SchemaType.STRING,
              description: 'The final, formatted bulleted list grouping the related files and explaining the logic.',
            },
          },
          required: ['analysis', 'markdownSummary'],
        },
      },
    });

    // Execute the prompt
    const result = await model.generateContent(prompt);

    // Parse the guaranteed JSON response
    const jsonResponse = JSON.parse(result.response.text());

    return {
      answer: jsonResponse.markdownSummary, // We only return the final markdown to the frontend!
      filesUsed: topFiles.map((f: any) => f.path),
    };
  }

  // 🧠 Context builder
  private buildContext(files: any[]) {
    return files
      .map((f) => `--- FILE: ${f.path} ---\n${f.content}\n`)
      .join('\n\n');
  }
}
