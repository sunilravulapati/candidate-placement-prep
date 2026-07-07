// backend/src/features/resume/exportPipeline.ts
//
// Resume export preparation pipeline.
// Ported and enhanced from resume-ai-backend/backend/services/resumeFormat.js.
//
// Orchestrates the end-to-end processing pipeline for preparing the canonical
// resume payload for export or downstream consumption (e.g. rendering, matching):
//   1. Parsing (if input is a string)
//   2. Normalization (structures raw AI/legacy fields into NormalizedResume)
//   3. Limit Enforcement (scores entries and clamps arrays to standard single-page limits)
//   4. Trimming & Deduplication (applies section-aware trimming and ranks bullets)
//   5. Quality Auditing (runs non-mutating validation to generate warning reports)
//
// Pure functions — no side effects, no database calls, no PDF rendering.

import { RESUME_LIMITS } from './constants';
import { normalizeResume } from './normalizer';
import { validateResumeData, evaluateResumeQuality } from './resumeValidator';
import { sectionAwareTrimming } from './trimmer';
import type { NormalizedResume, ProjectEntry, ExperienceEntry } from './normalizer';
import type { TrimmedResume } from './trimmer';
import type { RoleType } from './bulletScorer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration options for the export pipeline. */
export interface ExportOptions {
  /** Optional job description text to align the candidate experience against. */
  jobDescription?: string;
  /** Pre-tailoring baseline resume (used to restore projects and calculate preservation score). */
  originalResume?: NormalizedResume | null;
  /** Role context for applying role-aware keyword boosts in bullet scoring. */
  role?: RoleType;
}

/**
 * The final structured payload returned by the export pipeline.
 * Represents the complete canonical payload ready for template formatting.
 */
export interface CanonicalResumePayload {
  /** The trimmed and normalized resume data. */
  resume: TrimmedResume;
  /** Quality warning messages (e.g. empty sections, excessive length, duplicates). */
  qualityWarnings: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts distinct alphabetic keywords from job description text.
 * Words shorter than 3 characters are excluded.
 *
 * @param jd - Raw job description text.
 * @returns    An array of lowercase keyword strings.
 */
export function extractJDKeywords(jd = ''): string[] {
  return (
    jd
      .toLowerCase()
      .match(/[a-zA-Z0-9.+#-]+/g)
      ?.filter(word => word.length > 2) || []
  );
}

/**
 * Scores an experience or project entry against a set of job description keywords.
 * Also applies standard boosts for generic technical components (Docker, API, AI, etc.).
 *
 * @param entry      - An experience or project entry with text content.
 * @param jdKeywords - Pre-processed JD keyword tokens.
 * @returns            A numerical score indicating job description relevance.
 */
export function scoreProjectForJD(
  entry: { title?: string; tech?: string; bullets?: string[] },
  jdKeywords: string[]
): number {
  const text = `
    ${entry.title ?? ''}
    ${entry.tech ?? ''}
    ${(entry.bullets ?? []).join(' ')}
  `.toLowerCase();

  let score = 0;
  jdKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });

  if (text.includes('authentication')) score += 2;
  if (text.includes('docker')) score += 2;
  if (text.includes('api')) score += 2;
  if (text.includes('mongodb')) score += 1;
  if (text.includes('ai')) score += 3;
  if (text.includes('analytics')) score += 2;

  return score;
}

// ---------------------------------------------------------------------------
// enforceLimits
// ---------------------------------------------------------------------------

/**
 * Enforces hard structural limits on resume lists.
 * If a job description is provided, experience entries are ranked and sorted
 * to preserve the most relevant ones.
 *
 * Design details:
 *   - The first experience entry is ALWAYS kept intact (usually the most recent).
 *   - Slices the remaining entries to fit within the MAX_EXPERIENCES limit.
 *   - All other lists are truncated to their respective limits.
 *
 * @param data           - A `NormalizedResume` object.
 * @param jobDescription - Optional target job description to rank experience.
 * @returns                A new `NormalizedResume` object with limits applied.
 */
export function enforceLimits(
  data: NormalizedResume,
  jobDescription = ''
): NormalizedResume {
  if (!data || typeof data !== 'object') return data;

  // Clone top level to avoid mutating input directly
  const result: NormalizedResume = { ...data };
  const jdKeywords = extractJDKeywords(jobDescription);

  // ── Experience (Rank and slice) ──
  if (Array.isArray(result.experience) && result.experience.length > 0) {
    if (jdKeywords.length > 0) {
      // Score all entries
      const scored = result.experience.map(entry => ({
        ...entry,
        __score: scoreProjectForJD(entry, jdKeywords),
      }));

      // Keep the first entry (current job) intact, sort and slice the rest
      const [first, ...rest] = scored;
      const topRest = rest
        .sort((a, b) => b.__score - a.__score)
        .slice(0, RESUME_LIMITS.MAX_EXPERIENCES - 1);

      const combined = first ? [first, ...topRest] : topRest;

      result.experience = combined.map(({ __score, ...entry }) => entry as ExperienceEntry);
    } else {
      result.experience = result.experience.slice(0, RESUME_LIMITS.MAX_EXPERIENCES);
    }
  }

  // Delegate the rest of limits validation/slicing to resumeValidator
  return validateResumeData(result);
}

// ---------------------------------------------------------------------------
// prepareResumeExport (main export)
// ---------------------------------------------------------------------------

/**
 * Prepares a raw resume input object or string for canonical export.
 *
 * Process flow:
 *  1. Parse input JSON string if necessary.
 *  2. Normalize fields into a standard `NormalizedResume` representation.
 *  3. Score and sort experience entries based on target job description keywords (if provided).
 *  4. Trim bullet verbosity, rank bullet points, and calculate preservation scores.
 *  5. Evaluate overall document quality to gather warnings.
 *  6. Package the trimmed resume and warnings into the export payload.
 *
 * @param data    - Raw AI response string or generic JavaScript object containing resume data.
 * @param options - Configuration options for JD matching, trimming baseline, and role context.
 * @returns         A `CanonicalResumePayload` containing the processed resume and quality warnings.
 *
 * @example
 * const payload = prepareResumeExport(rawTextOrObj, {
 *   jobDescription: jdText,
 *   role: 'backend',
 *   originalResume: baselineNormalizedResume,
 * });
 *
 * console.log(payload.resume.preservationScore); // 88
 * console.log(payload.qualityWarnings);          // []
 */
export function prepareResumeExport(
  data: unknown,
  options: ExportOptions = {}
): CanonicalResumePayload {
  let parsed: unknown = data;

  // Step 1 — Parse if string
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch (err) {
      throw new Error(`[exportPipeline] Failed to parse input string as JSON: ${(err as Error).message}`);
    }
  }

  // Step 2 — Normalize
  const normalized = normalizeResume(parsed);

  // Step 3 — Enforce Limits (ranks experience if JD is provided)
  const limited = enforceLimits(normalized, options.jobDescription ?? '');

  // Step 4 — Trimming and deduplication
  const trimmed = sectionAwareTrimming(
    limited,
    options.originalResume ?? null,
    options.role ?? 'general'
  );

  // Step 5 — Quality audit (non-mutating)
  const audit = evaluateResumeQuality(trimmed);

  // Step 6 — Package canonical payload
  return {
    resume: trimmed,
    qualityWarnings: audit.warnings,
  };
}
