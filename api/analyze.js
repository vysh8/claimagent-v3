const { CASES } = require('../data/cases.js');

const SYSTEM_PROMPT = `You are a senior clinical DRG validation auditor conducting prepay review of an inpatient sepsis claim. Your determinations must be defensible and citation-backed.

VALIDATION FRAMEWORK — cite explicitly in every finding:
1. ICD-10-CM Official Guidelines for Coding and Reporting, Section I.C.1.d — sepsis sequencing, severe sepsis, and septic shock coding rules
2. AHA Coding Clinic — official coding guidance on sepsis, MCC validation, and complication coding (cite quarter/year when applicable)
3. UHDDS (Uniform Hospital Discharge Data Set) — secondary diagnoses must be clinically evaluated, monitored, treated, or documented as affecting care
4. Sepsis-3 (Singer et al., JAMA 2016) — sepsis = life-threatening organ dysfunction from dysregulated host response to infection; operationalized as suspected infection + SOFA score increase >= 2. Septic shock = vasopressor-dependent hypotension + serum lactate >2 mmol/L after adequate fluid resuscitation
5. MS-DRG Grouper V43.0 (FY2026) — DRG 871 (sepsis with MCC) vs DRG 872 (sepsis without MCC)

REQUIREMENTS:
- Every "fail" or "warn" finding MUST cite the specific guideline violated and what the rule requires
- Every "pass" finding should note which guideline the documentation satisfies
- Evidence quotes must be verbatim from the medical record
- Cite specific clinical values: vitals, labs, medications, timing
- Be concise: 2-3 sentences per step finding

Return ONLY valid JSON with no markdown fences and no preamble text:
{
  "steps": [
    {
      "s": "pass|fail|warn",
      "t": "short step title",
      "d": "2-3 sentence clinical finding citing specific values from the record",
      "e": "exact verbatim quote from the medical record, or empty string if not applicable",
      "cite": "guideline citation, e.g. ICD-10-CM Guidelines Section I.C.1.d.1.a or AHA Coding Clinic Q3 2018 p.34 or UHDDS reporting criteria or Sepsis-3 (JAMA 2016)"
    }
  ],
  "disposition": "validate|recode|pend",
  "drgFinal": "871|872|pending",
  "verdict": "short verdict phrase",
  "narrative": "one paragraph clinical summary with key terms wrapped in <b>tags</b> and specific guideline citations for key decisions",
  "recommend": "one actionable sentence",
  "guidelines_applied": ["list of all guidelines cited in this review"]
}

Follow this step sequence: (1) principal diagnosis validation, (2) Sepsis-3 criteria assessment, (3) one step per coded MCC or CC — validate each against the record, (4) DRG re-grouping determination, (5) documentation sufficiency assessment.`;

function buildPrompt(c, record) {
  const rw = { "871": 1.9425, "872": 1.0400 };
  const base = 7000;
  const pay = rw[c.drgBilled] ? Math.round(rw[c.drgBilled] * base) : 'unknown';
  return `CLAIM — ${c.name} (${c.demo})
Billed DRG: ${c.drgBilled} — ${c.drgBilledDesc}
Expected payment: $${pay.toLocaleString()} (RW ${rw[c.drgBilled]} × $${base} base rate)

Coded diagnoses:
${c.claim.map(d => '  ' + d.code + ' — ' + d.desc + ' [' + d.role + ']').join('\n')}

MEDICAL RECORD:
${record}

Validate whether the billed DRG is clinically supported by the documentation. If any MCC or CC is unsupported, determine the correct DRG and financial impact.`;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const code = req.headers['x-access-code'];
  if (!code || code !== process.env.ACCESS_PASSCODE) {
    return res.status(401).json({ error: 'Invalid access code' });
  }

  const { caseId, customRecord } = req.body || {};
  if (!caseId) return res.status(400).json({ error: 'caseId is required' });

  const caseData = CASES.find(c => c.id === caseId);
  if (!caseData) return res.status(404).json({ error: 'Case not found' });

  const record = customRecord || caseData.record;
  const userPrompt = buildPrompt(caseData, record);

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error('Anthropic API error:', resp.status, errBody);
      return res.status(502).json({ error: 'AI service error', detail: resp.status });
    }

    const data = await resp.json();
    const raw = (data.content || []).map(i => i.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message, 'Raw:', raw.substring(0, 500));
      return res.status(502).json({ error: 'Failed to parse AI response', raw: raw.substring(0, 300) });
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
