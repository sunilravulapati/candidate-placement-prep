// backend/src/features/resume/constants.ts
//
// Single source of truth for all resume-feature constants.
//
// DESIGN CONTRACT:
//   This file MUST have ZERO imports from any other file in this feature directory.
//   It may only import from Node.js built-ins or from external packages.
//   Violating this rule will create circular imports.
//
// All other modules in backend/src/features/resume/ import from here.
// The duplicate constant definitions in parser.ts, scoring.ts, bulletScorer.ts,
// and textCleaner.ts have been replaced with imports from this file.
//
// Pure module — no side effects, no I/O.

// ---------------------------------------------------------------------------
// Section Detection
// ---------------------------------------------------------------------------

/**
 * Core section heading keywords for substring-based detection.
 * Used by parser.ts for structural metadata extraction.
 * Detection is substring-based (lowercase) for maximum flexibility.
 */
export const SECTION_KEYWORDS: ReadonlyArray<string> = [
  'education',
  'skills',
  'technical skills',
  'projects',
  'experience',
  'work experience',
  'certifications',
  'achievements',
  'publications',
  'summary',
  'objective',
  'awards',
  'volunteer',
  'languages',
  'interests',
];

/**
 * Extended section indicator map for the upload validation pipeline.
 * Maps section names to arrays of keyword synonyms (all lowercase).
 * Used by uploadValidator.ts to determine resume authenticity.
 *
 * Scoring weights:
 *   Education, Experience, Skills, Projects → 2 points each
 *   Summary → 1 point
 *   Email, Phone, Links → 1 point each (handled separately as contact signals)
 */
export const SECTION_INDICATORS: Readonly<Record<string, ReadonlyArray<string>>> = {
  Education: [
    'education',
    'academic background',
    'academic history',
    'university',
    'college',
    'degree',
    'bachelor',
    'master',
  ],
  Experience: [
    'experience',
    'work experience',
    'professional experience',
    'employment history',
    'work history',
  ],
  Skills: [
    'skills',
    'technical skills',
    'core competencies',
    'technologies',
  ],
  Projects: [
    'projects',
    'personal projects',
    'academic projects',
    'open source',
  ],
  Summary: [
    'summary',
    'professional summary',
    'objective',
    'about me',
  ],
};

/**
 * The 6 canonical section headings used by scoring.ts structureScore().
 * Each match contributes equally to the structural score band.
 */
export const STRUCTURAL_SECTIONS: ReadonlyArray<string> = [
  'education',
  'skills',
  'projects',
  'experience',
  'certifications',
  'achievements',
];

// ---------------------------------------------------------------------------
// Skill Dictionaries
// ---------------------------------------------------------------------------

/**
 * Curated technology skill dictionary (70+ entries).
 * Used by parser.ts for skill extraction from raw resume text.
 *
 * Word-boundary matching ensures "node" does not match "nodejs" unexpectedly.
 * Keep entries lowercase. Escape special regex characters where needed
 * (e.g. "c\\+\\+" for C++). The display form strips the escapes.
 */
export const SKILL_DICTIONARY: ReadonlyArray<string> = [
  // Languages
  'python', 'java', 'c\\+\\+', 'c#', 'javascript', 'typescript',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r',
  // Frontend
  'react', 'nextjs', 'vue', 'angular', 'svelte', 'tailwindcss',
  'html', 'css', 'redux', 'webpack',
  // Backend
  'node', 'express', 'fastapi', 'flask', 'django', 'spring',
  'nestjs', 'graphql', 'rest', 'grpc',
  // Databases
  'mongodb', 'mysql', 'postgresql', 'redis', 'sqlite',
  'elasticsearch', 'cassandra', 'dynamodb', 'firebase',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
  'ansible', 'jenkins', 'ci/cd', 'linux',
  // Data & ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch',
  'scikit-learn', 'pandas', 'numpy', 'spark', 'kafka',
  // Tools
  'git', 'jira', 'figma', 'postman',
];

/**
 * The 16 canonical technology skills used by scoring.ts skillAlignmentScore().
 * Deliberately kept at a manageable size — more skills dilute the score.
 */
export const CANONICAL_SKILLS: ReadonlyArray<string> = [
  'python',
  'java',
  'c\\+\\+', // regex-escaped for word boundary matching
  'javascript',
  'react',
  'node',
  'mongodb',
  'aws',
  'docker',
  'fastapi',
  'sql',
  'nextjs',
  'tailwindcss',
  'kafka',
  'azure',
  'go',
];

// ---------------------------------------------------------------------------
// Action Verbs
// ---------------------------------------------------------------------------

