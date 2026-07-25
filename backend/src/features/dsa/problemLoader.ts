// backend/src/features/dsa/problemLoader.ts

import fs from 'fs';
import path from 'path';
import { DSAProblemMetadata } from './dsaTypes';

export class ProblemLoader {
  private static findProblemsDir(): string | null {
    const candidates = [
      path.join(process.cwd(), 'data', 'problems'),
      path.join(process.cwd(), 'backend', 'data', 'problems'),
      path.join(process.cwd(), '..', 'backend', 'data', 'problems'),
    ];
    return candidates.find((c) => fs.existsSync(c)) || null;
  }

  public static loadDirectoryProblem(slug: string): DSAProblemMetadata | null {
    const problemsDir = this.findProblemsDir();
    if (!problemsDir) return null;

    const problemFolder = path.join(problemsDir, slug);
    if (!fs.existsSync(problemFolder)) return null;

    const jsonPath = path.join(problemFolder, 'problem.json');
    if (!fs.existsSync(jsonPath)) return null;

    try {
      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      // Read editorial.md if present
      const editorialPath = path.join(problemFolder, 'editorial.md');
      if (fs.existsSync(editorialPath)) {
        raw.editorial = fs.readFileSync(editorialPath, 'utf-8');
      }

      // Read tests.json if present
      const testsPath = path.join(problemFolder, 'tests.json');
      if (fs.existsSync(testsPath)) {
        const tests = JSON.parse(fs.readFileSync(testsPath, 'utf-8'));
        raw.tests = tests;
        raw.visibleTests = tests.filter((t: any) => !t.classification || t.classification === 'sample' || t.classification === 'edge' || t.classification === 'corner');
        raw.hiddenTests = tests.filter((t: any) => t.classification === 'hidden' || t.classification === 'performance');
      }

      // Read hints.md if present
      const hintsPath = path.join(problemFolder, 'hints.md');
      if (fs.existsSync(hintsPath)) {
        const hintsContent = fs.readFileSync(hintsPath, 'utf-8');
        raw.hints = hintsContent.split('\n---\n').map((h) => h.trim()).filter(Boolean);
      }

      // Read reference solutions from solutions/ folder if present
      const solutionsDir = path.join(problemFolder, 'solutions');
      if (fs.existsSync(solutionsDir)) {
        raw.solutionMetadata = raw.solutionMetadata || {};
        raw.solutionMetadata.optimalCode = raw.solutionMetadata.optimalCode || {};
        const solFiles = fs.readdirSync(solutionsDir);
        for (const file of solFiles) {
          const filePath = path.join(solutionsDir, file);
          if (fs.statSync(filePath).isFile()) {
            const ext = path.extname(file).replace('.', '');
            const nameWithoutExt = path.basename(file, path.extname(file));
            const lang = ext === 'cpp' ? 'cpp' : ext === 'py' ? 'python' : ext === 'java' ? 'java' : ext === 'ts' ? 'typescript' : ext === 'js' ? 'javascript' : nameWithoutExt;
            raw.solutionMetadata.optimalCode[lang] = fs.readFileSync(filePath, 'utf-8');
          }
        }
      }

      return raw as DSAProblemMetadata;
    } catch (err) {
      console.warn(`Failed loading directory problem "${slug}":`, (err as Error).message);
      return null;
    }
  }

  public static loadSearchIndex(): any[] {
    const dataDirCandidates = [
      path.join(process.cwd(), 'data', 'search-index.json'),
      path.join(process.cwd(), 'backend', 'data', 'search-index.json'),
      path.join(process.cwd(), '..', 'backend', 'data', 'search-index.json'),
    ];
    const indexFile = dataDirCandidates.find((c) => fs.existsSync(c));
    if (!indexFile) return [];

    try {
      return JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
    } catch {
      return [];
    }
  }

  public static loadAllDirectoryProblems(): DSAProblemMetadata[] {
    const problemsDir = this.findProblemsDir();
    if (!problemsDir) return [];

    const entries = fs.readdirSync(problemsDir, { withFileTypes: true });
    const result: DSAProblemMetadata[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const prob = this.loadDirectoryProblem(entry.name);
        if (prob) result.push(prob);
      }
    }

    return result;
  }
}
