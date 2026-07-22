/**
 * Single source of truth for all language configuration in DSA Studio.
 *
 * Rules:
 * - Judge0 language IDs stay inside RealExecutionProvider — never here.
 * - UI only ever knows about SupportedLanguage identifiers and LanguageConfig.
 */

export type SupportedLanguage = 'cpp' | 'java' | 'python' | 'javascript';

export interface LanguageConfig {
  /** Display name shown in selectors */
  label: string;
  /** Monaco Editor language identifier */
  monacoId: string;
  /** Default file name shown in editor toolbar */
  defaultFileName: string;
  /** Generic starter template used when a problem has no specific starter */
  starterTemplate: string;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'cpp',
  'java',
  'python',
  'javascript',
] as const;

export const LANGUAGE_CONFIG: Record<SupportedLanguage, LanguageConfig> = {
  cpp: {
    label: 'C++',
    monacoId: 'cpp',
    defaultFileName: 'solution.cpp',
    starterTemplate: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

class Solution {
public:
    // Write your solution here
    
};`,
  },

  java: {
    label: 'Java',
    monacoId: 'java',
    defaultFileName: 'Solution.java',
    starterTemplate: `class Solution {
    // Write your solution here
    
}`,
  },

  python: {
    label: 'Python',
    monacoId: 'python',
    defaultFileName: 'solution.py',
    starterTemplate: `class Solution:
    # Write your solution here
    def solve(self):
        pass`,
  },

  javascript: {
    label: 'JavaScript',
    monacoId: 'javascript',
    defaultFileName: 'solution.js',
    starterTemplate: `/**
 * @return {void}
 */
var solve = function() {
    // Write your solution here
};`,
  },
};

/**
 * Returns the appropriate starter code for a given language.
 * Problem-specific starters take priority over generic defaults.
 *
 * @param language  - The target language
 * @param problemStarters - Optional map of language → problem-specific code
 */
export function getStarterTemplate(
  language: SupportedLanguage,
  problemStarters?: Record<string, string> | null
): string {
  const problemCode = problemStarters?.[language];
  if (problemCode && problemCode.trim().length > 0) return problemCode;
  return LANGUAGE_CONFIG[language]?.starterTemplate ?? '// Start coding here\n';
}

/** Type guard to check whether a raw string is a valid SupportedLanguage */
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}
