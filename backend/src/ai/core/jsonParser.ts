// backend/src/ai/jsonParser.ts
//
// Production-proven JSON extraction and repair utilities.
// Ported from resume-ai-backend/services/aiAnalyzer.js.
//
// These functions deal with the reality that LLMs often wrap their JSON
// output in markdown code fences or occasionally produce malformed JSON.
// Both functions are pure — no Groq client, no side effects.
// The repair function requires a Groq caller to be injected, keeping
// this module dependency-free when only parsing is needed.

/**
 * A callable that forwards a repair prompt to the LLM and returns the raw
 * string response. Injected into `repairAIJson` so the module itself has
 * no direct Groq dependency.
 */
export type AICaller = (prompt: string) => Promise<string>;

// ---------------------------------------------------------------------------
// parseJSONRobust
// ---------------------------------------------------------------------------

/**
 * Attempts to extract a valid JSON object from a raw LLM response string.
 *
 * Strategy:
 *  1. Strip leading/trailing markdown code fences (```json … ``` or ``` … ```).
 *  2. Try JSON.parse on the cleaned string.
 *  3. If that fails, scan for the first `{…}` block and try again.
 *  4. Throw a descriptive error that includes the first 400 chars of the raw
 *     input so callers can log it for debugging.
 *
 * @param raw - The raw string returned by the LLM.
 * @returns   A parsed JavaScript object.
 * @throws    If no valid JSON can be extracted.
 *
 * @example
 * const obj = parseJSONRobust('```json\n{"score":42}\n```');
 * // => { score: 42 }
 */
export function parseJSONRobust(raw: string): Record<string, unknown> {
  // Step 1 — strip markdown code fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  // Step 2 — direct parse
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    // Step 3 — extract the first { … } block and retry
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as Record<string, unknown>;
      } catch {
        // fall through to error
      }
    }

    // Step 4 — give up with a descriptive message
    throw new Error(
      `[jsonParser] Could not parse JSON from model response:\n${raw.slice(0, 400)}`
    );
  }
}

// ---------------------------------------------------------------------------
// repairAIJson
// ---------------------------------------------------------------------------

/**
 * Attempts to repair malformed JSON by sending it back to the LLM and asking
 * it to return only the corrected JSON object.
 *
 * The `caller` parameter is a thin abstraction so this function has no direct
 * dependency on the Groq SDK. Pass `callGroqRaw` or any compatible async
 * function that accepts a string prompt and returns a string response.
 *
 * @param malformedRaw - The broken JSON string returned by the LLM.
 * @param caller       - An async function that calls the AI and returns a raw string.
 * @returns            A parsed JavaScript object from the repaired JSON.
 * @throws             If the LLM cannot produce valid JSON even after repair.
 *
 * @example
 * const repaired = await repairAIJson(brokenString, async (prompt) => {
 *   const response = await groq.chat.completions.create({
 *     model: 'llama-3.1-8b-instant',
 *     messages: [{ role: 'user', content: prompt }],
 *     temperature: 0,
 *   });
 *   return response.choices[0]?.message?.content ?? '';
 * });
 */
export async function repairAIJson(
  malformedRaw: string,
  caller: AICaller
): Promise<Record<string, unknown>> {
  const prompt =
    'You are a JSON repair specialist. The user will give you malformed JSON. ' +
    'Return ONLY the corrected, valid JSON object — no markdown, no explanation.\n\n' +
    `Fix this JSON:\n\n${malformedRaw}`;

  const repaired = await caller(prompt);
  return parseJSONRobust(repaired);
}
