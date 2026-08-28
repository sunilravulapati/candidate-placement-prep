/**
 * Single source of truth for all language configuration in DSA Studio (V1 Standard Input Model).
 */

export type SupportedLanguage = 'cpp' | 'java' | 'python' | 'javascript' | 'typescript';

export interface LanguageConfig {
  /** Display name shown in selectors */
  label: string;
  /** Monaco Editor language identifier */
  monacoId: string;
  /** Default file name shown in editor toolbar */
  defaultFileName: string;
  /** Generic starter template providing competitive-programming boilerplate */
  starterTemplate: string;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'cpp',
  'java',
  'python',
  'javascript',
  'typescript',
] as const;

export const LANGUAGE_CONFIG: Record<SupportedLanguage, LanguageConfig> = {
  cpp: {
    label: 'C++',
    monacoId: 'cpp',
    defaultFileName: 'solution.cpp',
    starterTemplate: `#include <bits/stdc++.h>
using namespace std;

int main() {

    // Write your solution here

    return 0;
}`,
  },

  java: {
    label: 'Java',
    monacoId: 'java',
    defaultFileName: 'Main.java',
    starterTemplate: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your solution here
    }
}`,
  },

  python: {
    label: 'Python',
    monacoId: 'python',
    defaultFileName: 'solution.py',
    starterTemplate: `def main():
    # Write your solution here
    pass


if __name__ == "__main__":
    main()`,
  },

  javascript: {
    label: 'JavaScript',
    monacoId: 'javascript',
    defaultFileName: 'solution.js',
    starterTemplate: `const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim();

// Write your solution here`,
  },

  typescript: {
    label: 'TypeScript',
    monacoId: 'typescript',
    defaultFileName: 'solution.ts',
    starterTemplate: `import * as fs from "fs";

const input = fs.readFileSync(0, "utf8").trim();

// Write your solution here`,
  },
};

/**
 * Returns the appropriate starter code for a given language in V1 standard input mode.
 *
 * @param language - The target language
 * @param problemStarters - Optional map of language -> problem-specific code
 */
export function getStarterTemplate(
  language: SupportedLanguage,
  problemStarters?: Record<string, string> | null
): string {
  const problemCode = problemStarters?.[language];
  if (problemCode && problemCode.trim().length > 0) return problemCode;
  return LANGUAGE_CONFIG[language]?.starterTemplate ?? '// Write your solution here\n';
}

/** Type guard to check whether a raw string is a valid SupportedLanguage */
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang as SupportedLanguage);
}
