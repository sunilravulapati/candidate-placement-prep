// backend/src/features/resume/trimmer.ts
//
// Section-aware resume trimming with bullet ranking and preservation scoring.
// Ported from resume-ai-backend/utils/sectionAwareTrimming.js.
//
// Processing pipeline (in order):
//   1. Deduplicate content via deduplicator.ts
//   2. Trim all bullets to MAX_BULLET_WORDS words
//   3. Rank bullets by scoreBullet() — keep top 3 per experience/project
//   4. Restore missing projects from original if fewer than 2 survive
//   5. Calculate preservation score (section survival + metric survival + tech survival)
//
// Pure function — no side effects, no I/O, no AI calls.

import { METRIC_REGEX, PRESERVATION_TECH_KEYWORDS, MAX_BULLET_WORDS } from './constants';
import { scoreBullet, RoleType } from './bulletScorer';
import { deduplicateResumeContent } from './deduplicator';
import type { NormalizedResume, ProjectEntry } from './normalizer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The result of the trimming pipeline.
 * Extends `NormalizedResume` with an additional `preservationScore` field.
 *
 * `preservationScore` (0–100) measures how much of the original resume's
 * content survived the trimming and deduplication passes:
 *  - 40%: section survival ratio
 *  - 30%: metric (quantified number) survival ratio
 *  - 30%: technology keyword survival ratio
 */
export interface TrimmedResume extends NormalizedResume {
  /**
   * Preservation score (0–100).
   * 100 means all original content survived. Lower values indicate
   * significant trimming occurred.
   */
  preservationScore: number;
}

// ---------------------------------------------------------------------------
// trimBulletVerbosity (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Trims a bullet to a maximum word count.
 *
 * If the bullet is within the limit, it is returned unchanged.
 * If it exceeds the limit, it is truncated and trailing punctuation/commas
 * are replaced with a period for grammatical completeness.
 *
 * @param bullet   - The raw bullet string.
 * @param maxWords - Maximum word count (default: MAX_BULLET_WORDS from constants).
 * @returns          The trimmed bullet string.
 *
 * @example
 * trimBulletVerbosity('Built a highly scalable auth system using JWT and Redis that handled millions of users', 10)
 * // => 'Built a highly scalable auth system using JWT and Redis.'
 */
export function trimBulletVerbosity(
  bullet: string,
  maxWords = MAX_BULLET_WORDS
): string {
  if (!bullet || typeof bullet !== 'string') return bullet;
  const words = bullet.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return bullet;
  return words.slice(0, maxWords).join(' ').replace(/[;,]+$/, '') + '.';
}

// ---------------------------------------------------------------------------
// calculatePreservationScore (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Calculates a content preservation score (0–100) comparing an original resume
 * to its trimmed counterpart.
 *
 * Weighted components:
 *  - Section survival     (40%): ratio of non-empty sections that survived
 *  - Metric survival      (30%): ratio of quantified numbers that survived
 *  - Tech keyword survival(30%): ratio of technology keywords that survived
 *
 * Returns 100 when either argument is falsy (no trimming occurred).
 *
 * @param original - The pre-trim `NormalizedResume`.
 * @param tailored - The post-trim result to compare against.
 * @returns          A preservation score in [0, 100].
 */
export function calculatePreservationScore(
  original: NormalizedResume,
  tailored: NormalizedResume
): number {
  if (!original || !tailored) return 100;

  // ── 40%: Section survival ──
  const sectionsToCheck: Array<keyof NormalizedResume> = [
    'summary', 'skills', 'experience', 'projects', 'education',
    'awards', 'certifications', 'dsaProfiles', 'extracurricular', 'languages',
  ];

  let origSectionCount = 0;
  let tailoredSectionCount = 0;

  for (const section of sectionsToCheck) {
    const origVal = original[section];
    const tailVal = tailored[section];

    const origExists = Array.isArray(origVal)
      ? origVal.length > 0
      : typeof origVal === 'string'
        ? origVal.trim().length > 0
        : Boolean(origVal);

    const tailExists = Array.isArray(tailVal)
      ? tailVal.length > 0
      : typeof tailVal === 'string'
        ? tailVal.trim().length > 0
        : Boolean(tailVal);

    if (origExists) {
      origSectionCount++;
      if (tailExists) tailoredSectionCount++;
    }
  }

  const sectionScore =
    origSectionCount > 0 ? (tailoredSectionCount / origSectionCount) * 100 : 100;

  // ── 30%: Metric survival ──
  function countMetrics(obj: NormalizedResume): number {
    const str = JSON.stringify(obj).toLowerCase();
    return (str.match(new RegExp(METRIC_REGEX.source, 'gi')) ?? []).length;
  }

  const origMetrics = countMetrics(original);
  const tailMetrics = countMetrics(tailored);
  const metricsScore =
    origMetrics > 0 ? Math.min((tailMetrics / origMetrics) * 100, 100) : 100;

  // ── 30%: Technology keyword survival ──
  function countTechKeywords(obj: NormalizedResume): number {
    const str = JSON.stringify(obj).toLowerCase();
    return PRESERVATION_TECH_KEYWORDS.filter(kw => str.includes(kw)).length;
  }

  const origTech = countTechKeywords(original);
  const tailTech = countTechKeywords(tailored);
  const techScore =
    origTech > 0 ? Math.min((tailTech / origTech) * 100, 100) : 100;

  return Math.round(sectionScore * 0.4 + metricsScore * 0.3 + techScore * 0.3);
}

