// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

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

  // ─────────────────────────────────────────────────────────────────────────
  // Mock Interview Studio — Personas & Templates
  // ─────────────────────────────────────────────────────────────────────────

  console.log('Seeding interview personas...');

  const personas = [
    {
      name: 'Amazon SDE Interviewer',
      company: 'Amazon',
      role: 'Software Development Engineer',
      questioningStyle: 'structured',
      strictness: 7,
      followUpDepth: 3,
      communicationTone: 'formal',
      evaluationStyle: 'rigorous',
      systemPromptHint: 'You follow Amazon Leadership Principles strictly. Always ask for concrete STAR-format examples.',
    },
    {
      name: 'Google SWE Interviewer',
      company: 'Google',
      role: 'Software Engineer',
      questioningStyle: 'socratic',
      strictness: 8,
      followUpDepth: 3,
      communicationTone: 'neutral',
      evaluationStyle: 'rigorous',
      systemPromptHint: 'Focus on algorithmic thinking, system design tradeoffs, and code quality. Ask "what else?" frequently.',
    },
    {
      name: 'Startup CTO',
      company: null,
      role: 'Startup',
      questioningStyle: 'conversational',
      strictness: 5,
      followUpDepth: 2,
      communicationTone: 'friendly',
      evaluationStyle: 'standard',
      systemPromptHint: 'Prioritize pragmatism, speed, and ownership over theoretical perfection.',
    },
    {
      name: 'HR Recruiter',
      company: null,
      role: 'Human Resources',
      questioningStyle: 'structured',
      strictness: 4,
      followUpDepth: 2,
      communicationTone: 'friendly',
      evaluationStyle: 'lenient',
      systemPromptHint: 'Focus on culture fit, career goals, communication skills, and past experiences.',
    },
    {
      name: 'Behavioral Coach',
      company: null,
      role: 'Career Coach',
      questioningStyle: 'socratic',
      strictness: 6,
      followUpDepth: 3,
      communicationTone: 'neutral',
      evaluationStyle: 'standard',
      systemPromptHint: 'Always use STAR method. Push for specific examples when answers are vague.',
    },
    {
      name: 'Microsoft Hiring Manager',
      company: 'Microsoft',
      role: 'Engineering Manager',
      questioningStyle: 'structured',
      strictness: 7,
      followUpDepth: 2,
      communicationTone: 'formal',
      evaluationStyle: 'rigorous',
      systemPromptHint: 'Balance technical depth with culture and growth mindset. Ask about collaboration and impact.',
    },
  ];

  const createdPersonas: Record<string, string> = {};
  for (const persona of personas) {
    const p = await (prisma as any).interviewPersona.upsert({
      where: { id: persona.name.toLowerCase().replace(/\s+/g, '-') + '-persona' },
      update: {},
      create: { id: persona.name.toLowerCase().replace(/\s+/g, '-') + '-persona', ...persona },
    });
    createdPersonas[persona.name] = p.id;
  }

  console.log('Seeding interview templates...');

  const templates = [
    // TECHNICAL
    { title: 'Technical Interview — Junior Level', type: 'TECHNICAL', difficulty: 'EASY', experienceLevel: 'JUNIOR', durationMinutes: 30, questionCount: 6, topics: ['Arrays', 'Strings', 'Recursion', 'OOP', 'SQL Basics'], companyStyle: 'General', description: 'Core data structures and fundamentals for entry-level roles.', personaName: null },
    { title: 'Technical Interview — SDE II Level', type: 'TECHNICAL', difficulty: 'MEDIUM', experienceLevel: 'MID', durationMinutes: 45, questionCount: 8, topics: ['Trees', 'Graphs', 'Dynamic Programming', 'System Design Basics', 'REST APIs'], companyStyle: 'FAANG', description: 'Mid-level algorithm and design questions typical of SDE II rounds.', personaName: 'Google SWE Interviewer' },
    { title: 'Technical Interview — Senior/Staff Level', type: 'TECHNICAL', difficulty: 'HARD', experienceLevel: 'SENIOR', durationMinutes: 60, questionCount: 10, topics: ['Advanced Algorithms', 'Distributed Systems', 'Concurrency', 'Database Internals', 'Performance'], companyStyle: 'FAANG', description: 'Deep algorithmic and architectural challenges for senior engineers.', personaName: 'Google SWE Interviewer' },

    // BEHAVIORAL
    { title: 'Behavioral Interview — Entry Level', type: 'BEHAVIORAL', difficulty: 'EASY', experienceLevel: 'JUNIOR', durationMinutes: 20, questionCount: 5, topics: ['Teamwork', 'Communication', 'Learning from Failure', 'Time Management'], companyStyle: 'General', description: 'Basic behavioral competency questions for fresh graduates.', personaName: 'HR Recruiter' },
    { title: 'Behavioral Interview — Amazon LPs', type: 'BEHAVIORAL', difficulty: 'MEDIUM', experienceLevel: 'MID', durationMinutes: 30, questionCount: 8, topics: ['Ownership', 'Customer Obsession', 'Bias for Action', 'Conflict Resolution', 'Leadership'], companyStyle: 'FAANG', description: 'Amazon Leadership Principle-based behavioral questions.', personaName: 'Amazon SDE Interviewer' },
    { title: 'Behavioral Interview — Leadership Track', type: 'BEHAVIORAL', difficulty: 'HARD', experienceLevel: 'SENIOR', durationMinutes: 45, questionCount: 8, topics: ['Strategic Decision Making', 'Cross-team Influence', 'Mentorship', 'Ambiguity', 'Organizational Impact'], companyStyle: 'Enterprise', description: 'Complex behavioral scenarios for senior and staff-level roles.', personaName: 'Behavioral Coach' },

    // HR
    { title: 'HR Screening — Fresher', type: 'HR', difficulty: 'EASY', experienceLevel: 'JUNIOR', durationMinutes: 20, questionCount: 6, topics: ['Self Introduction', 'Career Goals', 'Strengths & Weaknesses', 'Salary Expectations'], companyStyle: 'General', description: 'Standard HR screening for campus placements and entry-level roles.', personaName: 'HR Recruiter' },
    { title: 'HR Round — Mid Level', type: 'HR', difficulty: 'MEDIUM', experienceLevel: 'MID', durationMinutes: 25, questionCount: 7, topics: ['Work-Life Balance', 'Career Transition', 'Motivation', 'Team Dynamics', 'Role Expectations'], companyStyle: 'General', description: 'HR interview for experienced professionals switching roles.', personaName: 'HR Recruiter' },
    { title: 'HR Round — Senior Hire', type: 'HR', difficulty: 'HARD', experienceLevel: 'SENIOR', durationMinutes: 30, questionCount: 7, topics: ['Executive Alignment', 'Culture Fit', 'Compensation Negotiation', 'Vision & Impact', 'Work Style'], companyStyle: 'Enterprise', description: 'Senior-level HR evaluation with strategic and cultural alignment questions.', personaName: 'Microsoft Hiring Manager' },

    // SYSTEM DESIGN
    { title: 'System Design — Junior Introduction', type: 'SYSTEM_DESIGN', difficulty: 'EASY', experienceLevel: 'MID', durationMinutes: 30, questionCount: 4, topics: ['Client-Server Architecture', 'REST APIs', 'Basic Databases', 'Caching Basics'], companyStyle: 'Startup', description: 'Introduction to system design for engineers starting to learn architecture.', personaName: 'Startup CTO' },
    { title: 'System Design — SDE II Round', type: 'SYSTEM_DESIGN', difficulty: 'MEDIUM', experienceLevel: 'MID', durationMinutes: 45, questionCount: 5, topics: ['Scalability', 'Load Balancing', 'SQL vs NoSQL', 'Message Queues', 'CDN'], companyStyle: 'FAANG', description: 'Standard system design round for SDE II positions at top tech companies.', personaName: 'Amazon SDE Interviewer' },
    { title: 'System Design — Staff Engineer', type: 'SYSTEM_DESIGN', difficulty: 'HARD', experienceLevel: 'STAFF', durationMinutes: 60, questionCount: 5, topics: ['Distributed Systems', 'CAP Theorem', 'Consensus Algorithms', 'Global Scale', 'Reliability Engineering'], companyStyle: 'FAANG', description: 'Expert-level distributed systems design for staff/principal engineers.', personaName: 'Google SWE Interviewer' },

    // CUSTOM
    { title: 'Full-Stack Web Developer Interview', type: 'CUSTOM', difficulty: 'MEDIUM', experienceLevel: 'MID', durationMinutes: 40, questionCount: 8, topics: ['JavaScript', 'React', 'Node.js', 'REST APIs', 'SQL', 'Authentication', 'Performance'], companyStyle: 'Startup', description: 'Covers frontend + backend skills for full-stack web developer roles.', personaName: 'Startup CTO' },
    { title: 'Data Engineering Interview', type: 'CUSTOM', difficulty: 'MEDIUM', experienceLevel: 'MID', durationMinutes: 45, questionCount: 8, topics: ['SQL', 'Data Pipelines', 'Apache Spark', 'Data Modeling', 'ETL', 'Cloud Storage'], companyStyle: 'Enterprise', description: 'Data engineering concepts for pipeline and infrastructure roles.', personaName: null },
    { title: 'DevOps & SRE Interview', type: 'CUSTOM', difficulty: 'HARD', experienceLevel: 'SENIOR', durationMinutes: 45, questionCount: 8, topics: ['Docker', 'Kubernetes', 'CI/CD', 'Monitoring', 'Incident Response', 'SLAs', 'Infrastructure as Code'], companyStyle: 'Enterprise', description: 'DevOps/SRE interview covering infrastructure, reliability, and on-call practices.', personaName: null },
  ];

  for (const tmpl of templates) {
    const { personaName, ...data } = tmpl;
    await (prisma as any).interviewTemplate.create({
      data: {
        ...data,
        isPublic: true,
        followUpDepth: 2,
        personaId: personaName ? createdPersonas[personaName] : null,
      },
    });
  }

  console.log(`Seeded ${personas.length} personas and ${templates.length} templates.`);

  // ─────────────────────────────────────────────────────────────────────────
  // Live Coding Studio v2.1 — Seeding from JSON
  // ─────────────────────────────────────────────────────────────────────────
  console.log('Seeding Live Coding problems from JSON...');

  const dataDir = path.join(__dirname, '../data/questions');
  const files = [
    'arrays-strings.json',
    'searching-sorting.json',
    'stacks-queues.json',
    'greedy.json',
    'linked-lists.json',
    'recursion-backtracking.json',
    'dynamic-programming.json',
    'graphs.json',
    'trees.json'
  ];

  let problemCount = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}, skipping...`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const problems = JSON.parse(fileContent);

    for (const p of problems) {
      // Upsert Topic
      const topics = await Promise.all(p.topics.map(async (tName: string) => {
        const slug = tName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return prisma.codingTopic.upsert({
          where: { slug },
          update: {},
          create: { name: tName, slug }
        });
      }));

      // Upsert Company
      const companies = await Promise.all((p.companies || []).map(async (cName: string) => {
        const slug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return prisma.codingCompany.upsert({
          where: { slug },
          update: {},
          create: { name: cName, slug }
        });
      }));

      // Upsert Tags
      const tags = await Promise.all((p.tags || []).map(async (tName: string) => {
        const slug = tName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return prisma.codingTag.upsert({
          where: { slug },
          update: {},
          create: { name: tName, slug }
        });
      }));

      // Upsert Problem
      await prisma.codingProblem.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          difficulty: p.difficulty,
          description: p.description,
          constraints: p.constraints,
          examples: p.examples,
          starterCode: p.starterCode,
          editorial: p.editorial,
          hints: p.hints,
          expectedApproach: p.expectedApproach,
          timeComplexity: p.timeComplexity,
          spaceComplexity: p.spaceComplexity,
          estimatedTime: p.estimatedTime,
          sampleTests: p.sampleTests,
          hiddenTests: p.hiddenTests,
          topics: {
            connect: topics.map(t => ({ id: t.id }))
          },
          companies: {
            connect: companies.map(c => ({ id: c.id }))
          },
          tags: {
            connect: tags.map(t => ({ id: t.id }))
          }
        },
        create: {
          slug: p.slug,
          title: p.title,
          difficulty: p.difficulty,
          description: p.description,
          constraints: p.constraints,
          examples: p.examples,
          starterCode: p.starterCode,
          editorial: p.editorial,
          hints: p.hints,
          expectedApproach: p.expectedApproach,
          timeComplexity: p.timeComplexity,
          spaceComplexity: p.spaceComplexity,
          estimatedTime: p.estimatedTime,
          sampleTests: p.sampleTests,
          hiddenTests: p.hiddenTests,
          topics: {
            connect: topics.map(t => ({ id: t.id }))
          },
          companies: {
            connect: companies.map(c => ({ id: c.id }))
          },
          tags: {
            connect: tags.map(t => ({ id: t.id }))
          }
        }
      });
      problemCount++;
    }
  }

  console.log(`Seeded ${problemCount} Live Coding problems.`);
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
