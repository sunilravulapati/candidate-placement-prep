// backend/src/ai/prompts/resume/prompts.ts
//
// Resume prompt loader — reads prompt markdown files from the sibling md/ directory.
//
// Design decisions:
//  - Prompts are stored as .md files so they can be edited without touching TypeScript.
//  - fs.readFileSync is used at call time (not module load) to avoid Edge Runtime
//    issues. This is safe because prompts are only used in server-side actions.
//  - Template variable substitution uses {{variableName}} syntax for clarity.
//  - The RESUME_PROMPTS object provides named, typed access to each prompt.
//  - Each getter throws a descriptive error if the markdown file is missing,
//    making misconfigured deploys fail loudly instead of silently.
//
// Usage:
//   import { RESUME_PROMPTS } from '@/backend/src/ai/prompts/resume/prompts';
//
//   const prompt = RESUME_PROMPTS.ANALYZE_RESUME({
//     resumeText: extractedPdfText,
//   });

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the absolute path to the backend prompts directory by recursively
 * traversing upwards until it finds the root workspace structure.
 * This ensures the path resolves correctly regardless of whether the file
 * is executed locally, compiled by Next.js into `.next/server/...`, or
 * run via a Server Action.
 */
function resolvePromptDir(): string {
  let currentDir = __dirname;
  
  while (currentDir !== dirname(currentDir)) {
    const candidatePath = join(currentDir, 'backend', 'src', 'ai', 'prompts', 'resume', 'md');
    if (existsSync(candidatePath)) {
      return candidatePath;
    }
    currentDir = dirname(currentDir);
  }
  
  // Fallback to the local md directory if workspace structure isn't found
  return join(__dirname, 'md');
}

/** Absolute path to the md/ directory containing the prompt files. */
const PROMPT_DIR = resolvePromptDir();

/** Memory cache to prevent redundant file reads. */
const promptCache: Record<string, string> = {};

/**
 * Reads a markdown prompt file by name and returns its content as a string.
 *
 * @param name - Filename without extension (e.g. 'analyze-resume').
 * @returns      The raw markdown string from the file.
 * @throws       If the file does not exist or cannot be read.
 */
function loadPrompt(name: string): string {
  if (promptCache[name]) {
    return promptCache[name];
  }
  const filePath = join(PROMPT_DIR, `${name}.md`);
  try {
    const content = readFileSync(filePath, 'utf-8');
    promptCache[name] = content;
    return content;
  } catch (err) {
    throw new Error(
      `[RESUME_PROMPTS] Failed to load prompt "${name}.md" from ${PROMPT_DIR}. ` +
        `Ensure the file exists. Original error: ${(err as Error).message}`
    );
  }
}

/**
 * Substitutes all {{variableName}} template placeholders in a prompt string.
 *
 * Variables not present in the `vars` map are left as-is (no silent failure).
 * Conditional blocks {{#if key}}...{{/if}} are removed when the key is falsy.
 *
 * @param template - The raw prompt string with {{placeholders}}.
 * @param vars     - A map of variable names to their replacement values.
 * @returns          The prompt with all substitutions applied.
 */
function substitute(template: string, vars: Record<string, any>): string {
  let result = template;

  // Handle {{#if key}}...{{/if}} conditional blocks
  result = result.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, key: string, content: string) => {
      return vars[key] ? content.replace(`{{${key}}}`, vars[key]!) : '';
    }
  );

  // Substitute remaining {{variable}} placeholders
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    }
  }

  return result.trim();
}

// ---------------------------------------------------------------------------
// Template variable types
// ---------------------------------------------------------------------------

/** Variables for the general resume analysis prompt. */
export interface AnalyzeResumeVars {
  /** Full plain text of the resume extracted from the PDF. */
  resumeText: string;
}

/** Variables for the ATS targeted analysis prompt. */
export interface ATSAnalysisVars {
  /** Full plain text of the resume. */
  resumeText: string;
  /** Full text of the job description. */
  jobDescription: string;
  /** Target company name (optional). */
  company?: string;
  /** Target role name (optional). */
  roleName?: string;
}

/** Variables for the resume verification prompt. */
export interface VerifyResumeVars {
  /**
   * The document text to classify.
   * Callers should slice to the first 3000 characters to stay within token limits.
   */
  documentText: string;
}

/** Variables for the professional summary generation prompt. */
export interface ResumeSummaryVars {
  /** Full plain text of the resume. */
  resumeText: string;
  /** Target role name (optional). */
  roleName?: string;
  /** Comma-separated JD keywords to prioritise (optional). */
  jdKeywords?: string;
}

// ---------------------------------------------------------------------------
// RESUME_PROMPTS
// ---------------------------------------------------------------------------

/**
 * Named, typed accessors for all resume-related AI prompts.
 *
 * Each property is a function that accepts typed template variables and returns
 * the fully-substituted prompt string ready to pass to the AI provider.
 *
 * @example
 * const systemPrompt = RESUME_PROMPTS.ANALYZE_RESUME({ resumeText: text });
 * const result = await getAICompletion(
 *   [{ role: 'system', content: systemPrompt }],
 *   { jsonMode: true, temperature: 0.1 }
 * );
 */
export const RESUME_PROMPTS = {
  /**
   * General resume quality analysis prompt.
   * Returns a scored JSON response with strengths, improvements, and summary.
   */
  ANALYZE_RESUME: (vars: AnalyzeResumeVars): string =>
    substitute(loadPrompt('analyze-resume'), vars),

  /**
   * ATS-targeted resume vs. job description analysis prompt.
   * Returns a JSON response with match score, keyword analysis, and gaps.
   */
  ATS_ANALYSIS: (vars: ATSAnalysisVars): string =>
    substitute(loadPrompt('ats-analysis'), vars),

  /**
   * Resume document classification prompt.
   * Returns a JSON response with { isResume, confidence, reason }.
   * Use for the AI fallback in the upload validation pipeline.
   */
  VERIFY_RESUME: (vars: VerifyResumeVars): string =>
    substitute(loadPrompt('verify-resume'), vars),

  /**
   * Professional summary generation prompt.
   * Returns a JSON response with { summary: string }.
   */
  RESUME_SUMMARY: (vars: ResumeSummaryVars): string =>
    substitute(loadPrompt('resume-summary'), vars),
} as const;

export type ResumePromptKey = keyof typeof RESUME_PROMPTS;
