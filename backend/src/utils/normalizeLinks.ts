// backend/src/utils/normalizeLinks.ts
//
// Utility functions for normalizing social/professional profile URLs.
// Ported from resume-ai-backend/utils/normalizeLinks.js.
//
// These are pure string transformers — no network calls, no imports.
// Placed in /utils (not /features/resume) because link normalization
// is broadly applicable across features (user profiles, cover letters, etc.).

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The supported link types for normalization. */
export type LinkType = 'linkedin' | 'github' | 'email' | 'portfolio';

/** A map of all normalizable link fields on a basics object. */
export interface BasicLinks {
  email?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

// ---------------------------------------------------------------------------
// normalizeLink
// ---------------------------------------------------------------------------

/**
 * Normalizes a single URL or handle based on its type.
 *
 * Handles these common problems from LLM-extracted or user-supplied links:
 *  - Duplicate protocols: `https://https://linkedin.com/in/foo` → correct
 *  - Bare usernames:      `johndoe`          → `https://linkedin.com/in/johndoe`
 *  - Missing protocol:    `linkedin.com/in/x` → `https://linkedin.com/in/x`
 *  - Email casing:        `John@Example.COM`  → `john@example.com`
 *
 * @param url  - The raw URL string or username handle.
 * @param type - The link type that determines normalization rules.
 * @returns      A normalized URL string, or an empty string if input is falsy.
 *
 * @example
 * normalizeLink('johndoe', 'linkedin')
 * // => 'https://linkedin.com/in/johndoe'
 *
 * normalizeLink('@janedoe', 'github')
 * // => 'https://github.com/janedoe'
 *
 * normalizeLink('https://https://mysite.com', 'portfolio')
 * // => 'https://mysite.com'
 */
export function normalizeLink(url: string | undefined | null, type: LinkType): string {
  if (!url || typeof url !== 'string') return '';

  // Strip duplicate protocols (e.g. "https://https://")
  let clean = url.trim().replace(/^(https?:\/\/)+/i, 'https://');

  switch (type) {
    case 'linkedin': {
      if (!clean.includes('linkedin.com')) {
        // Bare username or @handle — construct the full URL
        const handle = clean.replace(/^@/, '').replace(/^\/+|\/+$/g, '');
        clean = `https://linkedin.com/in/${handle}`;
      } else if (!clean.startsWith('http')) {
        clean = `https://${clean}`;
      }
      break;
    }

    case 'github': {
      if (!clean.includes('github.com')) {
        // Bare username or @handle — construct the full URL
        const handle = clean.replace(/^@/, '').replace(/^\/+|\/+$/g, '');
        clean = `https://github.com/${handle}`;
      } else if (!clean.startsWith('http')) {
        clean = `https://${clean}`;
      }
      break;
    }

    case 'email': {
      // Emails are case-insensitive; lowercase for consistency
      clean = clean.toLowerCase();
      break;
    }

    case 'portfolio':
    default: {
      // Any other URL: just ensure a protocol is present
      if (clean && !clean.startsWith('http')) {
        clean = `https://${clean}`;
      }
      break;
    }
  }

  return clean;
}

// ---------------------------------------------------------------------------
// normalizeBasicsLinks
// ---------------------------------------------------------------------------

/**
 * Convenience function that normalizes all link fields on a "basics" object
 * in one pass.
 *
 * Returns a new object — the input is not mutated.
 *
 * @param basics - An object containing optional link fields.
 * @returns       A new object with all present link fields normalized.
 *
 * @example
 * normalizeBasicsLinks({ email: 'USER@EXAMPLE.COM', linkedin: 'johndoe' })
 * // => { email: 'user@example.com', linkedin: 'https://linkedin.com/in/johndoe' }
 */
export function normalizeBasicsLinks(basics: BasicLinks): BasicLinks {
  const normalized: BasicLinks = { ...basics };

  if (normalized.email) {
    normalized.email = normalizeLink(normalized.email, 'email');
  }
  if (normalized.linkedin) {
    normalized.linkedin = normalizeLink(normalized.linkedin, 'linkedin');
  }
  if (normalized.github) {
    normalized.github = normalizeLink(normalized.github, 'github');
  }
  if (normalized.portfolio) {
    normalized.portfolio = normalizeLink(normalized.portfolio, 'portfolio');
  }

  return normalized;
}
