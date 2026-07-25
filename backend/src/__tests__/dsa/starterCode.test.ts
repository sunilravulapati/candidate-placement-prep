// backend/src/__tests__/dsa/starterCode.test.ts

import { StarterCodeGenerator } from '../../features/dsa/starterCodeGenerator';
import { ALL_SUPPORTED_LANGUAGES, StarterMetadata } from '../../features/dsa/canonicalTypes';

describe('StarterCodeGenerator Unit Tests', () => {
  const twoSumMetadata: StarterMetadata = {
    functionName: 'twoSum',
    className: 'Solution',
    returnType: 'array<int>',
    parameters: [
      { name: 'nums', type: 'array<int>' },
      { name: 'target', type: 'int' }
    ]
  };

  const designMetadata: StarterMetadata = {
    problemType: 'DESIGN',
    className: 'MyQueue',
    functionName: 'MyQueue',
    parameters: [],
    returnType: 'void',
    methods: [
      { name: 'push', parameters: [{ name: 'x', type: 'int' }], returnType: 'void' },
      { name: 'pop', parameters: [], returnType: 'int' },
      { name: 'peek', parameters: [], returnType: 'int' },
      { name: 'empty', parameters: [], returnType: 'bool' }
    ]
  };

  it('generates non-empty starter code for all supported languages for function problems', () => {
    for (const lang of ALL_SUPPORTED_LANGUAGES) {
      const code = StarterCodeGenerator.generate(twoSumMetadata, lang);
      expect(code).toBeTruthy();
      expect(code.length).toBeGreaterThan(10);
      expect(code.includes('twoSum')).toBe(true);
      expect(code.includes('solver')).toBe(false);
    }
  });

  it('generates design class templates for all supported languages', () => {
    for (const lang of ALL_SUPPORTED_LANGUAGES) {
      const code = StarterCodeGenerator.generate(designMetadata, lang);
      expect(code).toBeTruthy();
      expect(code.includes('MyQueue')).toBe(true);
      expect(code.includes('push')).toBe(true);
      expect(code.includes('pop')).toBe(true);
      expect(code.includes('peek')).toBe(true);
      expect(code.includes('empty')).toBe(true);
    }
  });
});
