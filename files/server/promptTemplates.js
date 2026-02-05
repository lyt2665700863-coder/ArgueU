// Prompt templates used by the backend to talk to the LLM.
// Tweak the model instructions and examples to suit the style/strictness you like.

const analyzePrompt = (opinion) => `
You are an assistant that extracts the logical structure of opinions.

Input opinion:
"""${opinion}"""

Output a JSON object EXACTLY with these fields:
- claim: short sentence that is the main claim being asserted.
- premises: array of short sentences representing supporting statements or assumptions.
- inferences: array of short sentences describing reasoning steps from premises to claim.
- suggestedChallenge: a short instruction for a small JavaScript coding challenge that encodes this logic (e.g. "Implement function defends(opinionData) that returns true when premises support the claim").

If a field is missing, output an empty string or empty array. Only output valid JSON.
`;

const evaluationPrompt = (challenge, userCode, expectedBehaviour) => `
You are an assistant that judges a JavaScript function implementation for a small logic-based challenge.

Challenge:
"""${challenge}"""

Expected behaviour / tests:
${JSON.stringify(expectedBehaviour, null, 2)}

User implementation:
\`\`\`js
${userCode}
\`\`\`

Respond in JSON EXACTLY with fields:
- pass: true or false
- score: integer 0-100
- feedback: brief actionable feedback about correctness and style
- suggestions: array of short improvement suggestions

Only output valid JSON.
`;

module.exports = { analyzePrompt, evaluationPrompt };