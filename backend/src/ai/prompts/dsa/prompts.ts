// backend/src/ai/prompts/dsa/prompts.ts

export const DSA_PROMPTS = {
  EXPLAIN_PROBLEM: "Explain the following coding question: {title}\nDescription: {description}",
  REVIEW_SOLUTION: "Review the following code solution for: {title}\nCode:\n{code}",
} as const;
