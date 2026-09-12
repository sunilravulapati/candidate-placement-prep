import { NextResponse } from 'next/server';
import { RepositoryIndex } from '@backend/features/dsa/repositoryIndex';
import { APTITUDE_TOPICS_META } from '@backend/features/aptitude/repository';

export const dynamic = 'force-dynamic';

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  category: 'page' | 'dsa' | 'aptitude' | 'knowledge';
  href: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'violet' | 'indigo' | 'slate';
  tags?: string[];
}

const APP_PAGES: SearchResultItem[] = [
  {
    id: 'page-dashboard',
    title: 'Dashboard',
    description: 'Overview of your preparation progress, daily streak, and roadmap',
    category: 'page',
    href: '/dashboard',
    badge: 'Core',
    badgeColor: 'violet',
    tags: ['home', 'overview', 'stats', 'analytics'],
  },
  {
    id: 'page-dsa',
    title: 'DSA Studio & Practice',
    description: '174 curated competitive programming problems with multi-language execution',
    category: 'page',
    href: '/dsa',
    badge: '174 Problems',
    badgeColor: 'indigo',
    tags: ['algorithms', 'data structures', 'coding', 'leetcode'],
  },
  {
    id: 'page-dsa-oa',
    title: 'OA Essentials',
    description: 'Ranked pattern bank for campus & off-campus Online Assessments',
    category: 'page',
    href: '/dsa/oa-essentials',
    badge: 'High Yield',
    badgeColor: 'amber',
    tags: ['oa', 'amazon', 'google', 'uber', 'goldman sachs', 'assessment'],
  },
  {
    id: 'page-dsa-learning-paths',
    title: 'DSA Learning Paths',
    description: 'Structured roadmaps: Blind 75, NeetCode 150, Interview 75, OA Essentials',
    category: 'page',
    href: '/dsa/learning-paths',
    badge: 'Roadmaps',
    badgeColor: 'emerald',
    tags: ['tracks', 'beginner', 'interview', 'study plan'],
  },
  {
    id: 'page-dsa-library',
    title: 'DSA Question Library',
    description: 'Search and filter all problems by topic, difficulty, and company tags',
    category: 'page',
    href: '/dsa/library',
    badge: 'Library',
    badgeColor: 'slate',
    tags: ['filter', 'search', 'problems'],
  },
  {
    id: 'page-dsa-bookmarks',
    title: 'DSA Bookmarks',
    description: 'Review saved problems bookmarked for revision',
    category: 'page',
    href: '/dsa/bookmarks',
    badge: 'Saved',
    badgeColor: 'slate',
    tags: ['favorites', 'starred', 'revision'],
  },
  {
    id: 'page-aptitude',
    title: 'Aptitude Practice Studio',
    description: '1,500 questions across Quantitative, Logical Reasoning, and Verbal Ability',
    category: 'page',
    href: '/aptitude',
    badge: '1500 Qs',
    badgeColor: 'emerald',
    tags: ['quantitative', 'logical', 'verbal', 'tcs', 'infosys', 'accenture'],
  },
  {
    id: 'page-mock-interviews',
    title: 'Mock Interview Studio',
    description: 'Interactive AI-driven behavioral & technical mock interview sessions',
    category: 'page',
    href: '/mock-interviews',
    badge: 'AI Powered',
    badgeColor: 'violet',
    tags: ['interview', 'mock', 'voice', 'behavioral', 'ai'],
  },
  {
    id: 'page-resume-studio',
    title: 'Resume Studio',
    description: 'ATS resume analysis, keyword targeting, and version management',
    category: 'page',
    href: '/resume-studio',
    badge: 'ATS Score',
    badgeColor: 'amber',
    tags: ['resume', 'cv', 'tailoring', 'ats', 'bullet points'],
  },
  {
    id: 'page-resume-editor',
    title: 'Structured Resume Editor',
    description: 'Live structured JSON resume editor with real-time score preview',
    category: 'page',
    href: '/resume-editor',
    badge: 'Editor',
    badgeColor: 'indigo',
    tags: ['resume builder', 'editor', 'json'],
  },
  {
    id: 'page-knowledge-hub',
    title: 'Knowledge Hub',
    description: 'System design, operating systems, DBMS, networks, and flashcards',
    category: 'page',
    href: '/knowledge-hub',
    badge: 'Fundamentals',
    badgeColor: 'violet',
    tags: ['cs', 'system design', 'os', 'dbms', 'cn', 'flashcards'],
  },
  {
    id: 'page-company-prep',
    title: 'Company Prep Hub',
    description: 'Company-specific interview patterns, question archives, and hiring bars',
    category: 'page',
    href: '/company-prep',
    badge: 'Company Tracks',
    badgeColor: 'rose',
    tags: ['google', 'amazon', 'meta', 'microsoft', 'apple', 'uber'],
  },
  {
    id: 'page-analytics',
    title: 'Analytics & Insights',
    description: 'Deep performance breakdown, accuracy trends, and placement readiness score',
    category: 'page',
    href: '/analytics',
    badge: 'Insights',
    badgeColor: 'indigo',
    tags: ['performance', 'accuracy', 'progress', 'readiness'],
  },
];

