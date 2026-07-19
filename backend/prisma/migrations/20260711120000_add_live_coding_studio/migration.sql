-- Live Coding Studio v2.3 tables

CREATE TABLE "CodingProblem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "constraints" TEXT[],
    "examples" JSONB NOT NULL,
    "starterCode" JSONB NOT NULL,
    "boilerplates" JSONB,
    "editorial" TEXT,
    "hints" TEXT[],
    "expectedApproach" TEXT,
    "timeComplexity" TEXT,
    "spaceComplexity" TEXT,
    "estimatedTime" INTEGER NOT NULL,
    "acceptanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "frequency" INTEGER NOT NULL DEFAULT 0,
    "followUpQuestions" TEXT[],
    "relatedProblems" TEXT[],
    "sampleTests" JSONB NOT NULL,
    "hiddenTests" JSONB NOT NULL,
    "languages" TEXT[] DEFAULT ARRAY['javascript', 'python', 'java', 'cpp']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CodingProblem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CodingProblem_slug_key" ON "CodingProblem"("slug");

CREATE TABLE "CodingTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "CodingTopic_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CodingTopic_name_key" ON "CodingTopic"("name");
CREATE UNIQUE INDEX "CodingTopic_slug_key" ON "CodingTopic"("slug");

CREATE TABLE "CodingCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "CodingCompany_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CodingCompany_name_key" ON "CodingCompany"("name");
CREATE UNIQUE INDEX "CodingCompany_slug_key" ON "CodingCompany"("slug");

CREATE TABLE "CodingTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "CodingTag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CodingTag_name_key" ON "CodingTag"("name");
CREATE UNIQUE INDEX "CodingTag_slug_key" ON "CodingTag"("slug");

CREATE TABLE "CodingLearningPath" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "CodingLearningPath_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CodingLearningPath_slug_key" ON "CodingLearningPath"("slug");

CREATE TABLE "_CodingProblemToCodingTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CodingProblemToCodingTopic_AB_unique" ON "_CodingProblemToCodingTopic"("A", "B");
CREATE INDEX "_CodingProblemToCodingTopic_B_index" ON "_CodingProblemToCodingTopic"("B");

CREATE TABLE "_CodingCompanyToCodingProblem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CodingCompanyToCodingProblem_AB_unique" ON "_CodingCompanyToCodingProblem"("A", "B");
CREATE INDEX "_CodingCompanyToCodingProblem_B_index" ON "_CodingCompanyToCodingProblem"("B");

CREATE TABLE "_CodingProblemToCodingTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CodingProblemToCodingTag_AB_unique" ON "_CodingProblemToCodingTag"("A", "B");
CREATE INDEX "_CodingProblemToCodingTag_B_index" ON "_CodingProblemToCodingTag"("B");

CREATE TABLE "_CodingLearningPathToCodingProblem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CodingLearningPathToCodingProblem_AB_unique" ON "_CodingLearningPathToCodingProblem"("A", "B");
CREATE INDEX "_CodingLearningPathToCodingProblem_B_index" ON "_CodingLearningPathToCodingProblem"("B");

CREATE TABLE "CodingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "code" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "CodingSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodingSubmission" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeSnapshot" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "executionTimeMs" INTEGER,
    "memoryBytes" INTEGER,
    "passedCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "percentile" DOUBLE PRECISION,
    "basicReview" JSONB,
    "detailedReview" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodingSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodingExecution" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "testCaseIndex" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "executionTimeMs" INTEGER,
    "memoryBytes" INTEGER,
    "stdout" TEXT,
    "stderr" TEXT,
    CONSTRAINT "CodingExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodeSnapshot" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodeSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "easySolved" INTEGER NOT NULL DEFAULT 0,
    "mediumSolved" INTEGER NOT NULL DEFAULT 0,
    "hardSolved" INTEGER NOT NULL DEFAULT 0,
    "totalAttempted" INTEGER NOT NULL DEFAULT 0,
    "acceptanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastSolvedAt" TIMESTAMP(3),
    CONSTRAINT "CodingProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CodingProgress_userId_key" ON "CodingProgress"("userId");

CREATE TABLE "CodingBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodingBookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CodingBookmark_userId_problemId_key" ON "CodingBookmark"("userId", "problemId");

CREATE TABLE "CodingNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CodingNote_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "_CodingProblemToCodingTopic" ADD CONSTRAINT "_CodingProblemToCodingTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "CodingProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CodingProblemToCodingTopic" ADD CONSTRAINT "_CodingProblemToCodingTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "CodingTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_CodingCompanyToCodingProblem" ADD CONSTRAINT "_CodingCompanyToCodingProblem_A_fkey" FOREIGN KEY ("A") REFERENCES "CodingCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CodingCompanyToCodingProblem" ADD CONSTRAINT "_CodingCompanyToCodingProblem_B_fkey" FOREIGN KEY ("B") REFERENCES "CodingProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_CodingProblemToCodingTag" ADD CONSTRAINT "_CodingProblemToCodingTag_A_fkey" FOREIGN KEY ("A") REFERENCES "CodingProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CodingProblemToCodingTag" ADD CONSTRAINT "_CodingProblemToCodingTag_B_fkey" FOREIGN KEY ("B") REFERENCES "CodingTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_CodingLearningPathToCodingProblem" ADD CONSTRAINT "_CodingLearningPathToCodingProblem_A_fkey" FOREIGN KEY ("A") REFERENCES "CodingLearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CodingLearningPathToCodingProblem" ADD CONSTRAINT "_CodingLearningPathToCodingProblem_B_fkey" FOREIGN KEY ("B") REFERENCES "CodingProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CodingSession" ADD CONSTRAINT "CodingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodingSession" ADD CONSTRAINT "CodingSession_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "CodingProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CodingSubmission" ADD CONSTRAINT "CodingSubmission_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CodingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CodingExecution" ADD CONSTRAINT "CodingExecution_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CodingSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CodeSnapshot" ADD CONSTRAINT "CodeSnapshot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CodingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CodingProgress" ADD CONSTRAINT "CodingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CodingBookmark" ADD CONSTRAINT "CodingBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodingBookmark" ADD CONSTRAINT "CodingBookmark_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "CodingProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CodingNote" ADD CONSTRAINT "CodingNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodingNote" ADD CONSTRAINT "CodingNote_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "CodingProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
