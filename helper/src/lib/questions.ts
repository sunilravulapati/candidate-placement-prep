// src/lib/questions.ts
export interface Question {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'not_started' | 'in_progress' | 'completed';
  timeEstimate: number;
}

export const getQuestions = (): Question[] => {
  // This would typically come from an API or database
  return [
    {
      id: 1,
      title: "Reverse a String",
      description: "Write a function that reverses a string without using the built-in reverse() method.",
      category: "JavaScript",
      difficulty: "easy",
      status: "not_started",
      timeEstimate: 15
    },
    {
      id: 2,
      title: "React Component Lifecycle",
      description: "Explain the React component lifecycle methods and their use cases.",
      category: "React",
      difficulty: "medium",
      status: "not_started",
      timeEstimate: 20
    },
    {
      id: 3,
      title: "Binary Tree Traversal",
      description: "Implement in-order, pre-order, and post-order traversal of a binary tree.",
      category: "Algorithms",
      difficulty: "hard",
      status: "not_started",
      timeEstimate: 30
    }
  ];
};