// backend/src/features/jobDescription/schema.ts
import { z } from 'zod';

export const pasteJDSchema = z.object({
  text: z.string().min(10, 'Job description must be at least 10 characters long'),
});

export const uploadJDSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  type: z.string().refine(val => val === 'application/pdf', {
    message: 'Only PDF documents are allowed',
  }),
  size: z.number().max(10 * 1024 * 1024, 'File size must not exceed 10MB'),
});

export const idSchema = z.string().uuid('Invalid ID format');
