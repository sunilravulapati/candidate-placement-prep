// backend/src/ai/services/structuredOutput.ts
//
// Structured Output Service.
// Calls the underlying getAICompletion API with JSON mode enabled,
// extracts JSON outputs, and triggers recursive repair procedures if needed.
//
// Keeps feature modules fully isolated from Groq or provider level calls.

import { ChatMessage, AICompletionOptions, getAICompletion } from '../provider';
import { parseJSONRobust, repairAIJson } from '../jsonParser';
import { logger } from '../../core/logger';
import { AI_MODELS } from '../models';

export interface StructuredAICallResult<T> {
  data: T;
  rawOutput: string;
  modelUsed: string;
  retryCount: number;
  latency: number;
}

/**
 * Executes a structured AI query expecting a valid JSON output matching a custom validator.
 *
 * Steps:
 *   1. Execute raw AI completion with central model configuration registry.
 *   2. Parse output robustly.
 *   3. If initial parsing fails, call LLM-repaired AI json parser.
 *   4. Validate against custom validator.
 *
 * @param messages  - Structured ChatMessages.
 * @param validator - A schema verification parser.
 * @param options   - LLM configuration parameters.
 */
export async function callStructuredAI<T>(
  messages: ChatMessage[],
  validator: (data: any) => T,
  options: AICompletionOptions = {}
): Promise<StructuredAICallResult<T>> {
  const startTime = Date.now();
  const modelUsed = options.model || AI_MODELS.DEFAULT_TEXT;

  logger.info(`Initiating structured AI completion with model: ${modelUsed}`, {
    category: 'ai',
    modelUsed,
  });

  const completionOptions: AICompletionOptions = {
    ...options,
    jsonMode: true,
  };

  let rawOutput = '';
  try {
    rawOutput = await getAICompletion(messages, completionOptions);
  } catch (err) {
    logger.error('Failed structured AI completion API request', err, {
      category: 'ai',
      modelUsed,
    });
    throw err;
  }

  const networkTime = Date.now() - startTime;
  logger.debug(`Raw completion completed in ${networkTime}ms`, {
    category: 'ai',
    processingTime: networkTime,
    modelUsed,
  });

  let parsed: any;
  let retryCount = 0;

  try {
    parsed = parseJSONRobust(rawOutput);
  } catch (parseErr) {
    logger.warn('Failed to parse unstructured response JSON. Running repair loop...', {
      category: 'json_repair',
      rawOutputLength: rawOutput.length,
    });

    const repairStart = Date.now();
    try {
      retryCount = 1;
      parsed = await repairAIJson(rawOutput, async (prompt: string) => {
        return getAICompletion(
          [{ role: 'user', content: prompt }],
          { model: modelUsed, temperature: 0, jsonMode: true }
        );
      });
      const repairTime = Date.now() - repairStart;
      logger.info('Structured response JSON repaired by AI', {
        category: 'json_repair',
        processingTime: repairTime,
      });
    } catch (repairErr) {
      logger.error('AI JSON repair loop failed', repairErr, {
        category: 'json_repair',
      });
      throw new Error(`Failed to parse AI output: ${(parseErr as Error).message}`);
    }
  }

  try {
    const validatedData = validator(parsed);
    const latency = Date.now() - startTime;
    return {
      data: validatedData,
      rawOutput,
      modelUsed,
      retryCount,
      latency,
    };
  } catch (valErr) {
    logger.error('Structured response validation failed', valErr, {
      category: 'parsing',
    });
    throw new Error(`AI response layout mismatch: ${(valErr as Error).message}`);
  }
}
