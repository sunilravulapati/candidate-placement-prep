// backend/src/features/resume/uploadValidator.ts
//
// Resume upload validation pipeline.
// Ported and improved from resume-ai-backend/utils/resumeValidator.js.
//
// Determines whether uploaded document text is actually a resume by:
//   1. Programmatic scoring — checks for presence of standard resume sections
//      and contact signals.
//   2. AI fallback — when confidence is uncertain (score 4–5), an injected
//      VerifyFn is called to ask the AI model for a classification decision.
//
// DESIGN DECISIONS:
//   - The AI verification function is injected as a parameter (VerifyFn type)
//     rather than imported at the module level. This keeps the module itself
//     pure and fully testable without a live AI provider.
//   - All section indicators are imported from constants.ts.
//   - The confidence bands match the original JS source exactly.
//
// Pure functions where possible — no database access, no storage calls.

import { SECTION_INDICATORS } from './constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Confidence band for the validation result. */
export type ConfidenceBand = 'high' | 'medium' | 'low';

/**
 * The result returned by `validateUpload`.
 *
 * Consumers should check `isResume` first. If false, reject the upload.
 * `confidence` provides additional signal for borderline cases.
 */
export interface ValidationResult {
  /** Whether the document is classified as a resume. */
  isResume: boolean;
  /** Raw programmatic score (max ~11). Exposed for debugging. */
  score: number;
  /** Qualitative confidence band derived from score and optional AI verification. */
  confidence: ConfidenceBand;
  /** Section and contact signal names that were detected. */
  matchedSections: string[];
  /** Section and contact signal names that were NOT detected. */
  missingSections: string[];
  /** Human-readable reason for the classification decision. */
  reason: string;
}

/**
 * The shape of the AI verification response.
 * Must be returned by the function passed as `verifyFn`.
 */
export interface AIVerificationResult {
  /** AI's determination of whether the document is a resume. */
  isResume: boolean;
  /** AI's confidence score (0–100). */
  confidence: number;
  /** Short explanation from the AI. */
  reason?: string;
}

/**
 * An async function that sends text to an AI model and returns a classification.
 *
 * @param text - The document text to classify (callers may truncate to first 3000 chars).
 * @returns      An AI verification result object.
 *
 * Inject this from the calling Server Action using the RESUME_PROMPTS.VERIFY_RESUME
 * prompt and the getAICompletion() provider. This indirection keeps uploadValidator.ts
 * dependency-free from the AI provider at the module level.
 */
export type VerifyFn = (text: string) => Promise<AIVerificationResult>;

// ---------------------------------------------------------------------------
// Internal: contact signal patterns
// ---------------------------------------------------------------------------

