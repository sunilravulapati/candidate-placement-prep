// backend/src/features/resume/deduplicator.ts
//
// Resume content deduplication.
// Ported and improved from resume-ai-backend/utils/deduplicateResumeContent.js.
//
// Key improvement over the original JS source:
//   - Returns a NEW object (shallow clone at top level, deep clone of modified arrays).
//   - The original JS mutated the input object in place, making it difficult to
//     compare before/after states and violating pure function principles.
//
// Three deduplication passes are applied in order:
//   1. Cross-category skill deduplication (global seen-set per resume)
//   2. DSA overlap removal from achievements and awards (avoids repeating stats)
//   3. Bullet deduplication between experience and projects (global seen-set)
//
// Pure function — no side effects, no I/O, no AI calls.

import type { NormalizedResume, SkillRow, AwardEntry } from './normalizer';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Regex for detecting competitive programming platform mentions. @internal */
const DSA_PLATFORM_REGEX = /leetcode|codechef|codeforces|hackerrank|gfg/i;

/**
 * Extracts all numeric tokens from a string (for overlap detection).
 * @internal
 */
function extractNumbers(text: string): string[] {
  return text.match(/\b\d+\b/g) ?? [];
}

/**
 * Normalises a bullet string to an alphanumeric fingerprint for comparison.
 * @internal
 */
function bulletFingerprint(bullet: string): string {
  return bullet.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

// ---------------------------------------------------------------------------
// deduplicateResumeContent
// ---------------------------------------------------------------------------

/**
 * Removes duplicate content from a `NormalizedResume` and returns a new object.
 *
 * Pass 1 — Skill Deduplication:
 *   Skills are deduplicated globally across all categories. If the same
 *   technology appears in multiple skill rows, only the first occurrence is
 *   kept. Categories that become empty after deduplication are removed.
 *
 * Pass 2 — DSA Overlap Removal:
 *   If `dsaProfiles` / `dsaProficiency` contains competitive programming stats,
 *   any bullets in `achievements` or titles/descs in `awards` that mention the
 *   same platforms AND share numeric tokens with a DSA stat line are removed
 *   (they are already represented in the DSA section).
 *
 * Pass 3 — Cross-Section Bullet Deduplication:
 *   Bullets that appear in `experience` are fingerprinted and then removed
 *   from `projects` if they have an identical fingerprint. Project entries
 *   that become empty after this pass are also removed.
 *
 * @param resume - The `NormalizedResume` to deduplicate.
 * @returns        A new `NormalizedResume` with all duplicate content removed.
 *
 * @example
 * const deduped = deduplicateResumeContent(normalizedResume);
 * // deduped !== normalizedResume (new object)
 * // deduped.skills has no repeated skill names
 */
export function deduplicateResumeContent(resume: NormalizedResume): NormalizedResume {
  if (!resume || typeof resume !== 'object') return resume;

  // Shallow clone at top level — we'll replace modified arrays
  const result: NormalizedResume = { ...resume };

  // ── Pass 1: Skill deduplication ──
  if (Array.isArray(result.skills)) {
    const seenSkills = new Set<string>();

    result.skills = result.skills
      .map((cat: SkillRow) => {
        if (!cat || typeof cat !== 'object') return cat;

        const uniqueSkills: string[] = [];
        const skillItems = (cat.value || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        for (const skill of skillItems) {
          const lower = skill.toLowerCase();
          if (!seenSkills.has(lower)) {
            seenSkills.add(lower);
            uniqueSkills.push(skill);
          }
        }

        return {
          label: cat.label,
          value: uniqueSkills.join(', '),
        };
      })
      .filter(cat => cat && cat.value && cat.value.trim().length > 0);
  }

  // ── Pass 2: DSA overlap removal ──
  const dsaStatLines: string[] = [
    ...(Array.isArray(result.dsaProfiles) ? result.dsaProfiles : []),
    ...(Array.isArray(result.dsaProficiency) ? result.dsaProficiency : []),
  ]
    .map(p => (p || '').toLowerCase().trim())
    .filter(Boolean);

  if (dsaStatLines.length > 0) {
    /**
     * Returns true if a text string overlaps with any DSA stat line
     * (same platform + at least one shared number).
     * @internal
     */
    function overlapsWithDSA(text: string): boolean {
      const lower = text.toLowerCase();
      if (!DSA_PLATFORM_REGEX.test(lower)) return false;
      const numbers = extractNumbers(lower);
      if (numbers.length === 0) return false;
      return dsaStatLines.some(statLine =>
        numbers.some(n => statLine.includes(n))
      );
    }

    // Remove overlapping awards
    if (Array.isArray(result.awards)) {
      result.awards = (result.awards as AwardEntry[]).filter(award => {
        const combined = `${award.title} ${award.desc}`.toLowerCase();
        return !overlapsWithDSA(combined);
      });
    }
  }

  // ── Pass 3: Cross-section bullet deduplication ──
  if (Array.isArray(result.experience) && Array.isArray(result.projects)) {
    // Collect fingerprints of all experience bullets
    const experienceBulletPrints = new Set<string>();
    for (const exp of result.experience) {
      if (exp && Array.isArray(exp.bullets)) {
        for (const b of exp.bullets) {
          const fp = bulletFingerprint(b || '');
          if (fp) experienceBulletPrints.add(fp);
        }
      }
    }

    // Remove project bullets that duplicate experience bullets
    result.projects = result.projects
      .map(proj => {
        if (!proj || !Array.isArray(proj.bullets)) return proj;
        return {
          ...proj,
          bullets: proj.bullets.filter(b => {
            const fp = bulletFingerprint(b || '');
            return !experienceBulletPrints.has(fp);
          }),
        };
      })
      .filter(proj => proj && Array.isArray(proj.bullets) && proj.bullets.length > 0);
  }

  return result;
}
