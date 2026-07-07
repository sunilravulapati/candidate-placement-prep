// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in environment variables.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create a default test user
  const user = await prisma.user.upsert({
    where: { id: 'user_test_123' },
    update: {},
    create: {
      id: 'user_test_123',
      email: 'candidate@prepgenie.dev',
      name: 'Test Candidate',
      role: 'candidate',
    },
  });
  console.log(`Created test user: ${user.name} (${user.id})`);

  // Define initial questions
  const initialQuestions = [
    {
      title: "Reverse a String",
      description: "Write a function that reverses a string without using the built-in reverse() method.",
      category: "JavaScript",
      difficulty: "easy",
      timeEstimate: 15,
      topic: "Strings",
      companies: ["Google", "Amazon"],
      solutionStub: "function reverseString(str) {\n  // Write your code here\n  return '';\n}",
    },
    {
      title: "React Component Lifecycle",
      description: "Explain the React component lifecycle methods and their use cases. Focus on hooks like useEffect.",
      category: "React",
      difficulty: "medium",
      timeEstimate: 20,
      topic: "State Management",
      companies: ["Meta", "Netflix"],
      solutionStub: "// Explain React component hooks or provide example code\nimport React, { useEffect } from 'react';\n\nexport default function Timer() {\n  useEffect(() => {\n    // Setup side effect here\n    return () => {\n      // Cleanup side effect here\n    };\n  }, []);\n  return <div>Timer</div>;\n}",
    },
    {
      title: "Binary Tree Traversal",
      description: "Implement in-order, pre-order, and post-order traversal of a binary tree.",
      category: "Algorithms",
      difficulty: "hard",
      timeEstimate: 30,
      topic: "Trees",
      companies: ["Google", "Microsoft", "Uber"],
      solutionStub: "class Node {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nfunction inOrder(root) {\n  // Implement in-order traversal\n}",
    },
    {
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      category: "Algorithms",
      difficulty: "easy",
      timeEstimate: 15,
      topic: "Arrays",
      companies: ["Google", "Amazon", "Apple", "Adobe"],
      solutionStub: "function twoSum(nums, target) {\n  // Write your code here\n  return [];\n}",
    },
    {
      title: "Valid Anagram",
      description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
      category: "Algorithms",
      difficulty: "easy",
      timeEstimate: 10,
      topic: "Strings",
      companies: ["Amazon", "Bloomberg"],
      solutionStub: "function isAnagram(s, t) {\n  // Write your code here\n  return false;\n}",
    },
    {
      title: "Flexbox vs Grid",
      description: "Detail the conceptual and practical differences between CSS Flexbox and CSS Grid. When would you use one over the other?",
      category: "CSS",
      difficulty: "easy",
      timeEstimate: 10,
      topic: "Layouts",
      companies: ["Amazon", "Salesforce"],
      solutionStub: "/* Write down your comparison or structural code representation */\n.container-flex {\n  display: flex;\n}\n.container-grid {\n  display: grid;\n}",
    },
    {
      title: "Event Loop Explanation",
      description: "Explain the Node.js Event Loop, task queue, microtask queue, and how asynchronous callbacks are scheduled.",
      category: "Node.js",
      difficulty: "medium",
      timeEstimate: 20,
      topic: "Core Runtime",
      companies: ["Netflix", "PayPal"],
      solutionStub: "// Illustrate Node.js event loop callbacks or write explanations\nsetTimeout(() => console.log('Timeout'), 0);\nPromise.resolve().then(() => console.log('Promise'));\nprocess.nextTick(() => console.log('nextTick'));\n// Predict and explain the execution order.",
    }
  ];

  for (const q of initialQuestions) {
    // Let's check by title instead of id to prevent duplicates:
    const existing = await prisma.question.findFirst({
      where: { title: q.title }
    });
    if (!existing) {
      const created = await prisma.question.create({
        data: q
      });
      console.log(`Added question: ${created.title}`);
    } else {
      console.log(`Question already exists: ${existing.title}`);
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
