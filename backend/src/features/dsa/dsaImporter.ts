// backend/src/features/dsa/dsaImporter.ts

import { DSAProblemMetadata } from './dsaTypes';

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class DSAContentImporter {
  /**
   * Validates a candidate DSA problem metadata object.
   */
  public static validate(problem: Partial<DSAProblemMetadata>, existingSlugs: Set<string> = new Set()): ImportValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!problem.title || problem.title.trim().length === 0) {
      errors.push('Problem title is missing or empty.');
    }

    if (!problem.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(problem.slug)) {
      errors.push(`Invalid slug format: "${problem.slug}". Must be lowercase kebab-case.`);
    } else if (existingSlugs.has(problem.slug)) {
      errors.push(`Duplicate slug detected: "${problem.slug}".`);
    }

    if (!problem.difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(problem.difficulty.toUpperCase())) {
      errors.push(`Invalid difficulty "${problem.difficulty}". Allowed: EASY, MEDIUM, HARD.`);
    }

    if (!problem.topic || problem.topic.trim().length === 0) {
      errors.push('Problem topic is missing.');
    }

    if (problem.reviewStatus && !['draft', 'reviewed', 'verified', 'published'].includes(problem.reviewStatus)) {
      errors.push(`Invalid reviewStatus: "${problem.reviewStatus}". Allowed: draft, reviewed, verified, published.`);
    }

    // Strict starterMetadata validation
    if (!problem.starterMetadata) {
      errors.push('starterMetadata is strictly required. No inference allowed.');
    } else {
      if (!problem.starterMetadata.functionName && problem.starterMetadata.problemType !== 'DESIGN') {
        errors.push('starterMetadata.functionName is required.');
      }
      if (!problem.starterMetadata.returnType && problem.starterMetadata.problemType !== 'DESIGN') {
        errors.push('starterMetadata.returnType is required.');
      }
      if (!Array.isArray(problem.starterMetadata.parameters)) {
        errors.push('starterMetadata.parameters must be an array.');
      }
    }

    // Strict executionMetadata validation
    if (!problem.executionMetadata) {
      errors.push('executionMetadata is strictly required. No inference allowed.');
    } else {
      if (!problem.executionMetadata.comparator) {
        errors.push('executionMetadata.comparator is required.');
      }
    }

    // Strict driverMetadata validation
    if (!problem.driverMetadata) {
      errors.push('driverMetadata is strictly required. No inference allowed.');
    } else if (!problem.driverMetadata.driver) {
      errors.push('driverMetadata.driver is required.');
    }

    const testList = problem.tests || [...(problem.visibleTests || []), ...(problem.hiddenTests || [])];
    if (!Array.isArray(testList) || testList.length === 0) {
      warnings.push('No test cases provided.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Imports and normalizes a batch of problem raw documents/JSON objects.
   */
  public static importBatch(rawProblems: Partial<DSAProblemMetadata>[]): {
    imported: DSAProblemMetadata[];
    failed: Array<{ problem: Partial<DSAProblemMetadata>; errors: string[] }>;
  } {
    const existingSlugs = new Set<string>();
    const imported: DSAProblemMetadata[] = [];
    const failed: Array<{ problem: Partial<DSAProblemMetadata>; errors: string[] }> = [];

    for (const raw of rawProblems) {
      const validation = this.validate(raw, existingSlugs);
      if (validation.valid && raw.slug) {
        existingSlugs.add(raw.slug);
        const testCases = raw.tests || [...(raw.visibleTests || []), ...(raw.hiddenTests || [])];
        const visibleTests = testCases.filter((t) => !t.classification || t.classification === 'sample' || t.classification === 'edge' || t.classification === 'corner');
        const hiddenTests = testCases.filter((t) => t.classification === 'hidden' || t.classification === 'performance' || t.classification === 'stress');

        const normalized: DSAProblemMetadata = {
          schemaVersion: raw.schemaVersion || 1,
          contentVersion: raw.contentVersion || 1,
          metadataVersion: raw.metadataVersion || 1,
          lastReviewed: raw.lastReviewed || new Date().toISOString().split('T')[0],
          lastModified: raw.lastModified || new Date().toISOString().split('T')[0],
          author: raw.author || 'PrepGenie Content Team',
          reviewStatus: raw.reviewStatus || 'published',
          slug: raw.slug,
          title: raw.title!,
          difficulty: (raw.difficulty?.toUpperCase() as any) || 'MEDIUM',
          leetcodeNumber: raw.leetcodeNumber,
          estimatedMinutes: raw.estimatedMinutes,
          frequency: raw.frequency,
          acceptanceRate: raw.acceptanceRate,
          premium: raw.premium ?? false,
          topic: raw.topic || 'miscellaneous',
          subtopic: raw.subtopic || '',
          tags: raw.tags || [],
          companies: raw.companies || [],
          learningPaths: raw.learningPaths || ['Placement Essentials'],
          description: raw.description || '',
          constraints: raw.constraints || [],
          examples: raw.examples || [],
          hints: raw.hints || [],
          editorial: raw.editorial || '',
          starterMetadata: raw.starterMetadata!,
          executionMetadata: raw.executionMetadata!,
          driverMetadata: raw.driverMetadata!,
          relationships: {
            prerequisites: raw.relationships?.prerequisites || [],
            followUps: raw.relationships?.followUps || [],
            variants: raw.relationships?.variants || [],
            related: raw.relationships?.related || [],
            learningPathPrevious: raw.relationships?.learningPathPrevious || null,
            learningPathNext: raw.relationships?.learningPathNext || null,
            ...raw.relationships,
          },
          visibleTests: visibleTests.length > 0 ? visibleTests : raw.visibleTests || [],
          hiddenTests: hiddenTests.length > 0 ? hiddenTests : raw.hiddenTests || [],
          tests: testCases,
          solutionMetadata: raw.solutionMetadata,
          aiMetadata: raw.aiMetadata,
          analyticsMetadata: raw.analyticsMetadata,
        };
        imported.push(normalized);
      } else {
        failed.push({ problem: raw, errors: validation.errors });
      }
    }

    return { imported, failed };
  }
}

