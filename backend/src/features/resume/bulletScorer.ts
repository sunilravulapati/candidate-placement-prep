// backend/src/features/resume/bulletScorer.ts
//
// Bullet point quality scoring and merge-decision utilities.
// Ported from:
//   - resume-ai-backend/utils/rankBullets.js       → scoreBullet()
//   - resume-ai-backend/utils/compareResumeQuality.js → shouldKeepRewrittenBullet()
//
// Pure functions — no side effects.
//
// ⚠️  All constants have moved to constants.ts.
//     Previously imported FILLER_PHRASES from textCleaner.ts — now imported
//     directly from constants.ts to avoid the intermediate dependency.

import {
  FILLER_PHRASES,
  TECH_COMPLEXITY_KEYWORDS,
  STRONG_ACTION_VERBS,
  FRONTEND_KEYWORDS,
  BACKEND_KEYWORDS,
  AI_KEYWORDS,
  METRIC_REGEX,
} from './constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The four role categories used for role-aware bullet scoring.
 * - 'general'  : No role-specific boosting applied.
 * - 'frontend' : Boosts UI/browser-related keywords.
 * - 'backend'  : Boosts server/API/database keywords.
 * - 'ai'       : Boosts ML/data/inference keywords.
 */
export type RoleType = 'general' | 'frontend' | 'backend' | 'ai';

// ---------------------------------------------------------------------------
// scoreBullet
// ---------------------------------------------------------------------------

/**
 * Scores a single resume bullet point on its recruitment value.
 *
 * Higher scores indicate better quality bullets from a recruiter's perspective.
 * The score can be negative (due to penalties) and is unbounded above — use
 * it for relative ranking, not absolute assessment.
 *
 * Scoring factors:
 *  - Length heuristic:          < 25 chars: -8 | 25–160 chars: +4
 *  - Percentage metric:         +10
 *  - Dollar / large number:     +8
 *  - Outcome numeric word:      +8
 *  - Compact numeric suffix:    +4  (e.g. "50+")
 *  - Tech complexity keyword:   +3 each (see TECH_COMPLEXITY_KEYWORDS)
 *  - Strong action verb start:  +5
 *  - Filler phrase (weak):      -8 each (from FILLER_PHRASES in constants)
 *  - Role-aware keyword boost:  +5 each (frontend / backend / ai only)
 *
 * @param bullet - The raw bullet text to score.
 * @param role   - The target role context for applying role-aware boosts.
 * @returns        A numeric score (can be negative; used for relative ranking).
 */
export function scoreBullet(bullet: string, role: RoleType = 'general'): number {
  if (!bullet || typeof bullet !== 'string') return 0;

  let score = 0;
  const lower = bullet.toLowerCase();

  // ── Length heuristic ──
  if (lower.length < 25) {
    score -= 8;
  } else if (lower.length > 25 && lower.length < 160) {
    score += 4;
  }

  // ── Quantified metrics ──
  if (/\b\d+(?:\.\d+)?%/.test(lower)) score += 10;

  if (/\$\d+/.test(lower) || /\b\d+\s*(?:million|thousand|billion|k|m)\b/i.test(lower)) {
    score += 8;
  }

  if (
    /\b\d+\s*(?:users?|requests?|clients?|customers?|ms|seconds?|latency|reduction|increase|growth|improvement|transactions?|downloads?|deployments?|repos?)\b/i.test(
      lower
    )
  ) {
    score += 8;
  }

  if (/\b\d+\s*\+\b/.test(lower)) score += 4;

  // ── Technical complexity keywords ──
  for (const keyword of TECH_COMPLEXITY_KEYWORDS) {
    if (lower.includes(keyword)) score += 3;
  }

  // ── Strong action verb at start of bullet ──
  const firstWord = lower.trim().split(/\s+/)[0] ?? '';
  if (STRONG_ACTION_VERBS.has(firstWord)) score += 5;

  // ── Filler phrase penalties ──
  // Reset lastIndex since patterns use the /g flag
  for (const pattern of FILLER_PHRASES) {
    pattern.lastIndex = 0;
    if (pattern.test(lower)) score -= 8;
    pattern.lastIndex = 0; // reset again after test()
  }

  // ── Role-aware keyword boost ──
  const roleKeywords: ReadonlyArray<string> =
    role === 'frontend'
      ? FRONTEND_KEYWORDS
      : role === 'backend'
        ? BACKEND_KEYWORDS
        : role === 'ai'
          ? AI_KEYWORDS
          : [];

  for (const keyword of roleKeywords) {
    if (lower.includes(keyword)) score += 5;
  }

  return score;
}

// ---------------------------------------------------------------------------
// shouldKeepRewrittenBullet
// ---------------------------------------------------------------------------

/**
 * Determines whether an AI-rewritten bullet is better than the original and
 * should therefore replace it in the tailored resume.
 *
 * This is a conservative gate: when in doubt, the original is kept.
 * The function prevents common AI failure modes:
 *  - Dropping quantified metrics that existed in the original (→ keep original)
 *  - Producing a significantly lower-quality bullet (→ keep original)
 *  - Returning an empty or null string (→ keep original)
 *
 * The function favours the rewrite when:
 *  - The rewrite matches more JD keywords than the original.
 *  - The rewrite scores meaningfully higher (> +2 points) AND
 *    doesn't drop any metrics the original had.
 *
 * @param original   - The original bullet text before AI tailoring.
 * @param rewritten  - The AI-generated replacement bullet.
 * @param role       - The target role context for score calculation.
 * @param jdKeywords - Lowercase keyword tokens extracted from the job description.
 * @returns            `true` to use the rewritten bullet; `false` to keep the original.
 */
export function shouldKeepRewrittenBullet(
  original: string,
  rewritten: string,
  role: RoleType = 'general',
  jdKeywords: string[] = []
): boolean {
  const cleanOrig = (original ?? '').trim();
  const cleanRew = (rewritten ?? '').trim();

  // Guard: AI returned empty — always keep original
  if (!cleanRew) return false;
  // Guard: no original to compare against — keep rewrite
  if (!cleanOrig) return true;

  // ── Metric preservation check (most important gate) ──
  // If the original had a concrete metric but the rewrite dropped it,
  // that is a quality regression — never replace.
  const origHasMetric = METRIC_REGEX.test(cleanOrig);
  const rewHasMetric = METRIC_REGEX.test(cleanRew);

  if (origHasMetric && !rewHasMetric) return false;

  // ── Quality score comparison ──
  const origScore = scoreBullet(cleanOrig, role);
  const rewScore = scoreBullet(cleanRew, role);

  // Hard downgrade: rewrite is more than 2 points worse — keep original
  if (rewScore < origScore - 2) return false;

  // ── JD keyword alignment ──
  const lowerOrig = cleanOrig.toLowerCase();
  const lowerRew = cleanRew.toLowerCase();

  let origJdMatches = 0;
  let rewJdMatches = 0;

  for (const kw of jdKeywords) {
    const cleanKw = kw.toLowerCase().trim();
    if (!cleanKw) continue;
    if (lowerOrig.includes(cleanKw)) origJdMatches++;
    if (lowerRew.includes(cleanKw)) rewJdMatches++;
  }

  // Rewrite matches more JD keywords → keep rewrite
  if (rewJdMatches > origJdMatches) return true;

  // Rewrite scores meaningfully higher → keep rewrite
  if (rewScore > origScore + 2) return true;

  // Default: keep original (conservative)
  return false;
}
