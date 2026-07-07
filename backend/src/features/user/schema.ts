// backend/src/features/user/schema.ts
import { z } from 'zod';

export const syncUserSchema = z.object({
  clerkUserId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
});

export const userIdSchema = z.string();
