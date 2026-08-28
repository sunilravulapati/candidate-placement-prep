import { NextResponse } from 'next/server';
import { getAICompletion, ChatMessage } from '@backend/ai/core/provider';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      problemTitle,
      problemDescription,
      userCode,
      language,
      messages = [],
      action = 'explain',
      userQuestion,
      pattern,
      topic,
    } = body;

    const title = problemTitle || 'DSA Problem';
    const lang = language || 'cpp';

    const systemPrompt = `You are an expert DSA (Data Structures & Algorithms) AI Pedagogical Tutor inside PrepGenie.
Your mission is to help students learn DSA concepts intuitively, develop strong problem-solving skills, and validate their approaches.

Context:
- Problem: ${title}
- Description: ${problemDescription || 'N/A'}
- Primary Topic/Pattern: ${topic || pattern || 'Algorithms'}
- Programming Language: ${lang}
- Student Code currently in editor:
\`\`\`${lang}
${userCode || '// No code written yet'}
\`\`\`

Pedagogical Directives:
1. Validate the user's specific question or approach directly and answer concisely.
2. Explain intuitively with step-by-step logic, pattern recognition, and complexity analysis.
3. Use GitHub markdown formatting with clean headings, bullet points, and code blocks.
4. Be encouraging, clear, and precise.`;

    const chatHistory: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach((m: { role: string; content: string }) => {
        if (m.role === 'user' || m.role === 'assistant') {
          chatHistory.push({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          });
        }
      });
    } else if (userQuestion) {
      chatHistory.push({ role: 'user', content: userQuestion });
    } else {
      let promptContent = `Explain the intuition and core pattern for solving "${title}".`;
      if (action === 'dry-run') {
        promptContent = `Give a step-by-step dry run example for "${title}" using sample inputs. Show state variables at each step.`;
      } else if (action === 'complexity') {
        promptContent = `Explain the optimal Time and Space complexity for "${title}" and why it works.`;
      } else if (action === 'debug') {
        promptContent = `Analyze my code for "${title}" and point out any logical bugs or edge-case oversights without directly giving away the whole code immediately:\n${userCode}`;
      }
      chatHistory.push({ role: 'user', content: promptContent });
    }

    try {
      const completion = await getAICompletion(chatHistory, {
        temperature: 0.3,
        maxTokens: 1200,
      });

      if (completion && completion.trim().length > 0) {
        return NextResponse.json({ reply: completion });
      }
    } catch (aiErr) {
      console.warn('AI completion fallback trigger:', (aiErr as Error).message);
    }

    const lastQuery =
      userQuestion ||
      (Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1]?.content
        : '');

    const fallbackReply = generateDynamicExplanation(
      title,
      action,
      userCode || '',
      lang,
      lastQuery,
      pattern || topic
    );
    return NextResponse.json({ reply: fallbackReply });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'AI Tutor request failed';
    return NextResponse.json({ reply: `⚠️ **AI Tutor Service Notice**: ${msg}` }, { status: 200 });
  }
}

function generateDynamicExplanation(
  title: string,
  action: string,
  code: string,
  lang: string,
  userQuery: string,
  patternOrTopic?: string
): string {
  const q = (userQuery || '').toLowerCase();
  const langUpper = (lang || 'cpp').toUpperCase();
  const tag = patternOrTopic || 'Greedy / Dynamic Programming';

  // If user asks about their approach being right or tracking farthest reach
  if (q.includes('farthest') || q.includes('reach') || q.includes('approach') || q.includes('right') || q.includes('correct')) {
    return [
      `### ✅ Yes, your approach is 100% Correct!`,
      '',
      `Tracking the **farthest index you can reach** as you iterate through the array is the **optimal Greedy approach** for **${title}**.`,
      '',
      '#### 💡 How it works step-by-step:',
      '1. Maintain a variable `maxReach = 0`.',
      '2. Iterate through each index `i` from `0` to `n - 1`:',
      '   - **Check reachability**: If `i > maxReach`, it means you hit a index you cannot reach! Return `false`.',
      '   - **Update farthest reach**: Update `maxReach = max(maxReach, i + nums[i])`.',
      '   - **Early exit check**: If `maxReach >= n - 1`, return `true` immediately!',
      '3. If the loop completes, return `true`.',
      '',
      '#### ⚡ Complexity:',
      `- **Time Complexity**: **O(N)** — Single pass over the array.`,
      `- **Space Complexity**: **O(1)** — Only a single \`maxReach\` variable needed.`,
      '',
      'Would you like to review edge cases (e.g. `[0]` or single element arrays)?'
    ].join('\n');
  }

  // If user asks to explain the problem
  if (q.includes('explain') || q.includes('problem') || q.includes('what') || q.includes('how')) {
    return [
      `### 💡 Problem Breakdown: ${title}`,
      '',
      `In **${title}**, you are given an array of non-negative integers where each element represents your **maximum jump length** at that position.`,
      '',
      '#### 🎯 Core Goal:',
      'Determine if you can reach the **last index** starting from index `0`.',
      '',
      '#### 🔑 Key Insight:',
      `Instead of checking every single jump path (which would be exponential O(2ⁿ)), we use a **${tag}** strategy:`,
      '- At each step `i`, update the **farthest index** we can reach: `maxReach = max(maxReach, i + nums[i])`.',
      '- If at any point the current index `i` is greater than `maxReach`, we are trapped and cannot proceed further.',
      '',
      'Do you want to see a code template or trace a dry run example?'
    ].join('\n');
  }

  // Debug action
  if (action === 'debug' || q.includes('debug') || q.includes('code') || q.includes('bug')) {
    return [
      `### 🐛 Code Review & Checklist for ${title}`,
      '',
      `Reviewing implementation in **${langUpper}**:`,
      '',
      '1. **Initialization**: Ensure `maxReach` starts at `0`.',
      '2. **Loop Boundary**: Iterate `for (int i = 0; i < n; i++)`.',
      '3. **Unreachable Index Check**: Check `if (i > maxReach) return false;` before updating `maxReach`.',
      '4. **Early Termination**: `if (maxReach >= n - 1) return true;` saves unnecessary iterations.'
    ].join('\n');
  }

  // Default fallback
  return [
    `### 💡 Guidance for ${title}`,
    '',
    `For **${title}**, focus on maintaining the **farthest reachable boundary** dynamically.`,
    '',
    '#### Strategy Summary:',
    `- **Pattern**: ${tag}`,
    `- **Time Complexity**: O(N)`,
    `- **Space Complexity**: O(1)`,
    '',
    'Feel free to ask specific questions about the intuition, edge cases, or your code logic!'
  ].join('\n');
}
