// backend/src/features/resume/schema.ts
import { z } from 'zod';

export const renameResumeSchema = z.object({
  id: z.string().uuid('Invalid resume ID format'),
  name: z.string().min(1, 'Resume name cannot be empty').max(100, 'Resume name is too long'),
});

export const deleteResumeSchema = z.string().uuid('Invalid resume ID format');

// Schema for validating file upload properties
export const uploadFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  type: z.string().refine(val => val === 'application/pdf', {
    message: 'Only PDF documents are allowed',
  }),
  size: z.number().max(10 * 1024 * 1024, 'File size must not exceed 10MB'), // 10MB limit
});

export const canonicalResumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    portfolio: z.string().optional(),
    github: z.string().optional(),
  }),
  summary: z.string(),
  experience: z.array(z.object({
    id: z.string().uuid().optional(),
    title: z.string(),
    company: z.string(),
    location: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    current: z.boolean(),
    bullets: z.array(z.string()),
  })),
  projects: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    description: z.string().optional(),
    technologies: z.array(z.string()),
    link: z.string().optional(),
    bullets: z.array(z.string()),
  })),
  education: z.array(z.object({
    id: z.string().uuid().optional(),
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    gpa: z.string().optional(),
    bullets: z.array(z.string()).optional(),
  })),
  skills: z.object({
    languages: z.array(z.string()).optional(),
    frameworks: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    core: z.array(z.string()).optional(),
  }),
  certifications: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    issuer: z.string(),
    date: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
});

export type CanonicalResume = z.infer<typeof canonicalResumeSchema>;
