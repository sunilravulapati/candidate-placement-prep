// backend/src/features/dsa/actions.ts
'use server';

import { getSessionUser } from '../../auth/session';
import { DSAService } from './service';
import { getQuestionsSchema, getQuestionByIdSchema, updateQuestionProgressSchema } from './schema';

export async function getQuestionsAction(filters?: { category?: string; difficulty?: string; status?: string }) {
  // Validate filters
  const parsed = getQuestionsSchema.safeParse(filters);
  if (!parsed.success) {
    throw new Error('Invalid query filters: ' + parsed.error.message);
  }

  const user = await getSessionUser();
  return DSAService.getQuestions({
    ...parsed.data,
    userId: user?.id,
  });
}

export async function getQuestionByIdAction(id: number) {
  // Validate question ID
  const parsed = getQuestionByIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error('Invalid question ID format');
  }

  const user = await getSessionUser();
  return DSAService.getQuestionById(parsed.data, user?.id);
}

export async function updateQuestionProgressAction(
  questionId: number,
  data: {
    status?: 'not_started' | 'in_progress' | 'completed';
    code?: string;
    notes?: string;
    isRevision?: boolean;
  }
) {
  // Validate all inputs using combined schema
  const parsed = updateQuestionProgressSchema.safeParse({ questionId, data });
  if (!parsed.success) {
    throw new Error('Invalid progress update input: ' + parsed.error.message);
  }

  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const { questionId: validId, data: validData } = parsed.data;
  return DSAService.updateQuestionProgress(user.id, validId, validData);
}
