// backend/src/features/resume/resumeValidator.ts
//
// Resume structural validation, quality checking, and limit enforcement.
// Ported and improved from resume-ai-backend/utils/validateResumeData.js.
//
// Key improvement over the original JS source:
//   - `evaluateResumeQuality` is now NON-MUTATING.
//     The original attached `data.qualityWarnings` directly to the resume object.
//     This port returns a separate `ResumeQualityReport` instead, keeping
//     `NormalizedResume` data pure and free of metadata side-channels.
//
// Pure functions — no side effects, no I/O, no AI calls.

import { RESUME_LIMITS } from './constants';
import type { NormalizedResume } from './normalizer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Re-export the limits type so consumers can reference it without importing constants. */
export type { ResumeLimits } from './constants';

/**
 * Quality assessment report produced by `evaluateResumeQuality`.
 *
 * This is returned separately from the resume data — it does NOT mutate
 * the `NormalizedResume` object (unlike the original JS implementation).
 */
export interface ResumeQualityReport {
  /**
   * Array of human-readable quality warning strings.
   * Empty array indicates no quality issues detected.
   *
   * Warning types:
   *  - Empty bullet list in section
   *  - Excessively long bullet (> 35 words)
   *  - Duplicate bullet within the same section
   */
  warnings: string[];
  /**
   * True if any warnings were generated.
   * Convenience field so consumers don't need to check `warnings.length`.
   */
  hasIssues: boolean;
}

// ---------------------------------------------------------------------------
// validateResumeData
// ---------------------------------------------------------------------------

/**
 * Enforces hard structural limits on a `NormalizedResume` object.
 *
 * This function IS MUTATING — it modifies arrays in place via `.slice()`.
 * The mutation is intentional: the source JS contract is preserved exactly
 * so downstream pipeline stages receive the same already-limited object.
 *
 * Limits applied (from RESUME_LIMITS in constants.ts):
 *  - summary:          truncated to MAX_SUMMARY_CHARS characters
 *  - experience:       truncated to MAX_EXPERIENCES entries
 *  - experience[].bullets: truncated to MAX_BULLETS_PER_EXP each
 *  - projects:         truncated to MAX_PROJECTS entries
 *  - projects[].bullets:   truncated to MAX_BULLETS_PER_PROJECT each
 *  - skills:           truncated to MAX_SKILL_ROWS entries
 *  - education:        truncated to MAX_EDUCATION entries
 *  - awards:           truncated to MAX_AWARDS entries
 *  - certifications:   truncated to MAX_CERTIFICATIONS entries
 *  - dsaProfiles:      truncated to MAX_DSA_LINES entries
 *  - dsaProficiency:   truncated to MAX_DSA_LINES entries
 *  - extracurricular:  truncated to MAX_EXTRACURRICULAR entries
 *  - extracurricular[].bullets: truncated to MAX_EXTRA_BULLETS each
 *
 * @param data - A `NormalizedResume` object (modified in place).
 * @returns      The same object, with all limits applied.
 */
