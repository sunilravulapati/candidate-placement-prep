// backend/src/features/resume/parser.ts
//
// Regex-based structural resume parser.
// Ported from resume-ai-backend/services/resumeParser.js.
//
// Converts raw PDF-extracted plain text into a structured metadata object
// that can be used for:
//   - ATS scoring input (structureScore, impactScore, etc.)
//   - Upload validation (section presence, contact signals)
//   - AI prompt enrichment (skills, action verbs for context)
//
// Pure functions — no side effects, no AI calls.
// The heavy AI-level parsing (full canonical schema extraction) is a separate
// concern handled by the tailoring service.
//
// ⚠️  Vocabulary constants have moved to constants.ts.
//     SECTION_KEYWORDS, SKILL_DICTIONARY, and ACTION_VERB_LIST are imported
//     from there. Named re-exports at the bottom preserve backwards compatibility.

import {
  SECTION_KEYWORDS,
  SKILL_DICTIONARY,
  ACTION_VERB_LIST,
} from './constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Contact information extracted from resume text via regex. */
export interface ResumeContacts {
  /** Email address, or null if not found. */
  email: string | null;
  /** Phone number (various formats), or null if not found. */
  phone: string | null;
  /** LinkedIn profile path (e.g. "linkedin.com/in/johndoe"), or null. */
  linkedin: string | null;
  /** GitHub profile path (e.g. "github.com/johndoe"), or null. */
  github: string | null;
  /** First detected URL (used as portfolio proxy), or null. */
  portfolio: string | null;
}

/**
 * Structured metadata produced by `parseResume`.
 * Represents a lightweight summary of the resume — not a full canonical schema.
 */
export interface ParsedResumeMetadata {
  /** Section headings detected in the text (lowercase). */
  sections: string[];
  /** Extracted contact information. */
  contacts: ResumeContacts;
  /** All detected bullet point texts (length > 10 chars). */
  bullets: string[];
  /** Technology and tool names matched from a curated dictionary. */
  skills: string[];
  /** Distinct quantified metric expressions found (e.g. "50%", "200ms"). */
  metrics: string[];
  /** Total word count of the resume. */
  wordCount: number;
  /** Strong past-tense action verbs detected in the text. */
  actionVerbs: string[];
  /** Whether the resume contains a summary/objective/profile section. */
  hasObjective: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Detects which standard resume sections are present in the text.
 *
 * @param lowerText - The resume text already converted to lowercase.
 */
function detectSections(lowerText: string): string[] {
  return SECTION_KEYWORDS.filter(section => lowerText.includes(section));
}

/**
 * Extracts contact signal values using regex.
 *
 * @param text - The original (case-preserved) resume text.
 */
function extractContacts(text: string): ResumeContacts {
  return {
    email:
      text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] ?? null,
    phone:
      text.match(/\+?\d[\d\s\-]{8,}\d/)?.[0] ?? null,
    linkedin:
      text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i)?.[0] ?? null,
    github:
      text.match(/github\.com\/[a-zA-Z0-9_-]+/i)?.[0] ?? null,
    portfolio:
      text.match(/https?:\/\/[^\s]+/i)?.[0] ?? null,
  };
}

/**
 * Extracts all bullet point texts from the resume.
 * Matches: •, -, –, *, >, numbered lists (1. 2.), and indented lines.
 * Skips noise entries shorter than 10 characters.
 *
 * @param text - The original resume text.
 */
function extractBulletPoints(text: string): string[] {
  const bulletRegex = /(?:^|\n)[\t ]*(?:[\u2022\u2023\u25e6\u2043\u2219*\->]|\d+[.)])[\t ]*(?:\n[\t ]*)?([^\r\n]+)/g;
  const bullets: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = bulletRegex.exec(text)) !== null) {
    const trimmed = match[1]?.trim() ?? '';
    if (trimmed.length > 10) {
      bullets.push(trimmed);
    }
  }

  return bullets;
}

/**
 * Matches technology skills from the curated dictionary against the text.
 * Returns skill names in their original (unescaped) form.
 *
 * @param lowerText - The resume text already converted to lowercase.
 */
function extractSkills(lowerText: string): string[] {
  return SKILL_DICTIONARY.filter(skill => {
    // Re-use the escaped form for the regex, but return the display form
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    return regex.test(lowerText);
  }).map(skill =>
    // Un-escape for display: "c\\+\\+" → "c++"
    skill.replace(/\\(.)/g, '$1')
  );
}

/**
 * Extracts distinct quantified metric expressions from the text.
 *
 * @param text - The original resume text.
 */
function extractMetrics(text: string): string[] {
  const metricRegex =
    /\b\d+(\.\d+)?[KkMmBb]?\+?\s*(%|users?|customers?|clients?|requests?|ms|seconds?|hours?|days?|latency|accuracy|reduction|increase|growth|improvement|transactions?|downloads?|deployments?|repos?)\b/gi;

  const matches = text.match(metricRegex);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Detects which strong action verbs from the dictionary appear in the text.
 *
 * @param lowerText - The resume text already converted to lowercase.
 */
function extractActionVerbs(lowerText: string): string[] {
  return ACTION_VERB_LIST.filter(verb =>
    new RegExp(`\\b${verb}\\b`, 'i').test(lowerText)
  );
}

/**
 * Counts the total number of words in the text.
 *
 * @param text - The original resume text.
 */
function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

// ---------------------------------------------------------------------------
// parseResume (main export)
// ---------------------------------------------------------------------------

/**
 * Parses raw PDF-extracted resume text into a structured metadata object.
 *
 * This is a lightweight structural analysis — it does NOT extract the full
 * canonical resume schema (sections, experience entries, etc.). That level
 * of extraction is performed by the AI tailoring service.
 *
 * Use cases:
 *  - Feed `wordCount` and detected `sections` into `scoring.ts` functions.
 *  - Use `contacts` for upload validation.
 *  - Use `skills` and `actionVerbs` to enrich AI prompt context.
 *
 * @param text - Raw plain text extracted from the uploaded PDF file.
 * @returns     A `ParsedResumeMetadata` object.
 *
 * @example
 * const meta = parseResume(pdfText);
 * console.log(meta.skills);       // ['react', 'node', 'postgresql']
 * console.log(meta.wordCount);    // 412
 * console.log(meta.hasObjective); // true
 */
export function parseResume(text: string): ParsedResumeMetadata {
  if (typeof text !== 'string') {
    throw new Error('Resume parser requires extracted text.');
  }

  const lowerText = text.toLowerCase();

  return {
    sections:     detectSections(lowerText),
    contacts:     extractContacts(text),
    bullets:      extractBulletPoints(text),
    skills:       extractSkills(lowerText),
    metrics:      extractMetrics(text),
    wordCount:    countWords(text),
    actionVerbs:  extractActionVerbs(lowerText),
    hasObjective: /objective|summary|profile/i.test(lowerText),
  };
}

// ---------------------------------------------------------------------------
// Named re-exports (for targeted use in tests and other modules)
// ---------------------------------------------------------------------------
// These are deliberately not the default export — consumers should import
// parseResume for normal use and these only when testing sub-routines.
export {
  detectSections,
  extractContacts,
  extractBulletPoints,
  extractSkills,
  extractMetrics,
  extractActionVerbs,
  countWords,
  SKILL_DICTIONARY,
  ACTION_VERB_LIST,
};
