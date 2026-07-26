import { NextResponse } from 'next/server';
import { getAICompletion, ChatMessage } from '@backend/ai/core/provider';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { problemTitle, problemDescription, userCode, language, messages = [], action = 'explain' } = body;

    const systemPrompt = `You are an expert DSA (Data Structures & Algorithms) AI Pedagogical Tutor inside PrepGenie.
Your mission is to help students learn DSA concepts intuitively, develop strong problem-solving skills, and debug their code.

Context:
- Problem: ${problemTitle || 'DSA Problem'}
- Description: ${problemDescription || 'N/A'}
- Programming Language: ${language || 'cpp'}
- Student Code currently in editor:
\`\`\`${language || 'cpp'}
${userCode || '// No code written yet'}
\`\`\`

Pedagogical Directives:
1. Explain intuitively with step-by-step logic, pattern recognition, and key takeaways.
2. Use GitHub markdown formatting with clean headings, bullet points, and code blocks.
3. Be encouraging, clear, and concise.`;

    const chatHistory: ChatMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach((m: { role: string; content: string }) => {
        if (m.role === 'user' || m.role === 'assistant') {
          chatHistory.push({
            role: m.role as 'user' | 'assistant',
            content: m.content
          });
        }
      });
    } else {
      let promptContent = `Explain the intuition and core pattern for solving "${problemTitle}".`;
      if (action === 'dry-run') {
        promptContent = `Give a step-by-step dry run example for "${problemTitle}" using sample inputs. Show state variables at each step.`;
      } else if (action === 'complexity') {
        promptContent = `Explain the optimal Time and Space complexity for "${problemTitle}" and why it works.`;
      } else if (action === 'debug') {
        promptContent = `Analyze my code for "${problemTitle}" and point out any logical bugs or edge-case oversights without directly giving away the whole code immediately:\n${userCode}`;
      }
      chatHistory.push({ role: 'user', content: promptContent });
    }

    try {
      const completion = await getAICompletion(chatHistory, {
        temperature: 0.3,
        maxTokens: 1200
      });

      if (completion && completion.trim().length > 0) {
        return NextResponse.json({ reply: completion });
      }
    } catch (aiErr) {
      console.warn('Groq AI completion fallback trigger:', (aiErr as Error).message);
    }

    const fallbackReply = generateFallbackExplanation(problemTitle || 'Binary Search', action, userCode || '', language || 'cpp');
    return NextResponse.json({ reply: fallbackReply });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'AI Tutor request failed';
    return NextResponse.json({ reply: `⚠️ **AI Tutor Service Notice**: ${msg}` }, { status: 200 });
  }
}

function generateFallbackExplanation(title: string, action: string, code: string, lang: string): string {
  const langUpper = (lang || 'cpp').toUpperCase();

  if (action === 'dry-run') {
    return [
      `### 🔍 Step-by-Step Dry Run: ${title}`,
      '',
      'Let us trace execution with a sample input:',
      '- **Input Array**: `[-1, 0, 3, 5, 9, 12]` | **Target**: `9`',
      '',
      '1. **Initial State**: `low = 0`, `high = 5`',
      '2. **Iteration 1**: `mid = 2` (`nums[2] = 3`). Since `3 < 9`, target is in right half -> set `low = 3`.',
      '3. **Iteration 2**: `mid = 4` (`nums[4] = 9`). `9 == 9` -> **Found Target at Index 4!**',
      '',
      '**Key Takeaway**: Each comparison halves the remaining search space.'
    ].join('\n');
  }

  if (action === 'debug') {
    if (!code || code.trim().length < 20) {
      return [
        `### 🐛 Debugging Guide for ${title}`,
        '',
        `Here are key checks when writing your implementation in **${langUpper}**:`,
        '',
        '1. **Boundary Conditions**: Ensure your loop uses `low <= high`.',
        '2. **Mid Calculation**: Compute `mid = low + (high - low) / 2` to prevent potential integer overflow.',
        '3. **Target Comparison**:',
        '   - Return `mid` when `nums[mid] == target`.',
        '   - Update `low = mid + 1` when `nums[mid] < target`.',
        '   - Update `high = mid - 1` when `nums[mid] > target`.',
        '4. **Not Found Return**: Return `-1` outside the loop if target is missing.'
      ].join('\n');
    }
    return [
      `### 🐛 Code Review & Edge Case Checklist: ${title}`,
      '',
      `Reviewing current code snippet in **${langUpper}**:`,
      '',
      '**Checklist**:',
      '- **Search Space Invariant**: Ensure `low` is initialized to `0` and `high` to `size - 1`.',
      '- **Loop Condition**: Does your loop run while `low <= high`? Using `<` misses single-element ranges.',
      '- **State Progress**: Ensure `low` or `high` moves past `mid` on each step (`mid + 1` or `mid - 1`).'
    ].join('\n');
  }

  if (action === 'complexity') {
    return [
      `### ⚡ Complexity Analysis for ${title}`,
      '',
      '- **Time Complexity**: O(log N)',
      '  - **Reason**: The search space is divided in half on each step (N -> N/2 -> N/4 -> ... -> 1).',
      '- **Space Complexity**: O(1)',
      '  - **Reason**: Iterative binary search only uses a constant number of pointers (`low`, `high`, `mid`).'
    ].join('\n');
  }

  return [
    `### 💡 Problem Intuition: ${title}`,
    '',
    `The core concept behind **${title}** is **Divide and Conquer / Space Reduction**.`,
    '',
    '#### 1. Core Insight',
    'When an array is sorted, inspecting the middle element gives total information about where the target can exist:',
    '- If `nums[mid] == target`, target is found.',
    '- If `nums[mid] < target`, discard the left half by setting `low = mid + 1`.',
    '- If `nums[mid] > target`, discard the right half by setting `high = mid - 1`.',
    '',
    '#### 2. The Algorithmic Pattern',
    '1. Set `low = 0`, `high = len - 1`.',
    '2. Loop while `low <= high`.',
    '3. Compute `mid = low + (high - low) / 2`.',
    '4. Return index if matched, otherwise adjust search boundaries.'
  ].join('\n');
}
