// backend/src/features/dsa/schema.ts
import { z } from 'zod';

export const getQuestionsSchema = z.object({
  category: z.string().optional(),
  difficulty: z.string().optional(),
  status: z.string().optional(),
}).optional();

export const getQuestionByIdSchema = z.number().int().positive();

export const updateQuestionProgressSchema = z.object({
  questionId: z.number().int().positive(),
  data: z.object({
    status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
    code: z.string().optional(),
    notes: z.string().optional(),
    isRevision: z.boolean().optional(),
  }),
});