export function validateResumeData(data: NormalizedResume): NormalizedResume {
  if (!data || typeof data !== 'object') return data;

  // ── Summary ──
  if (typeof data.summary === 'string' && data.summary.length > RESUME_LIMITS.MAX_SUMMARY_CHARS) {
    data.summary = data.summary.slice(0, RESUME_LIMITS.MAX_SUMMARY_CHARS);
  }

  // ── Experience ──
  if (Array.isArray(data.experience)) {
    data.experience = data.experience.slice(0, RESUME_LIMITS.MAX_EXPERIENCES);
    data.experience.forEach(exp => {
      if (Array.isArray(exp.bullets)) {
        exp.bullets = exp.bullets.slice(0, RESUME_LIMITS.MAX_BULLETS_PER_EXP);
      }
    });
  }

  // ── Projects ──
  if (Array.isArray(data.projects)) {
    data.projects = data.projects.slice(0, RESUME_LIMITS.MAX_PROJECTS);
    data.projects.forEach(proj => {
      if (Array.isArray(proj.bullets)) {
        proj.bullets = proj.bullets.slice(0, RESUME_LIMITS.MAX_BULLETS_PER_PROJECT);
      }
    });
  }

  // ── Skills ──
  if (Array.isArray(data.skills)) {
    data.skills = data.skills.slice(0, RESUME_LIMITS.MAX_SKILL_ROWS);
  }

  // ── Education ──
  if (Array.isArray(data.education)) {
    data.education = data.education.slice(0, RESUME_LIMITS.MAX_EDUCATION);
  }

  // ── Awards ──
  if (Array.isArray(data.awards)) {
    data.awards = data.awards.slice(0, RESUME_LIMITS.MAX_AWARDS);
  }

  // ── Certifications ──
  if (Array.isArray(data.certifications)) {
    data.certifications = data.certifications.slice(0, RESUME_LIMITS.MAX_CERTIFICATIONS);
  }

  // ── DSA Profiles ──
  if (Array.isArray(data.dsaProfiles)) {
    data.dsaProfiles = data.dsaProfiles.slice(0, RESUME_LIMITS.MAX_DSA_LINES);
  }
  if (Array.isArray(data.dsaProficiency)) {
    data.dsaProficiency = data.dsaProficiency.slice(0, RESUME_LIMITS.MAX_DSA_LINES);
  }

  // ── Extracurricular ──
  if (Array.isArray(data.extracurricular)) {
    data.extracurricular = data.extracurricular.slice(0, RESUME_LIMITS.MAX_EXTRACURRICULAR);
    data.extracurricular.forEach(item => {
      if (Array.isArray(item.bullets)) {
        item.bullets = item.bullets.slice(0, RESUME_LIMITS.MAX_EXTRA_BULLETS);
      }
    });
  }

  return data;
}

// ---------------------------------------------------------------------------
// evaluateResumeQuality
// ---------------------------------------------------------------------------

/**
 * Performs a non-destructive quality audit on a `NormalizedResume`.
 *
 * Unlike `validateResumeData`, this function does NOT modify the input.
 * It produces a separate `ResumeQualityReport` with human-readable warnings.
 *
 * Quality checks performed:
 *  - Empty bullet lists in experience, projects, and extracurricular entries.
 *  - Bullets exceeding 35 words (too verbose for a resume).
 *  - Duplicate bullet text within the same section.
 *
 * @param data - The `NormalizedResume` to audit (read-only).
 * @returns      A `ResumeQualityReport` with warnings and a boolean flag.
 *
 * @example
 * const report = evaluateResumeQuality(normalizedResume);
 * if (report.hasIssues) {
 *   console.warn('Resume quality issues:', report.warnings);
 * }
 */
export function evaluateResumeQuality(data: NormalizedResume): ResumeQualityReport {
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { warnings, hasIssues: false };
  }

  /**
   * Checks bullet quality for a single section's array of items.
   * @internal
   */
  function checkBullets(
    sectionName: string,
    items: Array<{ title?: string; company?: string; bullets?: string[] }> | undefined
  ): void {
    if (!Array.isArray(items)) return;

    const seenBullets = new Set<string>();

    for (const item of items) {
      if (!item) continue;

      const itemLabel = item.title ?? item.company ?? 'Unknown';

      // ── Empty bullet list ──
      if (Array.isArray(item.bullets) && item.bullets.length === 0) {
        warnings.push(`Empty bullet list in ${sectionName}: ${itemLabel}`);
      }

      // ── Per-bullet checks ──
      if (!Array.isArray(item.bullets)) continue;

      for (const b of item.bullets) {
        const text = String(b);
        const wordCount = text.split(/\s+/).length;

        // ── Excessively long bullet ──
        if (wordCount > 35) {
          warnings.push(
            `Excessively long bullet (>35 words) in ${sectionName}: "${text.substring(0, 30)}..."`
          );
        }

        // ── Duplicate bullet ──
        const lower = text.toLowerCase().trim();
        if (seenBullets.has(lower)) {
          warnings.push(
            `Duplicate bullet in ${sectionName}: "${text.substring(0, 30)}..."`
          );
        }
        seenBullets.add(lower);
      }
    }
  }

  checkBullets('experience', data.experience);
  checkBullets('projects', data.projects);
  checkBullets('extracurricular', data.extracurricular);

  return {
    warnings,
    hasIssues: warnings.length > 0,
  };
}
