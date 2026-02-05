const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const { analyzePrompt, evaluationPrompt } = require('./promptTemplates');

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. The server will not contact the LLM until set.');
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Helper: call OpenAI Chat Completions (replace model name if needed).
async function callOpenAIChat(messages) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not configured');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4', // change to available model if needed
      messages,
      max_tokens: 800,
      temperature: 0.2
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

// POST /analyze
// Body: { opinion: string }
app.post('/analyze', async (req, res) => {
  try {
    const { opinion } = req.body;
    if (!opinion) return res.status(400).json({ error: 'Missing opinion' });

    const system = { role: 'system', content: 'You extract logical structure from short opinions and produce strict JSON only.' };
    const user = { role: 'user', content: analyzePrompt(opinion) };

    const raw = await callOpenAIChat([system, user]);

    // Try to parse JSON from LLM response (it's required by the prompt)
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // If parsing fails, return raw for debugging
      return res.status(500).json({ error: 'Failed to parse LLM JSON', raw });
    }

    // Build a simple JS challenge and some basic expected behaviour
    const challenge = parsed.suggestedChallenge || `Implement function defends(opinionData) that returns true if premises appear to support claim.`;
    const expected = [
      { input: { premises: parsed.premises, claim: parsed.claim }, output: true }
    ];

    res.json({ analysis: parsed, challenge, expected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /evaluate
// Body: { challenge: string, userCode: string, expected: array }
app.post('/evaluate', async (req, res) => {
  try {
    const { challenge, userCode, expected } = req.body;
    if (!challenge || !userCode) return res.status(400).json({ error: 'Missing fields' });

    const system = { role: 'system', content: 'You must respond with strict JSON describing pass/fail and feedback.' };
    const user = { role: 'user', content: evaluationPrompt(challenge, userCode, expected || []) };

    const raw = await callOpenAIChat([system, user]);

    try {
      const parsed = JSON.parse(raw);
      return res.json({ result: parsed });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse evaluation JSON', raw });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));