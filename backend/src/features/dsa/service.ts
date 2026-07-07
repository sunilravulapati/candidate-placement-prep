// backend/src/features/dsa/service.ts
import { DSARepository } from './repository';
import { QuestionFilter, QuestionProgressUpdateInput } from './types';

const MOCK_QUESTIONS = [
  {
    id: 1,
    title: "Reverse a String",
    description: "Write a function that reverses a string without using the built-in reverse() method.",
    category: "JavaScript",
    difficulty: "easy" as const,
    timeEstimate: 15,
    topic: "Strings",
    companies: ["Google", "Amazon"],
    solutionStub: "function reverseString(str) {\n  // Write your code here\n  return '';\n}",
    progress: [] as any[],
  },
  {
    id: 2,
    title: "React Component Lifecycle",
    description: "Explain the React component lifecycle methods and their use cases. Focus on hooks like useEffect.",
    category: "React",
    difficulty: "medium" as const,
    timeEstimate: 20,
    topic: "State Management",
    companies: ["Meta", "Netflix"],
    solutionStub: "import React, { useEffect } from 'react';\n\nexport default function Timer() {\n  useEffect(() => {\n    return () => {};\n  }, []);\n  return <div>Timer</div>;\n}",
    progress: [] as any[],
  },
  {
    id: 3,
    title: "Binary Tree Traversal",
    description: "Implement in-order, pre-order, and post-order traversal of a binary tree.",
    category: "Algorithms",
    difficulty: "hard" as const,
    timeEstimate: 30,
    topic: "Trees",
    companies: ["Google", "Microsoft"],
    solutionStub: "function inOrder(root) {\n  // Implement traversal\n}",
    progress: [] as any[],
  },
  {
    id: 4,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    category: "Algorithms",
    difficulty: "easy" as const,
    timeEstimate: 15,
    topic: "Arrays",
    companies: ["Google", "Amazon", "Apple"],
    solutionStub: "function twoSum(nums, target) {\n  return [];\n}",
    progress: [] as any[],
  },
];

export class DSAService {
  static async getQuestions(filters?: QuestionFilter) {
    try {
      const dbQuestions = await DSARepository.findMany(filters);
      return dbQuestions.map(q => ({
        ...q,
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
      }));
    } catch (error) {
      console.warn('Database query failed, falling back to mock questions. Reason:', (error as Error).message);
      
      // Apply filtering to mock list
      let result = MOCK_QUESTIONS;
      if (filters?.category && filters.category !== 'all') {
        result = result.filter(q => q.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters?.difficulty && filters.difficulty !== 'all') {
        result = result.filter(q => q.difficulty === filters.difficulty);
      }
      return result;
    }
  }

  static async getQuestionById(id: number, userId?: string) {
    try {
      const dbQuestion = await DSARepository.findUnique(id, userId);
      if (!dbQuestion) return null;
      return {
        ...dbQuestion,
        difficulty: dbQuestion.difficulty as 'easy' | 'medium' | 'hard',
      };
    } catch (error) {
      console.warn(`Database query for question ID ${id} failed, falling back to mock data.`);
      const mockQ = MOCK_QUESTIONS.find(q => q.id === id);
      if (!mockQ) return null;
      return mockQ;
    }
  }

  static async updateQuestionProgress(
    userId: string,
    questionId: number,
    data: QuestionProgressUpdateInput
  ) {
    try {
      return await DSARepository.upsertProgress(userId, questionId, data);
    } catch (error) {
      console.warn('Failed to upsert question progress in DB. Storing mock local status.', (error as Error).message);
      return {
        id: 'mock_progress_id',
        userId,
        questionId,
        status: data.status || 'not_started',
        code: data.code || '',
        notes: data.notes || '',
        isRevision: data.isRevision || false,
        updatedAt: new Date(),
      };
    }
  }
}
