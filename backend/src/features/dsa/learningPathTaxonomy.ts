// backend/src/features/dsa/learningPathTaxonomy.ts

export interface LearningPathDefinition {
  slug: string;
  title: string;
  description: string;
  targetAudience: string;
  recommendedDays: number;
  badgeColor: string;
}

export const LEARNING_PATHS: LearningPathDefinition[] = [
  {
    slug: 'beginner-dsa',
    title: 'Beginner DSA',
    description: 'Master foundational data structures and basic problem-solving techniques from scratch.',
    targetAudience: '1st & 2nd Year CS / Absolute Beginners',
    recommendedDays: 30,
    badgeColor: 'emerald',
  },
  {
    slug: 'interview-75',
    title: 'Interview 75',
    description: 'The essential 75 curated DSA problems required for top product company interviews.',
    targetAudience: 'Placement Season / Candidates with 4 weeks to prep',
    recommendedDays: 28,
    badgeColor: 'indigo',
  },
  {
    slug: 'top-150',
    title: 'Top 150',
    description: 'Comprehensive study plan covering every core interview pattern across top tech firms.',
    targetAudience: 'SDE-1 Candidates seeking complete mastery',
    recommendedDays: 45,
    badgeColor: 'violet',
  },
  {
    slug: 'blind-75',
    title: 'Blind 75',
    description: 'The iconic 75 questions designed to cover all major algorithmic patterns efficiently.',
    targetAudience: 'Fast-track revision for Big Tech interviews',
    recommendedDays: 21,
    badgeColor: 'amber',
  },
  {
    slug: 'neetcode-150',
    title: 'NeetCode 150',
    description: 'Expanded 150 problem roadmap with structured topic progression and pattern maps.',
    targetAudience: 'Methodical learners who want structured topic tracks',
    recommendedDays: 50,
    badgeColor: 'fuchsia',
  },
  {
    slug: 'placement-essentials',
    title: 'Placement Essentials',
    description: 'Curated high-frequency campus placement problems for TCS, Infosys, Wipro, Accenture, and product MNCs.',
    targetAudience: 'Final Year Placement Drives',
    recommendedDays: 30,
    badgeColor: 'cyan',
  },
  {
    slug: 'cp-basics',
    title: 'Competitive Programming Basics',
    description: 'Introduction to fast I/O, bitwise tricks, number theory, and speed problem solving.',
    targetAudience: 'Online Assessment (OA) Speed Optimization',
    recommendedDays: 20,
    badgeColor: 'rose',
  },
  {
    slug: 'company-specific',
    title: 'Company Specific',
    description: 'Targeted preparation paths tailored for Amazon, Google, Microsoft, Adobe, and Flipkart.',
    targetAudience: 'Candidates with scheduled company interviews',
    recommendedDays: 14,
    badgeColor: 'orange',
  },
];
