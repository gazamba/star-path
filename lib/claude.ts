import Anthropic from '@anthropic-ai/sdk';

export interface AnalysisResult {
    applicationContext: {
        type: string;
        framework?: string;
        description: string;
    };
    steps: Array<{
        description: string;
        action: string;
        element: string;
        expectedResult?: string;
    }>;
    edgeCases: string[];
    potentialIssues: string[];
}

/**
 * Analyzes video frames using Claude Vision API
 * @param frames - Array of base64-encoded image strings
 * @returns Structured analysis of the user flow
 */
export async function analyzeVideoFrames(frames: string[]): Promise<AnalysisResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    const anthropic = new Anthropic({
        apiKey,
    });

    // Prepare image content for Claude with indices
    const imageAndTextContent = frames.flatMap((frame, index) => [
        {
            type: 'text' as const,
            text: `[Snapshot ${index + 1} of ${frames.length}]`
        },
        {
            type: 'image' as const,
            source: {
                type: 'base64' as const,
                media_type: 'image/jpeg' as const,
                data: frame,
            },
        }
    ]);

    const prompt = `You are an expert user flow analyst. You are looking at a sequence of 30 screenshots from a video demonstration. 

CRITICAL: The video may contain multiple distinct sections (e.g., a Login page followed by a Dashboard). You MUST identify when a major transition occurs and document the actions in the new section carefully.

Your task is to:

1. **Identify the Full Application Context:**
   - What application is this? Describe all visible parts (Login, Dashboard, Menus, etc.).
   - Identify the framework if possible.
   - Describe the main purpose and all visible features (e.g., "Task Management", "User Profile", "Settings").

2. **Map the Sequential User Flow:**
   - Process the screenshots in order from start to finish.
   - For EACH significant change, describe the action:
     - What was clicked/typed?
     - What section of the screen was the user in?
     - What changed? (e.g., "Form submitted, Dashboard appeared", "Task checked in the list").
   - DO NOT skip the end of the video. Often the most important actions happen after the initial setup.

3. **Identify Edge Cases & Issues:**
   - Based on the ENTIRE flow, identify what needs testing.
   - Look for form validations, list interactions, toggle states, and empty states.
   - Note any accessibility or UI consistency concerns.

Please provide your analysis in the following JSON format:

{
  "applicationContext": {
    "type": "web application | mobile app | desktop app",
    "framework": "React | Vue | etc. (or null)",
    "description": "Comprehensive description covering all visible sections"
  },
  "steps": [
    {
      "description": "Clear description of the interaction",
      "action": "click | type | navigate | toggle | assert",
      "element": "Specific UI element (e.g., 'Task checkbox', 'Add Task button', 'Login input')",
      "expectedResult": "Immediate feedback or screen change"
    }
  ],
  "edgeCases": ["Specific edge cases for all discovered features"],
  "potentialIssues": ["Issues for both the login and the dashboard/main UI"]
}

Be thorough. If you see a Dashboard with a task list, make sure to include those interactions in your 'steps' array.`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: [
                        ...imageAndTextContent,
                        {
                            type: 'text',
                            text: prompt,
                        },
                    ],
                },
            ],
        });

        // Extract the text content from Claude's response
        const textContent = response.content.find((block) => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text content in Claude response');
        }

        // Parse the JSON response
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not extract JSON from Claude response');
        }

        const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);

        return analysis;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Claude API error: ${error.message}`);
        }
        throw error;
    }
}