/**
 * Strong past-tense action verbs expected in impactful resume bullets.
 * Used by parser.ts for action verb extraction metadata.
 */
export const ACTION_VERB_LIST: ReadonlyArray<string> = [
  'built', 'designed', 'developed', 'implemented', 'optimized',
  'reduced', 'increased', 'led', 'architected', 'deployed',
  'automated', 'migrated', 'refactored', 'scaled', 'integrated',
  'launched', 'delivered', 'improved', 'created', 'engineered',
  'researched', 'published', 'mentored', 'collaborated',
];

/**
 * Strong past-tense action verbs used for bullet scoring.
 * Stored as a Set for O(1) lookup in bulletScorer.ts scoreBullet().
 * Starting with one of these adds +5 to the bullet score.
 */
export const STRONG_ACTION_VERBS: ReadonlySet<string> = new Set([
  'built', 'designed', 'developed', 'implemented', 'optimized', 'architected',
  'reduced', 'increased', 'spearheaded', 'automated', 'migrated', 'refactored',
  'scaled', 'integrated', 'launched', 'created', 'engineered', 'streamlined',
  'delivered', 'orchestrated', 'modernized',
]);

// ---------------------------------------------------------------------------
// Technical Keywords
// ---------------------------------------------------------------------------

/**
 * Keywords indicating technical complexity and architecture depth.
 * Used by bulletScorer.ts — each match contributes +3 to the bullet score.
 */
export const TECH_COMPLEXITY_KEYWORDS: ReadonlyArray<string> = [
  'architect', 'design', 'scalable', 'scalability', 'microservice', 'distributed',
  'concurrency', 'multithread', 'query optimization', 'indexing', 'auth', 'jwt',
  'oauth', 'redis', 'kafka', 'rabbitmq', 'aws', 'gcp', 'azure', 'docker',
  'kubernetes', 'pipeline', 'ci/cd', 'caching', 'database', 'schema', 'api', 'grpc',
  'graphql', 'load balancing', 'serverless', 'event-driven', 'migration', 'async',
];

/**
 * Technology keywords for the preservation score calculation in trimmer.ts.
 * Checks how many technology keywords survived after trimming.
 * Contributes 30% of the total preservation score.
 */
export const PRESERVATION_TECH_KEYWORDS: ReadonlyArray<string> = [
  'react', 'vue', 'angular', 'tailwind', 'css', 'html', 'typescript', 'javascript',
  'python', 'java', 'spring', 'c++', 'golang', 'node', 'express', 'sql', 'postgresql',
  'mongodb', 'redis', 'kafka', 'rabbitmq', 'aws', 'gcp', 'azure', 'docker',
  'kubernetes', 'ci/cd', 'microservice', 'distributed', 'auth', 'jwt',
];

// ---------------------------------------------------------------------------
// Role-Aware Keyword Boosts
// ---------------------------------------------------------------------------

/**
 * Role-aware frontend keywords for bulletScorer.ts.
 * Each match contributes +5 when role === 'frontend'.
 */
export const FRONTEND_KEYWORDS: ReadonlyArray<string> = [
  'react', 'vue', 'angular', 'tailwind', 'css', 'html', 'ui', 'ux', 'responsive',
  'typescript', 'frontend', 'client', 'browser', 'accessibility', 'wcag', 'redux',
  'component', 'dom', 'webpack', 'vite', 'lighthouse', 'nextjs', 'sass',
];

/**
 * Role-aware backend keywords for bulletScorer.ts.
 * Each match contributes +5 when role === 'backend'.
 */
export const BACKEND_KEYWORDS: ReadonlyArray<string> = [
  'api', 'rest', 'graphql', 'grpc', 'auth', 'jwt', 'oauth', 'sql', 'postgresql',
  'mysql', 'mongodb', 'redis', 'kafka', 'backend', 'server', 'docker', 'kubernetes',
  'microservice', 'queue', 'scaling', 'latency', 'node', 'express', 'go', 'java', 'spring',
];

/**
 * Role-aware AI/ML keywords for bulletScorer.ts.
 * Each match contributes +5 when role === 'ai'.
 */
export const AI_KEYWORDS: ReadonlyArray<string> = [
  'ml', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'pytorch',
  'tensorflow', 'data engineering', 'model', 'training', 'pipeline', 'analytics',
  'spark', 'pandas', 'numpy', 'dataset', 'scikit-learn', 'scikit', 'llm', 'bert',
  'gpt', 'cnn', 'rnn', 'huggingface', 'fine-tuning', 'inference',
];

// ---------------------------------------------------------------------------
// Metric & Filler Patterns
// ---------------------------------------------------------------------------

