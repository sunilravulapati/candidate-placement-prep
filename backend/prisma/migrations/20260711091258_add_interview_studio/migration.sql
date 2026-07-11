-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_documentId_fkey";

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "canonicalJson" JSONB,
ADD COLUMN     "generationMetadata" JSONB,
ALTER COLUMN "documentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "JobDescriptionAnalysis" (
    "id" TEXT NOT NULL,
    "jobDescriptionId" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "responsibilities" TEXT[],
    "requiredSkills" TEXT[],
    "preferredSkills" TEXT[],
    "experience" TEXT,
    "education" TEXT,
    "technologies" TEXT[],
    "softSkills" TEXT[],
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobDescriptionAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TailoringSession" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobDescriptionId" TEXT NOT NULL,
    "generatedResumeId" TEXT,
    "matchScore" INTEGER NOT NULL,
    "atsScore" INTEGER NOT NULL,
    "keywordCoverage" INTEGER NOT NULL,
    "matchDetails" JSONB,
    "missingSkills" JSONB NOT NULL,
    "matchingSkills" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TailoringSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewPersona" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "avatarUrl" TEXT,
    "questioningStyle" TEXT NOT NULL,
    "strictness" INTEGER NOT NULL DEFAULT 5,
    "followUpDepth" INTEGER NOT NULL DEFAULT 2,
    "communicationTone" TEXT NOT NULL,
    "evaluationStyle" TEXT NOT NULL,
    "systemPromptHint" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewTemplate" (
    "id" TEXT NOT NULL,
    "personaId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "topics" TEXT[],
    "companyStyle" TEXT,
    "description" TEXT,
    "followUpDepth" INTEGER NOT NULL DEFAULT 2,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "personaId" TEXT,
    "resumeId" TEXT,
    "jobDescriptionId" TEXT,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "targetCompany" TEXT,
    "targetRole" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "topics" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'English',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "planJson" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "expectedSkills" TEXT[],
    "estimatedTimeSec" INTEGER NOT NULL,
    "followUpAllowed" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "parentQuestionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewEvaluation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "technicalAccuracy" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "problemSolving" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "structure" INTEGER NOT NULL,
    "examples" INTEGER NOT NULL,
    "completeness" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "aiFeedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewFeedback" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "missedConcepts" TEXT[],
    "suggestedImprovements" TEXT[],
    "topicsToRevise" TEXT[],
    "recommendedDSAProblems" TEXT[],
    "resumeChanges" TEXT[],
    "overallSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewScore" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "technicalAccuracy" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "problemSolving" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "structure" INTEGER NOT NULL,
    "examples" INTEGER NOT NULL,
    "completeness" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "percentile" INTEGER,
    "improvementTrend" TEXT,
    "confidenceTrend" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobDescriptionAnalysis_jobDescriptionId_key" ON "JobDescriptionAnalysis"("jobDescriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewEvaluation_questionId_key" ON "InterviewEvaluation"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewFeedback_sessionId_key" ON "InterviewFeedback"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewScore_sessionId_key" ON "InterviewScore"("sessionId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescriptionAnalysis" ADD CONSTRAINT "JobDescriptionAnalysis_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoringSession" ADD CONSTRAINT "TailoringSession_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoringSession" ADD CONSTRAINT "TailoringSession_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewTemplate" ADD CONSTRAINT "InterviewTemplate_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "InterviewPersona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InterviewTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "InterviewPersona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewMessage" ADD CONSTRAINT "InterviewMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewMessage" ADD CONSTRAINT "InterviewMessage_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewScore" ADD CONSTRAINT "InterviewScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
