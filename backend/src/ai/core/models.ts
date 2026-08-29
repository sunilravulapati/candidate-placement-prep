// backend/src/ai/core/models.ts

export const AI_MODELS = {
  // Verified active non-deprecated models on Groq
  DEFAULT_TEXT: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  FAST_TEXT: 'openai/gpt-oss-20b',
  RESUME_MODEL: process.env.GROQ_RESUME_MODEL || 'openai/gpt-oss-20b',
  QWEN_27B: 'qwen/qwen3.8-27b',
  GPT_OSS_20B: 'openai/gpt-oss-20b',
  GPT_OSS_120B: 'openai/gpt-oss-120b',
} as const;

export type AIModelType = string;
