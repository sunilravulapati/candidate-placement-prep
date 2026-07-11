// backend/src/ai/provider.ts
//
// Groq AI client wrapper with production-grade reliability features.
// Upgraded from the original stub to add:
//   - Exponential backoff retry on rate-limit (HTTP 429) errors
//   - Configurable retry count and timeout per call
//   - JSON mode (Groq `response_format: { type: 'json_object' }`)
//   - A low-level `callGroqRaw()` export for use by jsonParser's repairAIJson()
//
// PUBLIC API PRESERVED:
//   - `groq`               (Groq client singleton)
//   - `ChatMessage`        (interface)
//   - `AICompletionOptions` (interface — extended, backwards-compatible)
//   - `getAICompletion()`  (function — same signature, enhanced internally)

import Groq from 'groq-sdk';
import { AI_MODELS, AIModelType } from './models';

// ---------------------------------------------------------------------------
// Groq client singleton
// ---------------------------------------------------------------------------

const groqApiKey = process.env.GROQ_API_KEY;

/**
 * Shared Groq SDK client instance.
 * Exported so that other AI modules (e.g. repairAIJson) can reuse it
 * without creating a second connection.
 */
export const groq = new Groq({
  apiKey: groqApiKey || 'mock_key_for_build_purposes',
});

// ---------------------------------------------------------------------------
// Types (public API — unchanged from original)
// ---------------------------------------------------------------------------

/** A single message in a chat completion request. */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Options for `getAICompletion`.
 *
 * All fields are optional. New fields added in this upgrade are backwards-
 * compatible — existing call sites do not need to change.
 */
export interface AICompletionOptions {
  /** The Groq model to use. Defaults to `AI_MODELS.DEFAULT_TEXT`. */
  model?: AIModelType | string;

  /** Sampling temperature (0–2). Lower = more deterministic. Default: 0.2 */
  temperature?: number;

  /** Maximum tokens in the response. Default: unlimited. */
  maxTokens?: number;

  /**
   * When `true`, instructs the model to return a valid JSON object.
   * Maps to `response_format: { type: 'json_object' }` in the Groq API.
   * Default: false.
   *
   * Note: You must still ask for JSON in the system/user prompt — this flag
   * only enforces the output format at the API level.
   */
  jsonMode?: boolean;

  /**
   * Maximum number of retry attempts on retryable errors (HTTP 429 rate
   * limit). The first attempt is not counted as a retry.
   * Default: 2 (i.e. up to 3 total attempts).
   */
  maxRetries?: number;

  /**
   * Per-attempt timeout in milliseconds. If a single Groq call takes longer
   * than this, it is aborted and retried (if attempts remain).
   * Default: 30_000 (30 seconds).
   */
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns `true` if the error represents a transient, retryable condition.
 * Currently: HTTP 429 rate-limit errors from Groq.
 */
function isRetryableError(err: unknown): boolean {
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (e['status'] === 429) return true;
    if (
      typeof e['error'] === 'object' &&
      e['error'] !== null &&
      (e['error'] as Record<string, unknown>)['code'] === 'rate_limit_exceeded'
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Delays execution for the specified number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// callGroqRaw  (low-level, injectable)
// ---------------------------------------------------------------------------

/**
 * Low-level Groq call with retry logic and timeout.
 *
 * This function is intentionally exported so that `jsonParser.repairAIJson()`
 * can inject it as its `AICaller` without creating a circular dependency.
 *
 * Most consumers should use `getAICompletion()` instead.
 *
 * @param messages  - The conversation messages to send.
 * @param options   - Full `AICompletionOptions` including retry and JSON mode.
 * @returns           Raw string content from the model's first choice.
 */
export async function callGroqRaw(
  messages: ChatMessage[],
  options: AICompletionOptions = {}
): Promise<string> {
  const model = options.model || AI_MODELS.DEFAULT_TEXT;
  const temperature = options.temperature ?? 0.2;
  const maxRetries = options.maxRetries ?? 2;
  const timeoutMs = options.timeoutMs ?? 30_000;

  const requestBody = {
    model,
    temperature,
    messages,
    max_tokens: options.maxTokens,
    ...(options.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const completion = await groq.chat.completions.create(
        requestBody,
        // Pass the AbortSignal so Groq SDK respects our timeout
        { signal: controller.signal } as Parameters<typeof groq.chat.completions.create>[1]
      );
      clearTimeout(timeoutId);
      return completion.choices?.[0]?.message?.content ?? '';
    } catch (err) {
      clearTimeout(timeoutId);

      // Check for timeout (AbortError)
      if (
        typeof err === 'object' &&
        err !== null &&
        (err as { name?: string }).name === 'AbortError'
      ) {
        if (attempt < maxRetries) {
          console.warn(
            `[provider] Groq call timed out after ${timeoutMs}ms. ` +
            `Retrying (attempt ${attempt + 1}/${maxRetries})…`
          );
          await sleep(1000 * Math.pow(2, attempt)); // exponential backoff
          continue;
        }
        throw new Error(
          `[provider] Groq call timed out after ${maxRetries + 1} attempt(s).`
        );
      }

      // Check for rate limit (retryable)
      if (isRetryableError(err) && attempt < maxRetries) {
        const delayMs = 1500 * Math.pow(2, attempt); // 1.5s, 3s, 6s …
        console.warn(
          `[provider] Groq rate limit hit. ` +
          `Waiting ${delayMs}ms before retry ${attempt + 1}/${maxRetries}…`
        );
        await sleep(delayMs);
        continue;
      }

      // Non-retryable or exhausted retries — rethrow
      throw err;
    }
  }

  // TypeScript requires an explicit return here even though the loop always
  // throws or returns before exiting in practice.
  throw new Error('[provider] Unexpected: retry loop exited without result or throw.');
}

// ---------------------------------------------------------------------------
// getAICompletion  (public API — original signature preserved)
// ---------------------------------------------------------------------------

/**
 * AI Service Client wrapper for Groq chat completion.
 *
 * Wraps `callGroqRaw` with logging and a consistent error surface.
 * Accepts all `AICompletionOptions` including the new `jsonMode`,
 * `maxRetries`, and `timeoutMs` fields.
 *
 * Existing call sites pass `{ model, temperature, maxTokens }` and continue
 * to work without changes because the new fields all have safe defaults.
 *
 * @param messages - Chat messages to send to the model.
 * @param options  - Optional configuration (all fields have defaults).
 * @returns          The model's raw text response (string).
 *
 * @example
 * // Existing usage — unchanged
 * const result = await getAICompletion(messages);
 *
 * // New: request JSON output with retry and timeout
 * const json = await getAICompletion(messages, {
 *   jsonMode: true,
 *   maxRetries: 3,
 *   timeoutMs: 20_000,
 *   temperature: 0.1,
 * });
 */
export async function getAICompletion(
  messages: ChatMessage[],
  options: AICompletionOptions = {}
): Promise<string> {
  try {
    return await callGroqRaw(messages, options);
  } catch (error) {
    console.error('[provider] Error fetching chat completion from Groq:', error);
    throw error;
  }
}
