// backend/src/features/resume/scoring.ts
//
// Programmatic ATS scoring engine.
// Ported from resume-ai-backend/services/scorer.js.
//
// IMPORTANT: This file is intentionally dependency-free from external services.
// - No database calls.
// - No AI calls.
// - No Prisma.
// All functions are pure — given the same text they always return the same score.
//
// ⚠️  Vocabulary constants have moved to constants.ts.
//     STRUCTURAL_SECTIONS and CANONICAL_SKILLS are imported from there.
//
// How the final score is composed:
//
//   Programmatic score (0–50)
//     = structureScore   (0–20)
//     + impactScore      (0–20)
//     + skillAlignmentScore (0–20)
//     - realismPenalty   (0–43 deducted)
//     scaled from raw/60 × 50, clamped to [0, 50]
//
//   Final score (0–100)
//     = programmaticScore          (0–50)
//     + scaledSemantic             (semanticScore/30 × 45, clamped to 45)
//
// The semantic score (0–30) comes from the AI analysis response (three
// sub-scores: complexity 0–15, professionalism 0–5, skillProjectFit 0–10).
// That part lives in the AI pipeline — NOT in this file.

import { STRUCTURAL_SECTIONS, CANONICAL_SKILLS } from './constants';

// ---------------------------------------------------------------------------
// structureScore
// ---------------------------------------------------------------------------

/**
 * Scores the structural completeness of a resume by counting how many of the
 * 6 canonical section headings appear in the text.
 *
 * Scoring bands (raw, before any scaling):
 *  - 1–3 sections  → sections × 2.5         (max 7.5)
 *  - 4–6 sections  → 7.5 + (extra × 2.5)    (max 20, capped)
 *
 * @param text - The full extracted resume text (plain string).
 * @returns      A raw structure score in the range [0, 20].
 */
export function structureScore(text: string): number {
  let found = 0;

  for (const section of STRUCTURAL_SECTIONS) {
    if (new RegExp(`\\b${section}\\b`, 'i').test(text)) {
      found++;
    }
  }

  if (found <= 3) return found * 2.5;
  return Math.min(7.5 + (found - 3) * 2.5, 20);
}

// ---------------------------------------------------------------------------
// impactScore
// ---------------------------------------------------------------------------

/**
 * Scores the quantified impact demonstrated in a resume by counting distinct
 * numeric metric expressions (e.g. "40%", "50 users", "200ms latency").
 *
 * Only distinct matches are counted — duplicating the same stat does not
 * inflate the score.
 *
 * Scoring bands:
 *  - 0–2 distinct metrics → count × 3          (max 6)
 *  - 3–5 distinct metrics → 6 + (extra × 2.5)  (max 13.5)
 *  - 6–8 distinct metrics → 13.5 + (extra × 1.5) (max 18)
 *  - 9+  distinct metrics → capped at 20
 *
 * @param text - The full extracted resume text.
 * @returns      A raw impact score in the range [0, 20].
 */
export function impactScore(text: string): number {
  const impactRegex =
    /\b\d+(\.\d+)?%|\b\d+\+?\s*(users?|customers?|clients?|requests?|ms|seconds?|hours?|days?|latency|accuracy|reduction|increase|growth|improvement)\b/gi;

  const matches = text.match(impactRegex);
  if (!matches) return 0;

  const count = new Set(matches).size;

  if (count <= 2) return count * 3;            // max 6
  if (count <= 5) return 6 + (count - 2) * 2.5;  // max 13.5
  if (count <= 8) return 13.5 + (count - 5) * 1.5; // max 18
  return Math.min(18 + (count - 8) * 0.5, 20);
}

// ---------------------------------------------------------------------------
// skillAlignmentScore
// ---------------------------------------------------------------------------

/**
 * Scores how many of the 16 canonical technology skills appear in the text.
 *
 * Uses word-boundary matching to avoid false positives (e.g. "reactjs" should
 * not match "react" unless the regex is intentionally broad).
 *
 * Scoring bands:
 *  - 0–4  skills → count × 2         (max 8)
 *  - 5–8  skills → 8 + (extra × 2)   (max 16)
 *  - 9+   skills → 16 + (extra × 0.8) (max 20, capped)
 *
 * @param text - The full extracted resume text.
 * @returns      A raw skill alignment score in the range [0, 20].
 */
