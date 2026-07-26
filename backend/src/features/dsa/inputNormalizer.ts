import type { TestCaseSpec } from './dsaTypes';

function splitTopLevel(input: string, separator: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (const char of input) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      current += char;
      escaped = true;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += char;
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote) {
      if (char === '[' || char === '{' || char === '(') {
        depth += 1;
      } else if (char === ']' || char === '}' || char === ')') {
        depth = Math.max(0, depth - 1);
      }
    }

    if (char === separator && !inSingleQuote && !inDoubleQuote && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim().length > 0) {
    parts.push(current);
  }

  return parts;
}

function expandRanges(value: string): string {
  return value.replace(/\[([\s\S]*?)\]/g, (match: string, inner: string) => {
    const normalized = inner.replace(/\b(\d+)\s*\.\.\s*(\d+)\b/g, (_all: string, startStr: string, endStr: string) => {
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      const length = end - start + 1;
      if (length <= 0 || length > 20000) {
        return `${start},${end}`;
      }
      return Array.from({ length }, (_, index) => String(start + index)).join(',');
    });
    return `[${normalized}]`;
  });
}

function expandRepeatedStrings(value: string): string {
  return value.replace(/(["'])(.*?)\1\s*\*\s*(\d+)/g, (_all, quote, content, countStr) => {
    const count = Math.min(Math.max(parseInt(countStr, 10), 0), 100000);
    return JSON.stringify(content.repeat(count));
  });
}

function isSimpleValue(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (/^".*"$/.test(trimmed) || /^'.*'$/.test(trimmed)) return true;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return true;
  if (/^true$|^false$|^null$/i.test(trimmed)) return true;
  return false;
}

function normalizeValueString(value: string): string {
  let normalized = value.trim();
  normalized = expandRanges(normalized);
  normalized = expandRepeatedStrings(normalized);

  if (isSimpleValue(normalized)) {
    if (/^'.*'$/.test(normalized)) {
      return JSON.stringify(normalized.slice(1, -1));
    }
    return normalized;
  }

  if (normalized.startsWith('[') || normalized.startsWith('{')) {
    try {
      JSON.parse(normalized);
      return normalized;
    } catch {
      // Fall through to string encode below
    }
  }

  return JSON.stringify(normalized);
}

function hasTopLevelSeparator(input: string, separator: string): boolean {
  return splitTopLevel(input, separator).length > 1;
}

function normalizeSingleLineInput(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) return '';

  if (trimmed.includes('=') || hasTopLevelSeparator(trimmed, ',') || trimmed.includes('..') || trimmed.includes('*')) {
    const parts = splitTopLevel(trimmed, ',');
    const values = parts.map((part) => {
      const match = part.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]*)$/);
      if (match) {
        return match[2].trim();
      }
      return part.trim();
    });
    return values.map(normalizeValueString).join('\n');
  }

  return trimmed;
}

export function normalizeTestInput(rawInput: string): string {
  if (typeof rawInput !== 'string') return String(rawInput ?? '');
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) return trimmed;

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const normalizedLines = lines.map((line) => normalizeSingleLineInput(line));
  return normalizedLines.join('\n');
}

export function normalizeTestCases(testCases: TestCaseSpec[] = []): TestCaseSpec[] {
  return testCases.map((testCase) => ({
    ...testCase,
    input: normalizeTestInput(testCase.input),
  }));
}
