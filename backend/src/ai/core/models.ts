// backend/src/ai/models.ts

export const AI_MODELS = {
  DEFAULT_TEXT: 'llama-3.3-70b-versatile',
  FAST_TEXT: 'llama-3.1-8b-instant',
} as const;

export type AIModelType = typeof AI_MODELS[keyof typeof AI_MODELS];
