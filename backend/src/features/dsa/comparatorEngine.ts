// backend/src/features/dsa/comparatorEngine.ts

import { ComparatorType, ComparatorOptions } from './canonicalTypes';
import { Serializers, ListNode, TreeNode } from './serializers';

export class ComparatorEngine {
  /**
   * Evaluates if actualOutput matches expectedOutput under specified ComparatorType and options.
   */
  public static compare(
    actualRaw: any,
    expectedRaw: any,
    comparator: ComparatorType = 'EXACT',
    options?: ComparatorOptions
  ): boolean {
    const precision = options?.floatingPrecision ?? 1e-5;
    let actualParsed = this.normalizeInput(actualRaw, options);
    let expectedParsed = this.normalizeInput(expectedRaw, options);

    switch (comparator) {
      case 'FLOATING_TOLERANCE':
        return this.compareFloating(actualParsed, expectedParsed, precision);
      case 'UNORDERED_ARRAY':
      case 'UNORDERED_SET':
        return this.compareUnorderedArray(actualParsed, expectedParsed);
      case 'MULTISET_ARRAY':
      case 'NESTED_ARRAY':
        return this.compareNestedArray(actualParsed, expectedParsed);
      case 'LINKED_LIST':
        return this.compareLinkedList(actualParsed, expectedParsed);
      case 'TREE':
        return this.compareTree(actualParsed, expectedParsed);
      case 'GRAPH':
      case 'INTERVAL':
      case 'MATRIX':
        return this.compareExact(actualParsed, expectedParsed);
      case 'DESIGN':
        return this.compareDesign(actualParsed, expectedParsed);
      case 'EXACT':
      default:
        return this.compareExact(actualParsed, expectedParsed);
    }
  }

  private static normalizeInput(val: any, options?: ComparatorOptions): any {
    if (typeof val === 'string') {
      let str = val;
      if (options?.ignoreTrailingSpaces) str = str.replace(/[ \t]+$/gm, '');
      if (options?.ignoreNewLines) str = str.replace(/\r?\n/g, '');
      if (options?.ignoreCase) str = str.toLowerCase();
      const trimmed = str.trim();

      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          return JSON.parse(trimmed);
        } catch {
          return trimmed;
        }
      }
      return trimmed;
    }
    return val;
  }

  private static compareExact(actual: any, expected: any): boolean {
    if (actual === expected) return true;
    if (JSON.stringify(actual) === JSON.stringify(expected)) return true;

    // Handle space/comma-separated strings against array of numbers/strings
    if (Array.isArray(expected) && typeof actual === 'string') {
      const tokens = actual.trim().split(/[\s,]+/).filter(Boolean);
      if (tokens.length === expected.length) {
        const parsedTokens = tokens.map((t) => {
          const n = Number(t);
          return !isNaN(n) ? n : t;
        });
        if (JSON.stringify(parsedTokens) === JSON.stringify(expected)) return true;
      }
    }

    // Handle boolean comparisons
    if (typeof expected === 'boolean' || expected === 'true' || expected === 'false') {
      const expBool = expected === true || expected === 'true';
      if (typeof actual === 'string') {
        const actLower = actual.trim().toLowerCase();
        if ((actLower === 'true' || actLower === '1') && expBool) return true;
        if ((actLower === 'false' || actLower === '0') && !expBool) return true;
      } else if (typeof actual === 'boolean') {
        return actual === expBool;
      } else if (typeof actual === 'number') {
        return (actual === 1 && expBool) || (actual === 0 && !expBool);
      }
    }

    // Handle scalar string/number comparisons
    if (typeof expected === 'number' && typeof actual === 'string') {
      const actNum = Number(actual.trim());
      if (!isNaN(actNum) && actNum === expected) return true;
    }

    return false;
  }

  private static compareDesign(actual: any, expected: any): boolean {
    if (actual === expected) return true;
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) return false;
      for (let i = 0; i < actual.length; i++) {
        const a = actual[i];
        const e = expected[i];
        if (a === e) continue;
        if (a === null && e === null) continue;
        if (JSON.stringify(a) !== JSON.stringify(e)) return false;
      }
      return true;
    }
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  private static compareFloating(actual: any, expected: any, precision: number): boolean {
    const numActual = Number(actual);
    const numExpected = Number(expected);
    if (!isNaN(numActual) && !isNaN(numExpected)) {
      return Math.abs(numActual - numExpected) <= precision;
    }
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) return false;
      return actual.every((val, idx) =>
        this.compareFloating(val, expected[idx], precision)
      );
    }
    return this.compareExact(actual, expected);
  }

  private static compareUnorderedArray(actual: any, expected: any): boolean {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      return this.compareExact(actual, expected);
    }
    if (actual.length !== expected.length) return false;

    const sortFn = (a: any, b: any) => {
      const strA = JSON.stringify(a);
      const strB = JSON.stringify(b);
      return strA.localeCompare(strB);
    };

    const sortedActual = [...actual].sort(sortFn);
    const sortedExpected = [...expected].sort(sortFn);

    return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
  }

  private static compareNestedArray(actual: any, expected: any): boolean {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      return this.compareExact(actual, expected);
    }
    if (actual.length !== expected.length) return false;

    const sortInner = (arr: any[]) =>
      arr.map((item) => (Array.isArray(item) ? [...item].sort() : item)).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

    return JSON.stringify(sortInner(actual)) === JSON.stringify(sortInner(expected));
  }

  private static compareLinkedList(actual: any, expected: any): boolean {
    let actualArr: number[] = [];
    let expectedArr: number[] = [];

    if (Array.isArray(actual)) actualArr = actual;
    else if (actual instanceof ListNode) actualArr = Serializers.listNodeToArray(actual);

    if (Array.isArray(expected)) expectedArr = expected;
    else if (expected instanceof ListNode) expectedArr = Serializers.listNodeToArray(expected);

    return JSON.stringify(actualArr) === JSON.stringify(expectedArr);
  }

  private static compareTree(actual: any, expected: any): boolean {
    let actualArr: (number | null)[] = [];
    let expectedArr: (number | null)[] = [];

    if (Array.isArray(actual)) actualArr = actual;
    else if (actual instanceof TreeNode) actualArr = Serializers.treeNodeToArray(actual);

    if (Array.isArray(expected)) expectedArr = expected;
    else if (expected instanceof TreeNode) expectedArr = Serializers.treeNodeToArray(expected);

    // Trim trailing nulls
    while (actualArr.length > 0 && actualArr[actualArr.length - 1] === null) actualArr.pop();
    while (expectedArr.length > 0 && expectedArr[expectedArr.length - 1] === null) expectedArr.pop();

    return JSON.stringify(actualArr) === JSON.stringify(expectedArr);
  }
}

