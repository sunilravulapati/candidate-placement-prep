// backend/src/features/company/companyRepository.ts

import { CompanyProfile } from './companyTypes';

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    slug: 'amazon',
    name: 'Amazon',
    tier: 'TIER_1_PRODUCT',
    overallDifficulty: 'HARD',
    tagline: 'Customer Obsession & Leadership Principles driven SDE recruitment.',
    overview: 'Amazon’s hiring process strongly emphasizes Data Structures, Algorithms, and the 16 Leadership Principles. Online assessments typically test two medium/hard DSA questions followed by work simulation style questions.',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Assessment (OA)', type: 'OA', description: '2 DSA coding questions + Work Style Simulation.', durationMinutes: 90, focusAreas: ['Arrays', 'Trees', 'Graphs', 'String'] },
      { roundNumber: 2, name: 'Technical Interview 1', type: 'TECHNICAL_DSA', description: 'DSA problem solving + 2 Leadership Principles.', durationMinutes: 60, focusAreas: ['Trees', 'DP', 'LP Stories'] },
      { roundNumber: 3, name: 'Technical Interview 2', type: 'TECHNICAL_DSA', description: 'Complex DSA / System Design + Leadership Principles.', durationMinutes: 60, focusAreas: ['Graphs', 'Heaps', 'Design'] },
      { roundNumber: 4, name: 'Bar Raiser Interview', type: 'BEHAVIORAL_HR', description: 'Rigorous behavioral interview + DSA depth probing.', durationMinutes: 60, focusAreas: ['Leadership Principles', 'Edge Cases'] }
    ],
    oaPattern: { platform: 'HackerRank', durationMinutes: 90, dsaQuestionCount: 2, aptitudeQuestionCount: 0, sqlQuestionCount: 0, cutoffEstimatePercent: 85 },
    difficultyDistribution: { easyPercent: 15, mediumPercent: 60, hardPercent: 25 },
    topTopics: {
      dsa: ['trees', 'graphs', 'dynamic-programming', 'arrays', 'sliding-window'],
      aptitude: ['quantitative', 'logical'],
      csFundamentals: ['oops', 'dbms', 'os']
    },
    behavioralQuestions: [
      'Tell me about a time you had to make a decision without full data.',
      'Give an example of a tough feedback you received and how you handled it.',
      'Describe a situation where you went above and beyond for a customer.'
    ],
    resumeTips: [
      'Highlight STAR-formatted bullet points with quantifiable metric impacts.',
      'Demonstrate ownership and customer impact in project descriptions.'
    ],
    recentExperiences: [
      { candidateRole: 'SDE-1', verdict: 'SELECTED', summary: 'OA asked Subtree of Another Tree & Sliding Window. Bar Raiser focused heavily on Leadership Principles.', keyTakeaway: 'Prepare 2 solid STAR stories per Leadership Principle.', year: 2025 }
    ],
    checklist: [
      'Solve Amazon Top 50 DSA questions',
      'Prepare 14 STAR stories matching LP criteria',
      'Practice writing clean code on whiteboard or plain editor'
    ]
  },
  {
    slug: 'microsoft',
    name: 'Microsoft',
    tier: 'TIER_1_PRODUCT',
    overallDifficulty: 'HARD',
    tagline: 'Growth mindset, clean production code, and core algorithms.',
    overview: 'Microsoft focuses heavily on clear communication, production-grade clean code, edge-case testing, and classical DSA (Linked Lists, Trees, Strings, Matrix).',
    hiringProcess: [
      { roundNumber: 1, name: 'Codility OA', type: 'OA', description: '3 algorithmic problems on Codility platform.', durationMinutes: 90, focusAreas: ['Strings', 'Arrays', 'Matrix'] },
      { roundNumber: 2, name: 'Tech Round 1', type: 'TECHNICAL_DSA', description: 'Coding & CS Fundamentals (OS/DBMS).', durationMinutes: 60, focusAreas: ['Linked Lists', 'Trees', 'OS'] },
      { roundNumber: 3, name: 'Tech Round 2', type: 'TECHNICAL_DSA', description: 'Complex Problem Solving & Design.', durationMinutes: 60, focusAreas: ['DP', 'Graphs', 'OOPS'] },
      { roundNumber: 4, name: 'AA Round (Asymmetry Candidate Review)', type: 'BEHAVIORAL_HR', description: 'Cultural fit, projects, and high-level problem solving.', durationMinutes: 60, focusAreas: ['Projects', 'Growth Mindset'] }
    ],
    oaPattern: { platform: 'Codility', durationMinutes: 90, dsaQuestionCount: 3, aptitudeQuestionCount: 0, sqlQuestionCount: 0, cutoffEstimatePercent: 80 },
    difficultyDistribution: { easyPercent: 20, mediumPercent: 65, hardPercent: 15 },
    topTopics: {
      dsa: ['linked-list', 'strings', 'binary-search', 'trees', 'matrix'],
      aptitude: ['logical', 'verbal'],
      csFundamentals: ['os', 'dbms', 'cn']
    },
    behavioralQuestions: [
      'Why Microsoft?',
      'Tell me about a technical conflict with a teammate and how you resolved it.'
    ],
    resumeTips: [
      'Emphasize experience with C++, C#, Java, or Python.',
      'Show clear understanding of computer science fundamentals.'
    ],
    recentExperiences: [
      { candidateRole: 'Software Engineer', verdict: 'SELECTED', summary: 'Questions around Reverse Linked List II and LRU Cache design.', keyTakeaway: 'Focus on writing modular code with proper variable naming.', year: 2025 }
    ],
    checklist: [
      'Master Linked List and Tree pointer manipulations',
      'Revise OS multithreading and memory management',
      'Solve Microsoft Top 40 tagged questions'
    ]
  },
  {
    slug: 'google',
    name: 'Google',
    tier: 'TIER_1_PRODUCT',
    overallDifficulty: 'VERY_HARD',
    tagline: 'Algorithmic brilliance, time complexity perfection, and Googliness.',
    overview: 'Google evaluation centers on algorithmic optimization, mathematical insight, graph theory, and dynamic programming with strict time complexity analysis.',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Assessment', type: 'OA', description: '2 tricky algorithmic problems.', durationMinutes: 90, focusAreas: ['Advanced DP', 'Graphs'] },
      { roundNumber: 2, name: 'Technical Round 1', type: 'TECHNICAL_DSA', description: 'Algorithmic coding on Google Docs / CoderPad.', durationMinutes: 45, focusAreas: ['Trees', 'Graphs'] },
      { roundNumber: 3, name: 'Technical Round 2', type: 'TECHNICAL_DSA', description: 'Advanced problem solving & follow-ups.', durationMinutes: 45, focusAreas: ['DP', 'Segment Tree'] },
      { roundNumber: 4, name: 'Googliness & Leadership', type: 'BEHAVIORAL_HR', description: 'Ethical judgment, inclusivity, and collaboration.', durationMinutes: 45, focusAreas: ['Googliness'] }
    ],
    oaPattern: { platform: 'Google Internal / CodeSignal', durationMinutes: 90, dsaQuestionCount: 2, aptitudeQuestionCount: 0, sqlQuestionCount: 0, cutoffEstimatePercent: 90 },
    difficultyDistribution: { easyPercent: 5, mediumPercent: 45, hardPercent: 50 },
    topTopics: {
      dsa: ['graphs', 'dynamic-programming', 'topological-sort', 'trees', 'heap-priority-queue'],
      aptitude: ['quantitative', 'logical'],
      csFundamentals: ['os', 'cn']
    },
    behavioralQuestions: [
      'Describe a project where you took initiative beyond your assignment.',
      'How do you ensure code quality when working on a tight deadline?'
    ],
    resumeTips: [
      'Showcase open source contributions, competitive programming ranks, or complex projects.',
      'Be precise about your individual contributions.'
    ],
    recentExperiences: [
      { candidateRole: 'L3 Software Engineer', verdict: 'SELECTED', summary: 'Graph shortest path variant with capacity constraints. Interrogated on space complexity trade-offs.', keyTakeaway: 'Always talk through your thought process before writing code.', year: 2025 }
    ],
    checklist: [
      'Master Graph algorithms (Dijkstra, Topological Sort, Union-Find)',
      'Practice dry-running code without an IDE',
      'Solve Google Top 50 DSA problems'
    ]
  },
  {
    slug: 'adobe',
    name: 'Adobe',
    tier: 'TIER_1_PRODUCT',
    overallDifficulty: 'MEDIUM',
    tagline: 'Data structures, C++ fundamentals, and image/document processing concepts.',
    overview: 'Adobe focuses on clean algorithms, strings, trees, and core C++/Java memory management concepts.',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Test', type: 'OA', description: 'DSA + Aptitude MCQs + CS Fundamentals.', durationMinutes: 90, focusAreas: ['Arrays', 'MCQs', 'OOPS'] },
      { roundNumber: 2, name: 'Tech Round 1', type: 'TECHNICAL_DSA', description: 'DSA & Coding.', durationMinutes: 60, focusAreas: ['Trees', 'Strings'] },
      { roundNumber: 3, name: 'Tech Round 2', type: 'TECHNICAL_DSA', description: 'Advanced DSA & OOPS Design.', durationMinutes: 60, focusAreas: ['DP', 'Design'] }
    ],
    oaPattern: { platform: 'HackerEarth', durationMinutes: 90, dsaQuestionCount: 2, aptitudeQuestionCount: 15, sqlQuestionCount: 0, cutoffEstimatePercent: 75 },
    difficultyDistribution: { easyPercent: 30, mediumPercent: 55, hardPercent: 15 },
    topTopics: {
      dsa: ['arrays', 'strings', 'trees', 'hashing'],
      aptitude: ['quantitative', 'logical', 'verbal'],
      csFundamentals: ['oops', 'dbms', 'os']
    },
    behavioralQuestions: ['Tell me about a challenging bug you fixed.'],
    resumeTips: ['Highlight OOP design patterns and performance optimization projects.'],
    recentExperiences: [{ candidateRole: 'Member of Technical Staff', verdict: 'SELECTED', summary: 'Medium tree questions and virtual destructor concepts in C++.', keyTakeaway: 'Revise C++ pointers and OOP concepts thoroughly.', year: 2025 }],
    checklist: ['Revise OOPS & C++ virtual functions', 'Solve Adobe Top 30 questions']
  },
  {
    slug: 'flipkart',
    name: 'Flipkart',
    tier: 'TIER_1_PRODUCT',
    overallDifficulty: 'HARD',
    tagline: 'Machine Coding round + High Performance Algorithms.',
    overview: 'Flipkart features a famous Machine Coding round where candidates must design and code a working object-oriented system in 90 minutes.',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Assessment', type: 'OA', description: '3 DSA questions.', durationMinutes: 90, focusAreas: ['Arrays', 'DP'] },
      { roundNumber: 2, name: 'Machine Coding Round', type: 'TECHNICAL_DSA', description: 'Object Oriented System Design & Execution.', durationMinutes: 90, focusAreas: ['Low Level Design', 'OOPS'] },
      { roundNumber: 3, name: 'Problem Solving & Data Structures', type: 'TECHNICAL_DSA', description: 'Algorithmic DSA round.', durationMinutes: 60, focusAreas: ['Trees', 'Graphs'] }
    ],
    oaPattern: { platform: 'Unstop / HackerRank', durationMinutes: 90, dsaQuestionCount: 3, aptitudeQuestionCount: 0, sqlQuestionCount: 0, cutoffEstimatePercent: 80 },
    difficultyDistribution: { easyPercent: 15, mediumPercent: 60, hardPercent: 25 },
    topTopics: {
      dsa: ['arrays', 'trees', 'dynamic-programming', 'design'],
      aptitude: ['logical'],
      csFundamentals: ['oops', 'dbms']
    },
    behavioralQuestions: ['How do you handle scope changes mid-project?'],
    resumeTips: ['Demonstrate clean code architecture and LLD patterns.'],
    recentExperiences: [{ candidateRole: 'SDE-1', verdict: 'SELECTED', summary: 'Machine coding round was to implement a Parking Lot system.', keyTakeaway: 'Practice LLD clean code templates before the interview.', year: 2025 }],
    checklist: ['Practice Machine Coding (Parking Lot, Food Delivery, Snake & Ladder)', 'Solve Flipkart Top DSA questions']
  },
  {
    slug: 'cisco',
    name: 'Cisco',
    tier: 'TIER_2_PRODUCT',
    overallDifficulty: 'MEDIUM',
    tagline: 'Networking fundamentals, Bit manipulation, and DSA.',
    overview: 'Cisco evaluates Computer Networks (TCP/IP, OSI model, IP addressing), C/C++ memory layout, and standard DSA questions.',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Test', type: 'OA', description: 'Aptitude + CS Fundamentals + Coding.', durationMinutes: 90, focusAreas: ['CN', 'Bit Manipulation', 'DSA'] },
      { roundNumber: 2, name: 'Technical Round', type: 'TECHNICAL_DSA', description: 'Networking & DSA Coding.', durationMinutes: 60, focusAreas: ['CN', 'Strings', 'Pointers'] }
    ],
    oaPattern: { platform: 'HackerRank', durationMinutes: 90, dsaQuestionCount: 2, aptitudeQuestionCount: 20, sqlQuestionCount: 0, cutoffEstimatePercent: 75 },
    difficultyDistribution: { easyPercent: 35, mediumPercent: 55, hardPercent: 10 },
    topTopics: {
      dsa: ['bit-manipulation', 'strings', 'arrays', 'linked-list'],
      aptitude: ['quantitative', 'logical'],
      csFundamentals: ['cn', 'os', 'c_cpp']
    },
    behavioralQuestions: ['Why Cisco? Describe your interest in networking.'],
    resumeTips: ['Highlight projects involving networking protocols, sockets, or C/C++.'],
    recentExperiences: [{ candidateRole: 'Software Engineer', verdict: 'SELECTED', summary: 'Heavy focus on IP subnetting and Bitwise OR operations.', keyTakeaway: 'Revise Computer Networks thoroughly.', year: 2025 }],
    checklist: ['Master OSI Model & Subnetting', 'Practice Bitwise Manipulation DSA problems']
  },
  {
    slug: 'servicenow',
    name: 'ServiceNow',
    tier: 'TIER_1_PRODUCT',
    overallDifficulty: 'MEDIUM',
    tagline: 'Platform architecture, Data Structures, and JavaScript/Java mastery.',
    overview: 'ServiceNow evaluates DSA (Arrays, Strings, Trees, Searching) alongside JavaScript/Java fundamentals and SQL queries.',
    hiringProcess: [
      { roundNumber: 1, name: 'Online Assessment', type: 'OA', description: '2 DSA questions + Aptitude.', durationMinutes: 90, focusAreas: ['Arrays', 'Strings'] },
      { roundNumber: 2, name: 'Tech Round 1', type: 'TECHNICAL_DSA', description: 'DSA & JS/Java concepts.', durationMinutes: 60, focusAreas: ['Trees', 'SQL'] }
    ],
    oaPattern: { platform: 'HackerRank', durationMinutes: 90, dsaQuestionCount: 2, aptitudeQuestionCount: 10, sqlQuestionCount: 2, cutoffEstimatePercent: 80 },
    difficultyDistribution: { easyPercent: 30, mediumPercent: 60, hardPercent: 10 },
    topTopics: {
      dsa: ['arrays', 'strings', 'binary-search', 'trees'],
      aptitude: ['logical', 'quantitative'],
      csFundamentals: ['sql', 'dbms', 'oops']
    },
    behavioralQuestions: ['Describe a team project where you led technical implementation.'],
    resumeTips: ['Showcase full-stack or backend platform experience.'],
    recentExperiences: [{ candidateRole: 'Associate Software Engineer', verdict: 'SELECTED', summary: 'Questions on Binary Search in rotated array and SQL joins.', keyTakeaway: 'Brush up on complex SQL queries.', year: 2025 }],
    checklist: ['Practice SQL GROUP BY and JOIN queries', 'Solve ServiceNow top tagged DSA questions']
  },
  {
    slug: 'jpmc',
    name: 'JPMorgan Chase (JPMC)',
    tier: 'FINTECH_GLOBAL',
    overallDifficulty: 'MEDIUM',
    tagline: 'Code For Good hackathon + DSA and Financial tech orientation.',
    overview: 'JPMC hires heavily through its "Code For Good" hackathon and campus hiring drives involving OA + 2 tech rounds testing DSA, SQL, and OOP.',
    hiringProcess: [
      { roundNumber: 1, name: 'HackerRank OA', type: 'OA', description: '2 Coding Questions.', durationMinutes: 60, focusAreas: ['Arrays', 'Strings'] },
      { roundNumber: 2, name: 'Code For Good Hackathon / Interview', type: 'TECHNICAL_DSA', description: 'Team coding + Technical interview.', durationMinutes: 120, focusAreas: ['Web/Mobile', 'DSA', 'SQL'] }
    ],
    oaPattern: { platform: 'HackerRank', durationMinutes: 60, dsaQuestionCount: 2, aptitudeQuestionCount: 0, sqlQuestionCount: 0, cutoffEstimatePercent: 80 },
    difficultyDistribution: { easyPercent: 30, mediumPercent: 60, hardPercent: 10 },
    topTopics: {
      dsa: ['arrays', 'strings', 'hashing', 'two-pointers'],
      aptitude: ['quantitative', 'logical'],
      csFundamentals: ['sql', 'oops', 'dbms']
    },
    behavioralQuestions: ['How do you prioritize tasks when working in a hackathon environment?'],
    resumeTips: ['Highlight full stack project builds and teamwork achievements.'],
    recentExperiences: [{ candidateRole: 'Software Engineer Analyst', verdict: 'SELECTED', summary: 'Easy to medium array problems in OA. Hackathon focused on usability and clean backend.', keyTakeaway: 'Be an active team communicator during hackathon rounds.', year: 2025 }],
    checklist: ['Solve HackerRank JPMC coding questions', 'Revise basic web architecture & SQL']
  },
  {
    slug: 'tcs',
    name: 'TCS (NQT / Digital / Prime)',
    tier: 'SERVICE_LEADER',
    overallDifficulty: 'EASY',
    tagline: 'India’s largest employer hiring through TCS NQT (Ninja / Digital / Prime tracks).',
    overview: 'TCS NQT measures Quantitative Aptitude, Logical Reasoning, Verbal Ability, CS Fundamentals, and 2 basic/medium coding problems.',
    hiringProcess: [
      { roundNumber: 1, name: 'TCS NQT Online Exam', type: 'OA', description: 'Foundation Aptitude + Advanced Aptitude + 2 Coding Problems.', durationMinutes: 165, focusAreas: ['Quant', 'Logical', 'Verbal', 'Basic DSA'] },
      { roundNumber: 2, name: 'TR + MR + HR Interview', type: 'TECHNICAL_DSA', description: 'Technical, Managerial & HR combined interview.', durationMinutes: 45, focusAreas: ['Projects', 'C/Java/Python', 'DBMS'] }
    ],
    oaPattern: { platform: 'TCS iON', durationMinutes: 165, dsaQuestionCount: 2, aptitudeQuestionCount: 60, sqlQuestionCount: 0, cutoffEstimatePercent: 65 },
    difficultyDistribution: { easyPercent: 60, mediumPercent: 35, hardPercent: 5 },
    topTopics: {
      dsa: ['arrays', 'strings', 'math', 'recursion'],
      aptitude: ['quantitative', 'logical', 'verbal'],
      csFundamentals: ['dbms', 'oops', 'c_cpp']
    },
    behavioralQuestions: ['Are you willing to relocate to any TCS location in India?'],
    resumeTips: ['Ensure clear details on your final year project and basic programming proficiency.'],
    recentExperiences: [{ candidateRole: 'Digital Developer', verdict: 'SELECTED', summary: 'NQT Aptitude section required fast calculation. Coding questions were string reversal and array frequency count.', keyTakeaway: 'Speed in aptitude is crucial.', year: 2025 }],
    checklist: ['Practice TCS NQT Aptitude mock tests', 'Master array & string manipulation in C++/Java/Python']
  },
  {
    slug: 'infosys',
    name: 'Infosys (InfyTQ / HackWithInfy)',
    tier: 'SERVICE_LEADER',
    overallDifficulty: 'MEDIUM',
    tagline: 'Systems Engineer, Specialist Programmer (SP), and Digital Specialist Engineer (DSE).',
    overview: 'Infosys selects candidates via InfyTQ certification exam and HackWithInfy coding competition for SP and DSE roles.',
    hiringProcess: [
      { roundNumber: 1, name: 'HackWithInfy / InfyTQ Exam', type: 'OA', description: 'Aptitude + Python/Java MCQs + 3 Coding Questions.', durationMinutes: 180, focusAreas: ['DP', 'Greedy', 'Aptitude'] },
      { roundNumber: 2, name: 'Technical Interview', type: 'TECHNICAL_DSA', description: 'Coding review, DBMS, and OOP concepts.', durationMinutes: 45, focusAreas: ['SQL', 'DSA', 'OOP'] }
    ],
    oaPattern: { platform: 'Infosys Platform / HackerEarth', durationMinutes: 180, dsaQuestionCount: 3, aptitudeQuestionCount: 20, sqlQuestionCount: 0, cutoffEstimatePercent: 70 },
    difficultyDistribution: { easyPercent: 40, mediumPercent: 50, hardPercent: 10 },
    topTopics: {
      dsa: ['arrays', 'dynamic-programming', 'greedy', 'strings'],
      aptitude: ['quantitative', 'logical'],
      csFundamentals: ['sql', 'python', 'java', 'dbms']
    },
    behavioralQuestions: ['Describe your role in your major project.'],
    resumeTips: ['Mention InfyTQ certificate score if completed.'],
    recentExperiences: [{ candidateRole: 'Specialist Programmer', verdict: 'SELECTED', summary: 'HackWithInfy Round 1 had 3 questions: 1 Array, 1 DP, 1 Greedy.', keyTakeaway: 'Focus on Dynamic Programming for SP role.', year: 2025 }],
    checklist: ['Practice HackWithInfy previous year coding papers', 'Revise DBMS normalization & SQL queries']
  }
];

export class CompanyRepository {
  public static getAllProfiles(): CompanyProfile[] {
    return COMPANY_PROFILES;
  }

  public static getBySlug(slug: string): CompanyProfile | undefined {
    return COMPANY_PROFILES.find((c) => c.slug === slug.toLowerCase());
  }
}