/**
 * Regex for detecting quantified metrics inside a resume bullet.
 * Matches percentage values, dollar amounts, and numeric outcome words.
 *
 * Shared across:
 *   - bulletScorer.ts (metric presence scoring)
 *   - trimmer.ts (preservation score: metric survival)
 *   - exportPipeline.ts (JD keyword extraction)
 *
 * Non-capturing group used intentionally — only the full match matters.
 */
export const METRIC_REGEX =
  /\b\d+(?:\.\d+)?%|\$\d+|\b\d+\s*(?:K|M|B|users?|requests?|clients?|customers?|ms|seconds?|latency|reduction|increase|growth|improvement|transactions?|downloads?)\b/i;

/**
 * Regex patterns for weak/bureaucratic filler phrases commonly found in
 * LLM-generated or unpolished resume bullets.
 *
 * These are removed (not replaced) so that the remaining content forms
 * a stronger, more direct statement.
 *
 * Shared across:
 *   - textCleaner.ts (cleanBulletVerbosity)
 *   - bulletScorer.ts (penalty scoring: each match subtracts 8 points)
 *
 * ⚠️  Each RegExp uses the /g flag. Consumers MUST reset `lastIndex = 0`
 *     before and after calling `.test()` to avoid stateful matching bugs.
 */
export const FILLER_PHRASES: RegExp[] = [
  /\b(?:successfully )?responsible for\b/gi,
  /\btasked with(?: the responsibility to)?\b/gi,
  /\bin order to\b/gi,
  /\bsuccessfully managed to\b/gi,
  /\bwas responsible for\b/gi,
  /\bproven ability to\b/gi,
  /\bdemonstrated success in\b/gi,
  /\bplayed a key role in\b/gi,
  /\bduties included\b/gi,
  /\bworked on\b/gi,
  /\bhelped to\b/gi,
  /\bresponsible for the development of\b/gi,
  /\bcollaborated with team to\b/gi,
  /\bin order to ensure\b/gi,
  /\butilizing\b/gi,
  /\bassisted in\b/gi,
  /\bparticipated in\b/gi,
];

// ---------------------------------------------------------------------------
// Resume Structural Limits
// ---------------------------------------------------------------------------

/**
 * Hard limits for resume section sizes.
 * Enforced by resumeValidator.ts::validateResumeData() and exportPipeline.ts::enforceLimits().
 *
 * These limits ensure the resume fits on a single page when rendered.
 * Source: resume-ai-backend/utils/validateResumeData.js::LIMITS
 */
export const RESUME_LIMITS = {
  /** Maximum characters allowed in the summary section. */
  MAX_SUMMARY_CHARS: 400,
  /** Maximum number of work experience entries. */
  MAX_EXPERIENCES: 5,
  /** Maximum number of project entries. */
  MAX_PROJECTS: 4,
  /** Maximum bullet points per experience entry. */
  MAX_BULLETS_PER_EXP: 3,
  /** Maximum bullet points per project entry. */
  MAX_BULLETS_PER_PROJECT: 3,
  /** Maximum number of skill category rows. */
  MAX_SKILL_ROWS: 8,
  /** Maximum number of education entries. */
  MAX_EDUCATION: 2,
  /** Maximum number of award entries. */
  MAX_AWARDS: 4,
  /** Maximum number of certification entries. */
  MAX_CERTIFICATIONS: 3,
  /** Maximum number of DSA profile/stat lines. */
  MAX_DSA_LINES: 3,
  /** Maximum number of extracurricular entries. */
  MAX_EXTRACURRICULAR: 2,
  /** Maximum bullet points per extracurricular entry. */
  MAX_EXTRA_BULLETS: 2,
  /** Maximum words per bullet point (trimmer hard cap). */
  MAX_BULLET_WORDS: 30,
} as const;

export type ResumeLimits = typeof RESUME_LIMITS;

// ---------------------------------------------------------------------------
// Normalizer Patterns
// ---------------------------------------------------------------------------

/**
 * Regex that identifies companies in the experience array that should actually
 * be classified as personal/academic projects and rescued into the projects array.
 *
 * Used by normalizer.ts to separate real work history from personal project
 * entries that an AI parser may have misclassified as experience.
 */
export const PERSONAL_PROJECT_MARKERS =
  /^(personal project|side project|academic project|self project|open[- ]?source|hobby project)$/i;

/**
 * Maximum word count for a single bullet point (trimmer hard cap).
 * Bullets exceeding this length are truncated by trimmer.ts.
 *
 * Kept as a standalone export so trimmer.ts can import it individually
 * without pulling in the full RESUME_LIMITS object.
 */
export const MAX_BULLET_WORDS = RESUME_LIMITS.MAX_BULLET_WORDS;
