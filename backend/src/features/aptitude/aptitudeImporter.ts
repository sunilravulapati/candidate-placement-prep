// backend/src/features/aptitude/aptitudeImporter.ts

import { AptitudeQuestionMetadata } from './aptitudeTypes';

export interface AptitudeImportValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class AptitudeContentImporter {
  public static validate(q: Partial<AptitudeQuestionMetadata>, existingIds: Set<string> = new Set()): AptitudeImportValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!q.id) {
      errors.push('Question ID is missing.');
    } else if (existingIds.has(q.id)) {
      errors.push(`Duplicate Question ID: "${q.id}".`);
    }

    if (!q.questionText || q.questionText.trim().length === 0) {
      errors.push('Question text is missing.');
    }

    if (!q.category) {
      errors.push('Question category is missing.');
    }

    if (!q.topic) {
      errors.push('Question topic is missing.');
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push('Question options must be an array of at least 2 options.');
    }

    if (!q.answer) {
      errors.push('Question answer key is missing.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public static importBatch(rawQuestions: Partial<AptitudeQuestionMetadata>[]): {
    imported: AptitudeQuestionMetadata[];
    failed: Array<{ question: Partial<AptitudeQuestionMetadata>; errors: string[] }>;
  } {
    const existingIds = new Set<string>();
    const imported: AptitudeQuestionMetadata[] = [];
    const failed: Array<{ question: Partial<AptitudeQuestionMetadata>; errors: string[] }> = [];

    for (const raw of rawQuestions) {
      const validation = this.validate(raw, existingIds);
      if (validation.valid && raw.id) {
        existingIds.add(raw.id);
        imported.push({
          id: raw.id,
          category: raw.category || 'quantitative',
          topic: raw.topic || 'general',
          subtopic: raw.subtopic || '',
          difficulty: (raw.difficulty?.toUpperCase() as any) || 'MEDIUM',
          companies: raw.companies || [],
          learningPaths: raw.learningPaths || ['Placement Essentials'],
          questionText: raw.questionText!,
          options: raw.options!,
          answer: raw.answer!,
          explanation: raw.explanation || '',
          tags: raw.tags || [],
          estimatedTimeSec: raw.estimatedTimeSec || 60,
        });
      } else {
        failed.push({ question: raw, errors: validation.errors });
      }
    }

    return { imported, failed };
  }
}