export function skillAlignmentScore(text: string): number {
  const detected = new Set<string>();

  for (const skill of CANONICAL_SKILLS) {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(text)) {
      detected.add(skill);
    }
  }

  const count = detected.size;

  if (count <= 4) return count * 2;              // max 8
  if (count <= 8) return 8 + (count - 4) * 2;   // max 16
  return Math.min(16 + (count - 8) * 0.8, 20);
}

// ---------------------------------------------------------------------------
// realismPenalty
// ---------------------------------------------------------------------------

/**
 * Applies penalty points for structural signals that indicate a weak,
 * student, or entry-level resume submitted to a role requiring real
 * professional experience.
 *
 * Penalties are cumulative and are subtracted from the raw score before
 * scaling.  A perfect resume earns zero penalty.
 *
 * Penalty table:
 *  - Is clearly a student (ongoing/expected/pursuing)  → -8
 *  - No professional work experience detected          → -12
 *  - Zero percentage/metric mentions in entire resume  → -8
 *  - Resume text < 200 words (very thin)               → -15
 *  - Resume text 200–349 words (thin)                  → -7
 *
 * @param text - The full extracted resume text.
 * @returns      A non-negative penalty value to subtract from the raw score.
 */
export function realismPenalty(text: string): number {
  let penalty = 0;

  const isStudent = /expected|ongoing|pursuing/i.test(text);
  const hasWork =
    /(intern|software engineer|developer|analyst|backend|frontend)/i.test(text);
  const wordCount = text.trim().split(/\s+/).length;

  if (isStudent) penalty += 8;
  if (!hasWork) penalty += 12;

  // Hard penalty for a resume with zero quantified metrics
  if (!text.includes('%') && !/percent|latency|reduction/i.test(text)) {
    penalty += 8;
  }

  if (wordCount < 200) penalty += 15;
  else if (wordCount < 350) penalty += 7;

  return penalty;
}

// ---------------------------------------------------------------------------
// calculateProgrammaticScore
// ---------------------------------------------------------------------------

/**
 * Combines all sub-scores into a single programmatic score scaled to [0, 50].
 *
 * Formula:
 *   raw = structureScore + impactScore + skillAlignmentScore - realismPenalty
 *   clamped = max(0, raw)
 *   result  = round((clamped / 60) × 50)
 *
 * The divisor 60 represents the theoretical maximum raw total
 * (20 + 20 + 20 = 60) before penalties.
 *
 * @param text - The full extracted resume text.
 * @returns      An integer programmatic score in the range [0, 50].
 */
export function calculateProgrammaticScore(text: string): number {
  const rawStructure = structureScore(text);
  const rawImpact = impactScore(text);
  const rawSkills = skillAlignmentScore(text);
  const penalty = realismPenalty(text);

  const raw = rawStructure + rawImpact + rawSkills - penalty;
  const clamped = Math.max(0, raw);
  return Math.round((clamped / 60) * 50);
}

// ---------------------------------------------------------------------------
// calculateFinalScore
// ---------------------------------------------------------------------------

/**
 * Combines the programmatic score with the AI semantic score into a final
 * ATS score capped at 100.
 *
 * Weight breakdown:
 *  - Programmatic (0–50): 50 points max — already scaled
 *  - Semantic (0–30 raw): scaled to 45 points max (30/30 × 45 = 45)
 *  - Total possible: 95 (the remaining 5 is a practical ceiling buffer)
 *
 * The semantic score comes from the AI analysis response:
 *   semanticScore = complexity (0–15) + professionalism (0–5) + skillProjectFit (0–10)
 *
 * @param programmaticScore - Output of `calculateProgrammaticScore` (0–50).
 * @param semanticScore     - Sum of AI sub-scores returned by the LLM (0–30).
 * @returns                   Final ATS score in the range [0, 100].
 */
export function calculateFinalScore(
  programmaticScore: number,
  semanticScore: number
): number {
  const scaledSemantic = Math.round((semanticScore / 30) * 45);
  return Math.min(programmaticScore + scaledSemantic, 100);
}
