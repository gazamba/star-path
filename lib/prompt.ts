import { Step } from "./steps";
import { AnalysisResult } from "./claude";

type PromptInput = {
    framework: string;
    testRunner: string;
    steps: Step[];
    context?: AnalysisResult;
};

export function generatePrompt({
    framework,
    testRunner,
    steps,
    context,
}: PromptInput): string {
    const stepLines = steps
        .map((s, i) => `${i + 1}. ${s.type.toUpperCase()}: ${s.value}`)
        .join("\n");

    // Build application context section
    const appContextSection = context ? `
Application Context:
- Type: ${context.applicationContext.type}
${context.applicationContext.framework ? `- Framework: ${context.applicationContext.framework}` : ''}
- Description: ${context.applicationContext.description}
` : '';

    // Build edge cases section
    const edgeCasesSection = context?.edgeCases.length ? `
Identified Edge Cases to Test:
${context.edgeCases.map((ec, i) => `${i + 1}. ${ec}`).join('\n')}
` : '';

    // Build potential issues section
    const potentialIssuesSection = context?.potentialIssues.length ? `
Potential Issues & Failure Scenarios:
${context.potentialIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}
` : '';

    return `
You are a senior QA engineer specializing in end-to-end testing with Playwright.

${appContextSection}
Context:
- Framework: ${framework}
- Test runner: ${testRunner}
- The following flow was recorded from a Loom video demonstration

Observed User Flow (Happy Path):
${stepLines}
${edgeCasesSection}${potentialIssuesSection}
Your Tasks:

1. **Happy Path Test**
   - Generate a comprehensive Playwright test that exactly replicates the observed user flow
   - Use descriptive test names that clearly explain what is being tested
   - Add assertions at each critical step to verify expected outcomes
   - Include proper waits and state checks

2. **Edge Case Tests**
   - Form validation errors (empty fields, invalid formats, etc.)
   - Boundary conditions (min/max values, character limits)
   - Empty states and zero-data scenarios
   - Rapid user interactions (double-clicks, quick navigation)
   ${context?.edgeCases.length ? '- Address the identified edge cases listed above' : ''}

3. **Failure Scenario Tests**
   - Network errors and timeouts
   - API failures (500 errors, 404s, etc.)
   - Session expiration
   - Concurrent user actions
   ${context?.potentialIssues.length ? '- Address the potential issues listed above' : ''}

4. **Accessibility Tests** (if applicable)
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader compatibility (proper ARIA labels)
   - Focus management
   - Color contrast and visual accessibility

Playwright Best Practices to Follow:

**Selector Strategy:**
- Prefer role-based selectors: \`page.getByRole('button', { name: 'Submit' })\`
- Use data-testid for dynamic content: \`page.getByTestId('user-profile')\`
- Avoid brittle CSS selectors and XPath when possible
- Use text content selectors for stable elements: \`page.getByText('Welcome')\`

**Page Object Model:**
- Consider creating page objects for complex flows
- Encapsulate selectors and actions in reusable methods
- Keep tests DRY (Don't Repeat Yourself)

**Test Data Management:**
- Use fixtures for test data
- Clean up test data after each test
- Avoid hardcoding sensitive information

**Assertions:**
- Use specific assertions: \`expect(element).toBeVisible()\` instead of \`expect(element).toBeTruthy()\`
- Add meaningful assertion messages
- Test both positive and negative cases

**Error Handling:**
- Use proper timeouts and retries
- Handle async operations correctly
- Add error screenshots on failure

**Test Organization:**
- Group related tests using \`test.describe()\`
- Use \`beforeEach\` and \`afterEach\` for setup/teardown
- Keep tests independent and isolated

Output Requirements:
- A complete, production-ready Playwright test file
- Well-organized with clear test.describe blocks for each scenario type
- Comprehensive comments explaining assumptions and complex logic
- Ready to copy-paste and run with minimal modifications
- Include necessary imports and setup code

Generate the complete test file now.
`.trim();
}

