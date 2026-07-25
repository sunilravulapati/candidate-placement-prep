// backend/src/__tests__/dsa/importer.test.ts

import { DSAContentImporter } from '../../features/dsa/dsaImporter';

describe('DSAContentImporter Strict Validation Tests', () => {
  it('rejects problems missing starterMetadata', () => {
    const raw = {
      slug: 'invalid-prob',
      title: 'Invalid',
      difficulty: 'EASY',
      topic: 'arrays'
    };
    const res = DSAContentImporter.validate(raw as any);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('starterMetadata'))).toBe(true);
  });

  it('rejects problems missing executionMetadata', () => {
    const raw = {
      slug: 'invalid-prob-2',
      title: 'Invalid 2',
      difficulty: 'EASY',
      topic: 'arrays',
      starterMetadata: { functionName: 'foo', returnType: 'int', parameters: [] }
    };
    const res = DSAContentImporter.validate(raw as any);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('executionMetadata'))).toBe(true);
  });

  it('rejects problems missing driverMetadata', () => {
    const raw = {
      slug: 'invalid-prob-3',
      title: 'Invalid 3',
      difficulty: 'EASY',
      topic: 'arrays',
      starterMetadata: { functionName: 'foo', returnType: 'int', parameters: [] },
      executionMetadata: { comparator: 'EXACT' }
    };
    const res = DSAContentImporter.validate(raw as any);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('driverMetadata'))).toBe(true);
  });

  it('accepts complete metadata-driven problem specs', () => {
    const validRaw = {
      slug: 'valid-prob',
      title: 'Valid Problem',
      difficulty: 'EASY',
      topic: 'arrays',
      starterMetadata: { functionName: 'validFunc', returnType: 'int', parameters: [] },
      executionMetadata: { comparator: 'EXACT', inputType: [], outputType: 'int' },
      driverMetadata: { driver: 'DEFAULT' },
      tests: [{ input: '1', expectedOutput: '1' }]
    };
    const res = DSAContentImporter.validate(validRaw as any);
    expect(res.valid).toBe(true);
    expect(res.errors.length).toBe(0);
  });
});
