const { CASES } = require('../data/cases.js');

const CHAT_SYSTEM = `You are a clinical DRG validation expert and RCM educator. A user is reviewing an AI-generated prepay DRG validation analysis for a sepsis claim and has follow-up questions.

You have full access to the original claim, the medical record, and the complete validation analysis with findings and guideline citations.

When answering:
- Be clear and educational — your audience is RCM professionals and product managers
- When referencing clinical findings, cite specific guidelines (ICD-10-CM Official Guidelines, AHA Coding Clinic, UHDDS, Sepsis-3)
- Reference specific values from the record (vitals, labs, medications, timing) to support your answers
- Keep responses concise: 3-5 sentences for simple questions, longer for complex ones
- If the user asks about a coding concept, explain it in the context of the specific claim they are reviewing
- If the user challenges a finding, defend it with guidelines or acknowledge if the challenge has merit`;

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const code = req.headers['x-access-code'];
  if (!code || code !== process.env.ACCESS_PASSCODE) {
    return res.status(401).json({ error: 'Invalid access code' });
  }

  const { caseId, analysisResult, messages } = req.body || {};
  if (!caseId || !messages || !messages.length) {
    return res.status(400).json({ error: 'caseId and messages are required' });
  }

  const caseData = CASES.find(c => c.id === caseId);
  if (!caseData) return res.status(404).json({ error: 'Case not found' });

  const context = `CLAIM UNDER REVIEW:
Patient: ${caseData.name} (${caseData.demo})
Billed DRG: ${caseData.drgBilled} — ${caseData.drgBilledDesc}
Coded diagnoses:
${caseData.claim.map(d => '  ' + d.code + ' — ' + d.desc + ' [' + d.role + ']').join('\n')}

MEDICAL RECORD:
${caseData.record}

VALIDATION ANALYSIS RESULT:
${JSON.stringify(analysisResult, null, 2)}`;

  const apiMessages = [
    { role: 'user', content: context + '\n\n---\nThe above is the context for this review. I will now ask follow-up questions.' },
    { role: 'assistant', content: 'I have the full claim, medical record, and validation analysis in front of me. What would you like to know?' },
    ...messages
  ];

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: CHAT_SYSTEM,
        messages: apiMessages
      })
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error('Anthropic API error:', resp.status, errBody);
      return res.status(502).json({ error: 'AI service error' });
    }

    const data = await resp.json();
    const reply = (data.content || []).map(i => i.text || '').join('');

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
