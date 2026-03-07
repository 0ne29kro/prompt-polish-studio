require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const MODE = 'claude';

async function callAI(prompt) {
  if (MODE === 'ollama') {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false,
        options: { temperature: 0 }
      })
    });
    const data = await response.json();
    return data.response;
  }

  if (MODE === 'claude') {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });
    return response.content[0].text;
  }
}

app.post('/api/analyze', async (req, res) => {
  const { prompt } = req.body;

  try {
    const text = await callAI(`You are a prompt engineering diagnostic system.

Evaluate the following prompt across five dimensions:
1. Specificity (0-20)
2. Context (0-20)
3. Role Definition (0-20)
4. Output Structure (0-20)
5. Constraints (0-20)

Be strict. Vague prompts should score low.

Return ONLY valid JSON in this exact format with no extra text:
{
  "specificity": number,
  "context": number,
  "role_definition": number,
  "output_structure": number,
  "constraints": number,
  "summary": "short explanation of weaknesses"
}

Prompt to evaluate:
${prompt}`);

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in response');
    const json = JSON.parse(match[0]);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Diagnosis failed' });
  }
});

app.post('/api/questions', async (req, res) => {
  const { prompt, summary } = req.body;

  try {
    const text = await callAI(`You are a prompt engineering assistant.

A user submitted this prompt:
"${prompt}"

Diagnostic summary: ${summary}

Generate 3-5 targeted clarifying questions that, when answered, would help you write a significantly better version of this prompt. Focus on missing context, intent, audience, desired format, or constraints.

Return ONLY valid JSON in this exact format with no extra text:
{
  "questions": ["question1", "question2", "question3"]
}`);

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in response');
    const json = JSON.parse(match[0]);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Questions failed' });
  }
});

app.post('/api/polish', async (req, res) => {
  const { prompt, summary, answers } = req.body;

  try {
    let answersSection = '';
    if (answers && answers.length > 0) {
      answersSection = '\n\nThe user provided these additional details:\n' +
        answers.map(({ question, answer }) => `Q: ${question}\nA: ${answer}`).join('\n\n');
    }

    const text = await callAI(`You are an expert prompt engineer.

Rewrite the following prompt to improve clarity and effectiveness.

Improvements should include:
- Clear role definition for the AI
- Specific task description
- Useful context
- Defined output format
- Reasonable constraints

Do not change the intent of the original prompt.
Incorporate the user's additional details to make the rewrite highly personalized.
Return ONLY the improved prompt text, nothing else.

Original prompt:
${prompt}

Diagnostic summary:
${summary}${answersSection}`);

    res.json({ improved: text.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Polish failed' });
  }
});

app.post('/api/compare', async (req, res) => {
  const { original, improved } = req.body;

  try {
    const [originalOutput, improvedOutput] = await Promise.all([
      callAI(original),
      callAI(improved)
    ]);

    res.json({ originalOutput, improvedOutput });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Comparison failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));