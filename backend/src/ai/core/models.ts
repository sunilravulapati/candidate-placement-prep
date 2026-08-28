// backend/src/ai/models.ts

export const AI_MODELS = {
  DEFAULT_TEXT: process.env.GROQ_MODEL || 'groq/compound-mini',
  FAST_TEXT: 'groq/compound-mini',
  COMPOUND_MINI: 'groq/compound-mini',
  QWEN_27B: 'qwen/qwen3.8-27b',
  GPT_OSS_20B: 'openai/gpt-oss-20b',
  GPT_OSS_120B: 'openai/gpt-oss-120b',
} as const;

export type AIModelType = string;