const KNOWLEDGE_TOPICS: SearchResultItem[] = [
  {
    id: 'kh-os',
    title: 'Operating Systems Fundamentals',
    description: 'Processes, Threads, CPU Scheduling, Deadlocks, Virtual Memory & Paging',
    category: 'knowledge',
    href: '/knowledge-hub',
    badge: 'Core CS',
    badgeColor: 'indigo',
    tags: ['os', 'threads', 'deadlock', 'virtual memory', 'paging', 'mutex', 'semaphore'],
  },
  {
    id: 'kh-dbms',
    title: 'Database Management Systems (DBMS)',
    description: 'ACID Properties, Normalization (1NF-BCNF), Indexing (B-Tree/Hash), Transactions & Isolation Levels',
    category: 'knowledge',
    href: '/knowledge-hub',
    badge: 'Core CS',
    badgeColor: 'indigo',
    tags: ['sql', 'acid', 'indexing', 'b-tree', 'transactions', 'normalization', 'nosql'],
  },
  {
    id: 'kh-cn',
    title: 'Computer Networks',
    description: 'OSI 7 Layers, TCP vs UDP, Three-Way Handshake, DNS, HTTP/HTTPS, SSL/TLS',
    category: 'knowledge',
    href: '/knowledge-hub',
    badge: 'Core CS',
    badgeColor: 'indigo',
    tags: ['networking', 'tcp', 'udp', 'dns', 'http', 'https', 'handshake', 'osi'],
  },
  {
    id: 'kh-sys-design',
    title: 'System Design Architecture',
    description: 'Load Balancers, Caching (Redis/Memcached), Sharding, CAP Theorem, Microservices, Message Queues (Kafka)',
    category: 'knowledge',
    href: '/knowledge-hub',
    badge: 'System Design',
    badgeColor: 'violet',
    tags: ['system design', 'scalability', 'redis', 'kafka', 'load balancer', 'cap theorem', 'microservices'],
  },
  {
    id: 'kh-oop',
    title: 'Object-Oriented Programming (OOP & SOLID)',
    description: 'Encapsulation, Polymorphism, Inheritance, Abstraction, and SOLID Principles',
    category: 'knowledge',
    href: '/knowledge-hub',
    badge: 'Design',
    badgeColor: 'emerald',
    tags: ['oop', 'solid', 'design patterns', 'polymorphism', 'inheritance'],
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const categoryFilter = searchParams.get('category') || 'all'; // 'all' | 'dsa' | 'aptitude' | 'page' | 'knowledge'

  // If query is empty, return suggested quick links
  if (!q) {
    const suggested = [
      ...APP_PAGES.slice(0, 6),
      ...KNOWLEDGE_TOPICS.slice(0, 2),
    ];
    return NextResponse.json({
      query: '',
      total: suggested.length,
      results: suggested,
    });
  }

  const results: SearchResultItem[] = [];

  // 1. Search Pages
  if (categoryFilter === 'all' || categoryFilter === 'page') {
    for (const page of APP_PAGES) {
      const matchTitle = page.title.toLowerCase().includes(q);
      const matchDesc = page.description.toLowerCase().includes(q);
      const matchTag = page.tags?.some((t) => t.toLowerCase().includes(q));
      if (matchTitle || matchDesc || matchTag) {
        results.push(page);
      }
    }
  }

  // 2. Search DSA Problems
  if (categoryFilter === 'all' || categoryFilter === 'dsa') {
    try {
      const allProblems = RepositoryIndex.getAllProblems();
      for (const prob of allProblems) {
        const matchTitle = prob.title.toLowerCase().includes(q);
        const matchSlug = prob.slug.toLowerCase().includes(q);
        const matchTopic = (prob.topic || '').toLowerCase().includes(q) || (prob.primaryTopic || '').toLowerCase().includes(q);
        const matchPattern = (prob.pattern || '').toLowerCase().includes(q);
        const matchCompany = prob.companies?.some((c) => c.toLowerCase().includes(q));
        const matchDiff = (prob.difficulty || '').toLowerCase() === q;

        if (matchTitle || matchSlug || matchTopic || matchPattern || matchCompany || matchDiff) {
          const diffUpper = (prob.difficulty || 'MEDIUM').toUpperCase();
          const badgeColor: SearchResultItem['badgeColor'] =
            diffUpper === 'EASY' ? 'emerald' : diffUpper === 'HARD' ? 'rose' : 'amber';

          results.push({
            id: `dsa-${prob.slug}`,
            title: prob.title,
            description: `${prob.primaryTopic || prob.topic} • ${prob.pattern || 'Standard Pattern'} • ${(prob.companies || []).slice(0, 3).join(', ')}`,
            category: 'dsa',
            href: `/dsa/workspace/${prob.slug}`,
            badge: diffUpper,
            badgeColor,
            tags: [prob.topic, ...(prob.companies || [])],
          });
        }

        if (results.filter((r) => r.category === 'dsa').length >= 15) {
          break; // Cap problem results for responsiveness
        }
      }
    } catch (err) {
      console.error('Error querying DSA problems in search:', err);
    }
  }

  // 3. Search Aptitude Topics
  if (categoryFilter === 'all' || categoryFilter === 'aptitude') {
    for (const [cat, topics] of Object.entries(APTITUDE_TOPICS_META)) {
      for (const topic of topics) {
        const matchTitle = topic.name.toLowerCase().includes(q);
        const matchId = topic.id.toLowerCase().includes(q);
        const matchCat = cat.toLowerCase().includes(q);

        if (matchTitle || matchId || matchCat) {
          results.push({
            id: `apt-${cat}-${topic.id}`,
            title: topic.name,
            description: `${cat.toUpperCase()} Reasoning • Practice questions on ${topic.name}`,
            category: 'aptitude',
            href: `/aptitude?category=${cat}&topic=${topic.id}`,
            badge: cat.toUpperCase(),
            badgeColor: 'emerald',
            tags: [cat, topic.id],
          });
        }
      }
    }
  }

  // 4. Search Knowledge Hub Topics
  if (categoryFilter === 'all' || categoryFilter === 'knowledge') {
    for (const item of KNOWLEDGE_TOPICS) {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (matchTitle || matchDesc || matchTag) {
        results.push(item);
      }
    }
  }

  return NextResponse.json({
    query: q,
    total: results.length,
    results: results.slice(0, 25), // Cap total responses
  });
}
