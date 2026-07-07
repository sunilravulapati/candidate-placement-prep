// backend/src/index.ts

// Export DB client
export { default as prisma } from './db/client';

// Export Auth
export { getSessionUser } from './auth/session';
export type { SessionUser } from './auth/session';

// ── AI Infrastructure ────────────────────────────────────────────────────────

// AI Provider (upgraded: retry, backoff, JSON mode, timeout)
export { getAICompletion, callGroqRaw, groq } from './ai/provider';
export type { ChatMessage, AICompletionOptions } from './ai/provider';
export { AI_MODELS } from './ai/models';
export type { AIModelType } from './ai/models';

// AI JSON utilities (Phase 1)
export { parseJSONRobust, repairAIJson } from './ai/jsonParser';
export type { AICaller } from './ai/jsonParser';

// ── Shared Utilities ─────────────────────────────────────────────────────────

// Link normalization (Phase 1)
export { normalizeLink, normalizeBasicsLinks } from './utils/normalizeLinks';
export type { LinkType, BasicLinks } from './utils/normalizeLinks';

// ── DSA Feature ──────────────────────────────────────────────────────────────
export * from './features/dsa/actions';
export * from './features/dsa/types';

// ── User Feature ─────────────────────────────────────────────────────────────
export * from './features/user/actions';
export * from './features/user/types';

// ── Resume Feature ───────────────────────────────────────────────────────────

// CRUD actions and types (existing)
export * from './features/resume/actions';
export * from './features/resume/types';

// Phase 1: Pure utility modules (no DB, no AI, no Prisma)
export { parseResume } from './features/resume/parser';
export type { ParsedResumeMetadata, ResumeContacts } from './features/resume/parser';

export {
  structureScore,
  impactScore,
  skillAlignmentScore,
  realismPenalty,
  calculateProgrammaticScore,
  calculateFinalScore,
} from './features/resume/scoring';

export { scoreBullet, shouldKeepRewrittenBullet } from './features/resume/bulletScorer';
export type { RoleType } from './features/resume/bulletScorer';

export { cleanBulletVerbosity, FILLER_PHRASES } from './features/resume/textCleaner';
