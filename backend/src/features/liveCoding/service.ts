import { CodingSubmissionRepository, CodingProblemRepository } from './repository';
// import { openai } from '../../core/ai'; // Assuming this exists or similar

export class LiveCodingService {
  /**
   * Run code (Basic review only)
   */
  static async runCode(userId: string, problemSlug: string, code: string, language: string) {
    // 1. Fetch problem
    const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
    if (!problem) throw new Error('Problem not found');

    // 2. Generate basic run results (mocked for now as per requirements)
    const passedCount = 2;
    const totalCount = 2; // Assuming 2 sample test cases
    const executionTimeMs = Math.floor(Math.random() * 50) + 10;
    const memoryBytes = Math.floor(Math.random() * 1024 * 1024 * 5) + 20 * 1024 * 1024;
    const isAccepted = passedCount === totalCount;
    
    // Simulate time and space complexity extraction using some fast heuristic/AI
    const basicReview = {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      summary: "Your solution passes the basic test cases.",
      isAccepted
    };

    return {
      status: isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER',
      passedCount,
      totalCount,
      executionTimeMs,
      memoryBytes,
      basicReview,
    };
  }

  /**
   * Submit Code (Full Review)
   */
  static async submitCode(userId: string, problemSlug: string, code: string, language: string) {
    const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
    if (!problem) throw new Error('Problem not found');

    const sampleTests = (problem.sampleTests as any[]) || [];
    const hiddenTests = (problem.hiddenTests as any[]) || [];
    const totalCount = sampleTests.length + hiddenTests.length || 10;
    // Mock passing tests
    const passedCount = totalCount;
    
    const executionTimeMs = Math.floor(Math.random() * 50) + 10;
    const memoryBytes = Math.floor(Math.random() * 1024 * 1024 * 5) + 20 * 1024 * 1024;
    
    const basicReview = {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      summary: "Your solution passes all test cases.",
      isAccepted: true
    };

    // Save to DB
    // Assuming there's a coding session for this user and problem
    // For now we'll mock sessionId
    const submission = await CodingSubmissionRepository.createSubmission({
      sessionId: `session_${userId}_${problem.id}`,
      userId,
      codeSnapshot: code,
      language,
      status: 'ACCEPTED',
      executionTimeMs,
      memoryBytes,
      passedCount,
      totalCount,
      basicReview,
      detailedReview: null // null initially to save tokens, only generate if requested
    });

    return submission;
  }

  /**
   * Generate detailed AI review for a submission
   */
  static async getDetailedAIReview(submissionId: string) {
    // 1. Fetch submission from DB
    // 2. Check if detailedReview is already present (Caching)
    // if (submission.detailedReview) return submission.detailedReview;

    // 3. Generate detailed AI review using LLM
    const detailedReview = {
      correctnessReview: "Your implementation successfully handles the core logic and all edge cases.",
      edgeCasesMissed: ["Empty input array", "Very large numbers"],
      alternativeSolution: "You could optimize space complexity to O(1) by using two pointers instead of a hash map.",
      optimizationSuggestions: ["Use a while loop instead of recursion to avoid stack overflow."],
      interviewerFeedback: "Good communication of trade-offs. The code is clean, but pay attention to variable naming.",
      codeStyleReview: "Excellent use of descriptive variables. Consider early returns for edge cases.",
      companyReadiness: {
        "Google": 85,
        "Amazon": 90,
        "Meta": 88,
        "Microsoft": 92
      },
      overallRating: 4.5
    };

    // 4. Save back to DB
    // await CodingSubmissionRepository.updateDetailedReview(submissionId, detailedReview);

    return detailedReview;
  }
}
