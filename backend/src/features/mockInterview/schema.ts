// backend/src/features/mockInterview/schema.ts
//
// Zod validation schemas for all server action inputs.

import { z } from 'zod';

export const interviewTypeSchema = z.enum([
  'TECHNICAL',
  'BEHAVIORAL',
  'HR',
  'SYSTEM_DESIGN',
  'CUSTOM',
]);

export const interviewDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);

export const experienceLevelSchema = z.enum([
  'JUNIOR',
  'MID',
  'SENIOR',
  'STAFF',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Start Interview — validates the configuration form submission
// ─────────────────────────────────────────────────────────────────────────────

export const startInterviewSchema = z.object({
  type: interviewTypeSchema,
  difficulty: interviewDifficultySchema,
  experienceLevel: experienceLevelSchema,
  targetCompany: z.string().max(100).optional(),
  targetRole: z.string().max(100).optional(),
  durationMinutes: z.number().int().min(10).max(120).default(30),
  topics: z.array(z.string().max(80)).min(1).max(15),
  language: z.string().default('English'),
  personaId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  resumeId: z.string().uuid().optional(),
  jobDescriptionId: z.string().uuid().optional(),
});

export type StartInterviewInput = z.infer<typeof startInterviewSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Submit Answer — validates an answer submission
// ─────────────────────────────────────────────────────────────────────────────

export const submitAnswerSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  questionId: z.string().uuid('Invalid question ID'),
  answerText: z.string().min(1, 'Answer cannot be empty').max(8000),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// End Interview — validates the session close request
// ─────────────────────────────────────────────────────────────────────────────

export const endInterviewSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  reason: z.enum(['completed', 'abandoned', 'time_limit']).default('completed'),
});

export type EndInterviewInput = z.infer<typeof endInterviewSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Get Session — fetch a specific session
// ─────────────────────────────────────────────────────────────────────────────

export const getSessionSchema = z.string().uuid('Invalid session ID');
