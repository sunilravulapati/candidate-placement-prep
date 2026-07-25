// backend/src/features/dsa/repositoryIndex.ts

import { ProblemLoader } from './problemLoader';
import { DSAProblemMetadata } from './dsaTypes';

export interface IndexSummary {
  totalProblems: number;
  topicsCount: number;
  companiesCount: number;
  learningPathsCount: number;
  tagsCount: number;
}

export class RepositoryIndex {
  private static cachedProblems: DSAProblemMetadata[] | null = null;
  private static topicMap: Map<string, DSAProblemMetadata[]> = new Map();
  private static companyMap: Map<string, DSAProblemMetadata[]> = new Map();
  private static learningPathMap: Map<string, DSAProblemMetadata[]> = new Map();
  private static difficultyMap: Map<string, DSAProblemMetadata[]> = new Map();
  private static tagMap: Map<string, DSAProblemMetadata[]> = new Map();

  public static initialize(forceRebuild = false) {
    if (this.cachedProblems && !forceRebuild) return;

    const problems = ProblemLoader.loadAllDirectoryProblems();
    this.cachedProblems = problems;

    this.topicMap.clear();
    this.companyMap.clear();
    this.learningPathMap.clear();
    this.difficultyMap.clear();
    this.tagMap.clear();

    for (const prob of problems) {
      // 1. Topic Index
      const topic = (prob.topic || 'miscellaneous').toLowerCase().trim();
      if (!this.topicMap.has(topic)) this.topicMap.set(topic, []);
      this.topicMap.get(topic)!.push(prob);

      // 2. Company Index
      const companies = prob.companies || [];
      for (const comp of companies) {
        const cKey = comp.toLowerCase().trim();
        if (!this.companyMap.has(cKey)) this.companyMap.set(cKey, []);
        this.companyMap.get(cKey)!.push(prob);
      }

      // 3. Learning Path Index
      const paths = prob.learningPaths || ['Placement Essentials'];
      for (const pathName of paths) {
        const pKey = pathName.toLowerCase().trim();
        if (!this.learningPathMap.has(pKey)) this.learningPathMap.set(pKey, []);
        this.learningPathMap.get(pKey)!.push(prob);
      }

      // 4. Difficulty Index
      const diff = (prob.difficulty || 'MEDIUM').toUpperCase();
      if (!this.difficultyMap.has(diff)) this.difficultyMap.set(diff, []);
      this.difficultyMap.get(diff)!.push(prob);

      // 5. Tag Index
      const tags = prob.tags || [];
      for (const tag of tags) {
        const tKey = tag.toLowerCase().trim();
        if (!this.tagMap.has(tKey)) this.tagMap.set(tKey, []);
        this.tagMap.get(tKey)!.push(prob);
      }
    }

    // Sort company maps by frequency descending
    for (const [compKey, list] of this.companyMap.entries()) {
      list.sort((a, b) => {
        const freqA = a.relationships?.companyFrequency?.[compKey] ?? a.frequency ?? 0;
        const freqB = b.relationships?.companyFrequency?.[compKey] ?? b.frequency ?? 0;
        return freqB - freqA;
      });
    }
  }

  public static getAllProblems(): DSAProblemMetadata[] {
    this.initialize();
    return this.cachedProblems || [];
  }

  public static getProblemsByTopic(topicSlug: string): DSAProblemMetadata[] {
    this.initialize();
    const key = topicSlug.toLowerCase().trim();
    return this.topicMap.get(key) || [];
  }

  public static getProblemsByCompany(companySlug: string): DSAProblemMetadata[] {
    this.initialize();
    const key = companySlug.toLowerCase().trim();
    return this.companyMap.get(key) || [];
  }

  public static getProblemsByLearningPath(pathSlug: string): DSAProblemMetadata[] {
    this.initialize();
    const key = pathSlug.toLowerCase().trim();
    return this.learningPathMap.get(key) || [];
  }

  public static getProblemsByDifficulty(difficulty: string): DSAProblemMetadata[] {
    this.initialize();
    return this.difficultyMap.get(difficulty.toUpperCase()) || [];
  }

  public static getProblemsByTag(tag: string): DSAProblemMetadata[] {
    this.initialize();
    const key = tag.toLowerCase().trim();
    return this.tagMap.get(key) || [];
  }

  public static getSummary(): IndexSummary {
    this.initialize();
    return {
      totalProblems: (this.cachedProblems || []).length,
      topicsCount: this.topicMap.size,
      companiesCount: this.companyMap.size,
      learningPathsCount: this.learningPathMap.size,
      tagsCount: this.tagMap.size,
    };
  }
}
