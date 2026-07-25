// backend/scripts/create-problem.ts

import fs from 'fs';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const parts = args[i].replace(/^--/, '').split('=');
      const key = parts[0];
      const val = parts[1] || (args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true');
      params[key] = val;
    }
  }
  return params;
}

export function createProblemCLI() {
  const params = parseArgs();

  const rawTitle = params.title || 'New DSA Problem';
  const slug = params.slug || rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const difficulty = (params.difficulty || 'MEDIUM').toUpperCase();
  const topic = params.topic || 'arrays';
  const company = params.company || 'Google';

  const dataDirCandidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  const dataDir = dataDirCandidates.find((c) => fs.existsSync(c)) || path.join(process.cwd(), 'backend', 'data');
  const problemFolder = path.join(dataDir, 'problems', slug);

  if (fs.existsSync(problemFolder)) {
    console.error(`✗ Problem folder already exists at: ${problemFolder}`);
    process.exit(1);
  }

  fs.mkdirSync(problemFolder, { recursive: true });

  const funcName = slug.replace(/-([a-z])/g, (_, g) => g.toUpperCase());

  // 1. problem.json
  const problemJson = {
    schemaVersion: 1,
    contentVersion: 1,
    metadataVersion: 1,
    lastReviewed: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0],
    author: 'PrepGenie Content Team',
    reviewStatus: 'draft',
    slug,
    title: rawTitle,
    difficulty,
    estimatedMinutes: 20,
    frequency: 70,
    acceptanceRate: 65,
    premium: false,
    topic,
    subtopic: '',
    tags: [topic],
    companies: [company],
    learningPaths: ['Placement Essentials'],
    description: `Given an input, return the expected result for ${rawTitle}.`,
    constraints: [
      '1 <= input.length <= 10^5',
      '-10^9 <= input[i] <= 10^9'
    ],
    examples: [
      {
        input: 'nums = [1, 2, 3]',
        output: '6',
        explanation: 'Example explanation for sample case 1.'
      }
    ],
    hints: [
      'Analyze the problem constraints and edge cases.',
      'Think about optimal data structures and time complexity.'
    ],
    starterMetadata: {
      functionName: funcName,
      className: 'Solution',
      returnType: 'int',
      parameters: [{ name: 'nums', type: 'array<int>' }],
      problemType: 'FUNCTION'
    },
    executionMetadata: {
      problemType: 'FUNCTION',
      inputType: ['array<int>'],
      outputType: 'int',
      comparator: 'EXACT',
      timeLimit: 2,
      memoryLimit: 256,
      expectedComplexity: {
        time: 'O(N)',
        space: 'O(1)'
      },
      comparatorOptions: {
        ignoreTrailingSpaces: true,
        ignoreNewLines: true
      }
    },
    driverMetadata: {
      driver: 'DEFAULT',
      inputSerializers: ['ARRAY_INT'],
      outputSerializer: 'INT'
    },
    relationships: {
      prerequisites: [],
      followUps: [],
      variants: [],
      related: [topic],
      learningPathPrevious: null,
      learningPathNext: null
    },
    solutionMetadata: {
      optimalComplexity: {
        time: 'O(N)',
        space: 'O(1)'
      },
      alternativeApproaches: [],
      patterns: [topic],
      commonMistakes: ['Boundary handling'],
      edgeCases: ['Empty input', 'Single element input'],
      interviewNotes: []
    }
  };

  // 2. tests.json
  const testsJson = [
    {
      id: 'sample-1',
      classification: 'sample',
      input: '[1, 2, 3]',
      expectedOutput: '6',
      explanation: 'Sample test case 1'
    },
    {
      id: 'edge-1',
      classification: 'edge',
      input: '[]',
      expectedOutput: '0',
      explanation: 'Empty input edge case'
    },
    {
      id: 'corner-1',
      classification: 'corner',
      input: '[0]',
      expectedOutput: '0',
      explanation: 'Single element zero corner case'
    },
    {
      id: 'hidden-1',
      classification: 'hidden',
      input: '[5, 10, 15]',
      expectedOutput: '30'
    },
    {
      id: 'hidden-2',
      classification: 'hidden',
      input: '[100, 200]',
      expectedOutput: '300'
    },
    {
      id: 'stress-1',
      classification: 'stress',
      input: '[1000, 2000, 3000]',
      expectedOutput: '6000'
    }
  ];

  // 3. editorial.md
  const editorialMd = `# ${rawTitle} — Editorial

## Intuition
Analyze state transitions and optimal sub-structures.

## Approach
Use standard algorithmic patterns for ${topic}.

### Complexity Analysis
- **Time Complexity:** O(N)
- **Space Complexity:** O(1)
`;

  // 4. hints.md
  const hintsMd = `Analyze input constraints and boundary cases.
---
Consider using appropriate data structures for optimal lookup times.
---
Optimize operations to achieve O(N) time complexity.`;

  // 5. solutions/reference.ts
  const solutionsDir = path.join(problemFolder, 'solutions');
  fs.mkdirSync(solutionsDir, { recursive: true });
  const referenceTs = `// Trusted Reference Implementation for ${rawTitle}
export function ${funcName}(nums: number[]): number {
  return nums.reduce((acc, curr) => acc + curr, 0);
}
`;

  fs.writeFileSync(path.join(problemFolder, 'problem.json'), JSON.stringify(problemJson, null, 2), 'utf-8');
  fs.writeFileSync(path.join(problemFolder, 'tests.json'), JSON.stringify(testsJson, null, 2), 'utf-8');
  fs.writeFileSync(path.join(problemFolder, 'editorial.md'), editorialMd, 'utf-8');
  fs.writeFileSync(path.join(problemFolder, 'hints.md'), hintsMd, 'utf-8');
  fs.writeFileSync(path.join(solutionsDir, 'reference.ts'), referenceTs, 'utf-8');

  console.log('─────────────────────────────────────────────────────────────');
  console.log(`✓ Successfully scaffolded problem: ${rawTitle} (${slug})`);
  console.log(`📁 Location: ${problemFolder}`);
  console.log('  - problem.json');
  console.log('  - tests.json');
  console.log('  - editorial.md');
  console.log('  - hints.md');
  console.log('  - solutions/reference.ts');
  console.log('─────────────────────────────────────────────────────────────');
}

if (require.main === module) {
  createProblemCLI();
}
