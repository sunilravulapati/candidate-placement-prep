// backend/src/features/dsa/problemLoader.ts

import fs from 'fs';
import path from 'path';
import { DSAProblemMetadata, TestCaseSpec } from './dsaTypes';
import { normalizeTestInput } from './inputNormalizer';

function getDataDir(): string {
  const candidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  return candidates.find((c) => fs.existsSync(c)) || path.join(process.cwd(), 'backend', 'data');
}

export interface LoadedProblemBundle {
  metadata: DSAProblemMetadata;
  visibleTests: TestCaseSpec[];
  hiddenTests: TestCaseSpec[];
  allTests: TestCaseSpec[];
  editorialMarkdown?: string;
  hintsMarkdown?: string;
  referenceSolutions?: Record<string, string>;
}

export function loadProblemBySlug(slug: string): LoadedProblemBundle | null {
  const problemDir = path.join(getDataDir(), 'problems', slug);
  const jsonPath = path.join(problemDir, 'problem.json');

  if (!fs.existsSync(jsonPath)) {
    return null;
  }

  const rawJson = fs.readFileSync(jsonPath, 'utf-8');
  const metadata: DSAProblemMetadata = JSON.parse(rawJson);

  let allTests: TestCaseSpec[] = [];
  const testsJsonPath = path.join(problemDir, 'tests.json');

  if (fs.existsSync(testsJsonPath)) {
    const rawTests = fs.readFileSync(testsJsonPath, 'utf-8');
    allTests = JSON.parse(rawTests);
  } else {
    allTests = [...((metadata as any).visibleTests || []), ...((metadata as any).hiddenTests || [])];
  }

  allTests = allTests.map((t) => ({
    ...t,
    input: normalizeTestInput(t.input),
  }));

  const visibleTests = allTests.filter((t) => t.classification === 'sample' || (t.id && t.id.startsWith('sample')));
  const hiddenTests = allTests.filter((t) => t.classification !== 'sample' && (!t.id || !t.id.startsWith('sample')));

  const editorialPath = path.join(problemDir, 'editorial.md');
  const editorialMarkdown = fs.existsSync(editorialPath) ? fs.readFileSync(editorialPath, 'utf-8') : undefined;

  const hintsPath = path.join(problemDir, 'hints.md');
  const hintsMarkdown = fs.existsSync(hintsPath) ? fs.readFileSync(hintsPath, 'utf-8') : undefined;

  const referenceSolutions: Record<string, string> = (metadata as any).referenceSolutions || {};
  const solutionsDir = path.join(problemDir, 'solutions');

  if (fs.existsSync(solutionsDir)) {
    const langs = ['cpp', 'py', 'java', 'js', 'ts'];
    langs.forEach((ext) => {
      const filePath = path.join(solutionsDir, `reference.${ext}`);
      if (fs.existsSync(filePath)) {
        const fullLang = ext === 'py' ? 'python' : ext === 'js' ? 'javascript' : ext === 'ts' ? 'typescript' : ext;
        referenceSolutions[fullLang] = fs.readFileSync(filePath, 'utf-8');
      }
    });
  }

  return {
    metadata,
    visibleTests,
    hiddenTests,
    allTests,
    editorialMarkdown,
    hintsMarkdown,
    referenceSolutions,
  };
}

export class ProblemLoader {
  private static findProblemsDir(): string | null {
    return getDataDir() ? path.join(getDataDir(), 'problems') : null;
  }

  public static loadDirectoryProblem(slug: string): DSAProblemMetadata | null {
    const bundle = loadProblemBySlug(slug);
    if (!bundle) return null;
    const raw = { ...bundle.metadata } as any;
    if (bundle.editorialMarkdown) raw.editorial = bundle.editorialMarkdown;
    raw.visibleTests = bundle.visibleTests;
    raw.hiddenTests = bundle.hiddenTests;
    raw.tests = bundle.allTests;
    if (bundle.referenceSolutions) raw.referenceSolutions = bundle.referenceSolutions;
    return raw as DSAProblemMetadata;
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
    if (!problemsDir || !fs.existsSync(problemsDir)) return [];

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
