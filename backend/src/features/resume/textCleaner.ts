// backend/src/features/resume/textCleaner.ts
//
// Lightweight post-processing to improve resume bullet readability.
// Ported from resume-ai-backend/utils/textCleaner.js.
//
// Pure functions — no side effects.
// Used by the merge engine and trim pipeline to strip bureaucratic filler
// language that LLMs sometimes inject or fail to remove.
//
// ⚠️  FILLER_PHRASES has moved to constants.ts.
//     Re-exported here for backwards compatibility — existing importers of
//     { FILLER_PHRASES } from './textCleaner' continue to work unchanged.

// ---------------------------------------------------------------------------
// Re-exports from constants (canonical source)
// ---------------------------------------------------------------------------

export { FILLER_PHRASES } from './constants';

import { FILLER_PHRASES } from './constants';

// ---------------------------------------------------------------------------
// cleanBulletVerbosity
// ---------------------------------------------------------------------------

/**
 * Strips filler phrases from a resume bullet point and applies light
 * formatting corrections.
 *
 * Steps applied in order:
 *  1. Remove all filler phrase matches (case-insensitive).
 *  2. Collapse any resulting double spaces into single spaces.
 *  3. Capitalise the first character of the cleaned string.
 *  4. Append a trailing period if the string doesn't already end with
 *     punctuation (`.`, `!`, or `?`).
 *
 * @param bullet - A raw bullet string, possibly containing filler language.
 * @returns       The cleaned bullet string, or the original value if falsy.
 *
 * @example
 * cleanBulletVerbosity('responsible for building the auth system using JWT')
 * // => 'Building the auth system using JWT.'
 *
 * cleanBulletVerbosity('Reduced API latency by 40% by introducing a Redis cache.')
 * // => 'Reduced API latency by 40% by introducing a Redis cache.'
 */
export function cleanBulletVerbosity(bullet: string | undefined | null): string {
  if (!bullet) return bullet as string;

  let cleaned = String(bullet);

  // Step 1 — remove filler phrases
  // Reset lastIndex before each test/replace since patterns use the /g flag
  for (const pattern of FILLER_PHRASES) {
    pattern.lastIndex = 0;
    cleaned = cleaned.replace(pattern, '').trim();
    pattern.lastIndex = 0;
  }

  // Step 2 — collapse multiple spaces introduced by removals
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  // Step 3 — capitalise first character
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Step 4 — ensure trailing punctuation
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}