// ---------------------------------------------------------------------------
// sectionAwareTrimming (main export)
// ---------------------------------------------------------------------------

/**
 * Applies the full section-aware trimming pipeline to a `NormalizedResume`.
 *
 * Pipeline steps (in order):
 *  1. Deduplicate content (via `deduplicateResumeContent`)
 *  2. Trim all experience and project bullets to ≤ MAX_BULLET_WORDS words
 *  3. If an experience/project entry has > 3 bullets, rank by `scoreBullet`
 *     and keep only the top 3
 *  4. If fewer than 2 projects survive, restore missing ones from `originalResume`
 *     (prevents the resume from losing all projects after aggressive trimming)
 *  5. Attach a `preservationScore` (0–100) to the result
 *
 * @param resume         - The `NormalizedResume` to trim.
 * @param originalResume - The pre-tailoring baseline (used for project restore + scoring).
 *                         Pass null/undefined when trimming a freshly uploaded resume.
 * @param role           - Target role for bullet scoring (default: 'general').
 * @returns                A `TrimmedResume` with all trimming applied.
 *
 * @example
 * const trimmed = sectionAwareTrimming(normalizedResume, originalResume, 'backend');
 * console.log(trimmed.preservationScore); // e.g. 87
 */
export function sectionAwareTrimming(
  resume: NormalizedResume,
  originalResume: NormalizedResume | null = null,
  role: RoleType = 'general'
): TrimmedResume {
  if (!resume || typeof resume !== 'object') {
    return { ...(resume as any), preservationScore: 100 };
  }

  // Step 1 — Deduplicate
  let processed: NormalizedResume = deduplicateResumeContent(resume);

  // Step 2 — Trim all bullets to MAX_BULLET_WORDS words
  if (Array.isArray(processed.experience)) {
    processed = {
      ...processed,
      experience: processed.experience.map(exp => ({
        ...exp,
        bullets: Array.isArray(exp.bullets)
          ? exp.bullets.map(b => trimBulletVerbosity(b))
          : exp.bullets,
      })),
    };
  }

  if (Array.isArray(processed.projects)) {
    processed = {
      ...processed,
      projects: processed.projects.map(proj => ({
        ...proj,
        bullets: Array.isArray(proj.bullets)
          ? proj.bullets.map(b => trimBulletVerbosity(b))
          : proj.bullets,
      })),
    };
  }

  // Step 3 — Rank bullets, keep top 3 per section entry
  if (Array.isArray(processed.experience)) {
    processed = {
      ...processed,
      experience: processed.experience.map(exp => {
        if (!exp || !Array.isArray(exp.bullets) || exp.bullets.length <= 3) return exp;

        const topBullets = exp.bullets
          .map(b => ({ text: b, score: scoreBullet(b, role) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(item => item.text);

        return {
          ...exp,
          bullets: exp.bullets.filter(b => topBullets.includes(b)),
        };
      }),
    };
  }

  if (Array.isArray(processed.projects)) {
    processed = {
      ...processed,
      projects: processed.projects.map(proj => {
        if (!proj || !Array.isArray(proj.bullets) || proj.bullets.length <= 3) return proj;

        const topBullets = proj.bullets
          .map(b => ({ text: b, score: scoreBullet(b, role) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(item => item.text);

        return {
          ...proj,
          bullets: proj.bullets.filter(b => topBullets.includes(b)),
        };
      }),
    };
  }

  // Step 4 — Restore missing projects from original (minimum 2 projects enforced)
  if (
    Array.isArray(processed.projects) &&
    processed.projects.length < 2 &&
    originalResume &&
    Array.isArray(originalResume.projects)
  ) {
    const missingCount = 2 - processed.projects.length;
    const existingTitles = new Set(processed.projects.map(p => p.title));
    const addedProjects: ProjectEntry[] = originalResume.projects
      .filter(p => !existingTitles.has(p.title))
      .slice(0, missingCount);

    processed = {
      ...processed,
      projects: [...processed.projects, ...addedProjects],
    };
  }

  // Step 5 — Preservation score
  const preservationScore = originalResume
    ? calculatePreservationScore(originalResume, processed)
    : 100;

  return { ...(processed as any), preservationScore };
}
