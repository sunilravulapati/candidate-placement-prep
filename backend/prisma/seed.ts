// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import path from 'path';
import { ProblemLoader } from '../src/features/dsa/problemLoader';
import { StarterCodeGenerator } from '../src/features/dsa/starterCodeGenerator';

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

  // ─────────────────────────────────────────────────────────────────────────
  // Live Coding Studio — Fast Parallel Batch Seeding (162 problems)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('Seeding Live Coding problems from backend/data/problems...');

  const problems = ProblemLoader.loadAllDirectoryProblems();
  console.log(`Loaded ${problems.length} problems from directory.`);

  // First upsert all unique topics, companies, tags
  const allTopicNames = new Set<string>();
  const allCompanyNames = new Set<string>();
  const allTagNames = new Set<string>();

  for (const p of problems) {
    const rawTopics = Array.isArray(p.topic) ? p.topic : [p.topic || 'miscellaneous'];
    rawTopics.forEach((t) => allTopicNames.add(t));
    (p.companies || []).forEach((c) => allCompanyNames.add(c));
    (p.tags || []).forEach((tg) => allTagNames.add(tg));
  }

  // First upsert all unique topics, companies, tags safely
  const topicMap = new Map<string, string>();
  for (const tName of allTopicNames) {
    const slug = tName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const existing = await prisma.codingTopic.findFirst({
        where: { OR: [{ slug }, { name: tName }] },
      });
      if (existing) {
        topicMap.set(tName, existing.id);
      } else {
        const t = await prisma.codingTopic.create({ data: { name: tName, slug } });
        topicMap.set(tName, t.id);
      }
    } catch (err) {
      const found = await prisma.codingTopic.findFirst({ where: { slug } });
      if (found) topicMap.set(tName, found.id);
    }
  }

  const companyMap = new Map<string, string>();
  for (const cName of allCompanyNames) {
    const slug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const existing = await prisma.codingCompany.findFirst({
        where: { OR: [{ slug }, { name: cName }] },
      });
      if (existing) {
        companyMap.set(cName, existing.id);
      } else {
        const c = await prisma.codingCompany.create({ data: { name: cName, slug } });
        companyMap.set(cName, c.id);
      }
    } catch (err) {
      const found = await prisma.codingCompany.findFirst({ where: { slug } });
      if (found) companyMap.set(cName, found.id);
    }
  }

  const tagMap = new Map<string, string>();
  for (const tgName of allTagNames) {
    const slug = tgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const existing = await prisma.codingTag.findFirst({
        where: { OR: [{ slug }, { name: tgName }] },
      });
      if (existing) {
        tagMap.set(tgName, existing.id);
      } else {
        const tg = await prisma.codingTag.create({ data: { name: tgName, slug } });
        tagMap.set(tgName, tg.id);
      }
    } catch (err) {
      const found = await prisma.codingTag.findFirst({ where: { slug } });
      if (found) tagMap.set(tgName, found.id);
    }
  }

  let seededCount = 0;
  for (const p of problems) {
    try {
      const rawTopics = Array.isArray(p.topic) ? p.topic : [p.topic || 'miscellaneous'];
      const topicIds = rawTopics.map((t) => topicMap.get(t)).filter(Boolean) as string[];
      const companyIds = (p.companies || []).map((c) => companyMap.get(c)).filter(Boolean) as string[];
      const tagIds = (p.tags || []).map((tg) => tagMap.get(tg)).filter(Boolean) as string[];

      const starterCodeMap = p.starterMetadata
        ? StarterCodeGenerator.generateAll(p.starterMetadata)
        : (p as any).starterCode || {};

      const sampleTests = p.visibleTests || p.tests || [];
      const hiddenTests = p.hiddenTests || [];

      await prisma.codingProblem.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          difficulty: p.difficulty,
          description: p.description,
          constraints: p.constraints ?? [],
          examples: (p.examples ?? []) as any,
          starterCode: starterCodeMap as any,
          editorial: p.editorial ?? null,
          hints: p.hints ?? [],
          expectedApproach: p.solutionMetadata?.explanation ?? null,
          timeComplexity: p.executionMetadata?.expectedComplexity?.time ?? null,
          spaceComplexity: p.executionMetadata?.expectedComplexity?.space ?? null,
          estimatedTime: p.estimatedMinutes ?? 15,
          acceptanceRate: p.acceptanceRate ?? 50,
          frequency: p.frequency ?? 70,
          sampleTests: sampleTests as any,
          hiddenTests: hiddenTests as any,
          topics: {
            set: [],
            connect: topicIds.map((id) => ({ id })),
          },
          companies: {
            set: [],
            connect: companyIds.map((id) => ({ id })),
          },
          tags: {
            set: [],
            connect: tagIds.map((id) => ({ id })),
          },
        },
        create: {
          slug: p.slug,
          title: p.title,
          difficulty: p.difficulty,
          description: p.description,
          constraints: p.constraints ?? [],
          examples: (p.examples ?? []) as any,
          starterCode: starterCodeMap as any,
          editorial: p.editorial ?? null,
          hints: p.hints ?? [],
          expectedApproach: p.solutionMetadata?.explanation ?? null,
          timeComplexity: p.executionMetadata?.expectedComplexity?.time ?? null,
          spaceComplexity: p.executionMetadata?.expectedComplexity?.space ?? null,
          estimatedTime: p.estimatedMinutes ?? 15,
          acceptanceRate: p.acceptanceRate ?? 50,
          frequency: p.frequency ?? 70,
          sampleTests: sampleTests as any,
          hiddenTests: hiddenTests as any,
          topics: {
            connect: topicIds.map((id) => ({ id })),
          },
          companies: {
            connect: companyIds.map((id) => ({ id })),
          },
          tags: {
            connect: tagIds.map((id) => ({ id })),
          },
        },
      });
      seededCount++;
    } catch (err: any) {
      console.error(`Failed to seed problem ${p.slug}:`, err.message);
    }
  }

  console.log(`✓ Fast-seeded ${seededCount} of ${problems.length} Live Coding problems into database.`);

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