/** Contact signal patterns for email, phone, and profile links. */
const CONTACT_SIGNALS = {
  Email: [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i],
  Phone: [/(?:\+?\d{1,3}[.\-\s]?)?\(?\d{3}\)?[.\-\s]?\d{3}[.\-\s]?\d{4}/],
  Links: [/linkedin\.com\/in\//i, /github\.com\//i, /portfolio/i, /website/i],
} as const;

// ---------------------------------------------------------------------------
// scoreDocument (internal)
// ---------------------------------------------------------------------------

/**
 * Scores a document's text for resume-like section content and contact signals.
 *
 * Scoring table:
 *  - Education:   +2 (any keyword match)
 *  - Experience:  +2 (any keyword match)
 *  - Skills:      +2 (any keyword match)
 *  - Projects:    +2 (any keyword match)
 *  - Summary:     +1 (any keyword match)
 *  - Email:       +1
 *  - Phone:       +1
 *  - Links:       +1
 *
 * Maximum possible score: 12
 * Immediate pass threshold: ≥ 6
 * Immediate fail threshold: < 4
 * AI fallback range: 4–5
 *
 * @internal
 */
function scoreDocument(text: string): {
  score: number;
  matchedSections: string[];
  missingSections: string[];
} {
  const t = text.toLowerCase();
  let score = 0;
  const matchedSections: string[] = [];
  const missingSections: string[] = [];

  // ── Section indicators ──
  for (const [section, keywords] of Object.entries(SECTION_INDICATORS)) {
    const weight = section === 'Summary' ? 1 : 2;
    const matched = (keywords as readonly string[]).some(k => t.includes(k));
    if (matched) {
      score += weight;
      matchedSections.push(section);
    } else {
      missingSections.push(section);
    }
  }

  // ── Contact signals ──
  if (CONTACT_SIGNALS.Email[0].test(t)) {
    score += 1;
    matchedSections.push('Email');
  } else {
    missingSections.push('Email');
  }

  if (CONTACT_SIGNALS.Phone[0].test(t)) {
    score += 1;
    matchedSections.push('Phone');
  } else {
    missingSections.push('Phone');
  }

  const hasLink = CONTACT_SIGNALS.Links.some(r => r.test(t));
  if (hasLink) {
    score += 1;
    matchedSections.push('Links (LinkedIn/GitHub/Portfolio)');
  } else {
    missingSections.push('Links (LinkedIn/GitHub/Portfolio)');
  }

  return { score, matchedSections, missingSections };
}

// ---------------------------------------------------------------------------
// validateUpload (main export)
// ---------------------------------------------------------------------------

/**
 * Validates whether the provided document text represents a genuine resume.
 *
 * Decision flow:
 *  - Score < 4  → immediate fail (not a resume)
 *  - Score 4–5  → uncertain; AI fallback via `verifyFn` (if provided)
 *  - Score ≥ 6  → immediate pass (resume confirmed)
 *
 * When `verifyFn` is not provided and the score falls in the uncertain range,
 * the function applies a conservative heuristic: score ≥ 5 → pass, else fail.
 *
 * @param text     - Raw plain text extracted from the uploaded document.
 * @param verifyFn - Optional AI verification function for uncertain cases.
 * @returns          A `ValidationResult` describing the classification decision.
 *
 * @example
 * // With AI fallback
 * const result = await validateUpload(pdfText, async (text) => {
 *   const prompt = RESUME_PROMPTS.VERIFY_RESUME({ documentText: text.slice(0, 3000) });
 *   const raw = await getAICompletion([{ role: 'system', content: prompt }], { jsonMode: true });
 *   return parseJSONRobust(raw) as AIVerificationResult;
 * });
 *
 * if (!result.isResume) {
 *   throw new Error('Uploaded file does not appear to be a resume.');
 * }
 */
export async function validateUpload(
  text: string,
  verifyFn?: VerifyFn
): Promise<ValidationResult> {
  const { score, matchedSections, missingSections } = scoreDocument(text);

  // ── Immediate fail ──
  if (score < 4) {
    return {
      isResume: false,
      score,
      confidence: 'low',
      matchedSections,
      missingSections,
      reason: 'Missing essential resume sections',
    };
  }

  // ── Uncertain range — attempt AI verification ──
  if (score < 6) {
    if (verifyFn) {
      try {
        const aiResult = await verifyFn(text);
        return {
          isResume: aiResult.isResume,
          score,
          confidence: aiResult.confidence >= 80 ? 'high' : 'medium',
          matchedSections,
          missingSections,
          reason: aiResult.reason ?? 'AI verification applied',
        };
      } catch (err) {
        console.error('[uploadValidator] AI verification failed, applying fallback heuristic.', err);
      }
    }

    // Fallback heuristic when AI is unavailable or errored
    if (score >= 5) {
      return {
        isResume: true,
        score,
        confidence: 'medium',
        matchedSections,
        missingSections,
        reason: 'Programmatic pass (AI verification unavailable)',
      };
    }
    return {
      isResume: false,
      score,
      confidence: 'low',
      matchedSections,
      missingSections,
      reason: 'Missing essential resume sections',
    };
  }

  // ── Immediate pass ──
  return {
    isResume: true,
    score,
    confidence: 'high',
    matchedSections,
    missingSections,
    reason: 'Valid resume',
  };
}
