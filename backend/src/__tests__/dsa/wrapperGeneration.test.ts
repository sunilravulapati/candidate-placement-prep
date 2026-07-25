// backend/src/__tests__/dsa/wrapperGeneration.test.ts

import { WrapperGenerator } from '../../features/dsa/wrapperGenerator';
import { StarterMetadata, ExecutionMetadata, SupportedLanguage } from '../../features/dsa/canonicalTypes';

describe('WrapperGenerator Unit Tests', () => {
  const starterMetadata: StarterMetadata = {
    functionName: 'rob',
    className: 'Solution',
    returnType: 'int',
    parameters: [{ name: 'nums', type: 'array<int>' }]
  };

  const execMetadata: ExecutionMetadata = {
    inputType: ['array<int>'],
    outputType: 'int',
    comparator: 'EXACT'
  };

  const userCode = `class Solution {\npublic:\n    int rob(vector<int>& nums) { return 4; }\n};`;

  it('generates executable wrappers for all 5 languages without hardcoded problem names', () => {
    const langs: SupportedLanguage[] = ['cpp', 'java', 'python', 'javascript', 'typescript'];
    for (const lang of langs) {
      const wrapped = WrapperGenerator.generateWrapper(starterMetadata, execMetadata, userCode, lang);
      expect(wrapped).toBeTruthy();
      expect(wrapped.includes('rob')).toBe(true);
      expect(wrapped.includes('twoSum')).toBe(false); // verify zero hardcoded twoSum
    }
  });
});
