import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODEL = "claude-sonnet-4-6";

// Payment basis — FY2026 / MS-DRG Grouper V43.0
// DRG 871 RW: 1.9425 — verified CMS FY2026 Table 5
// DRG 872 RW: 1.0299 — verified CMS FY2024 Table 5 (FY2026 value stable ±0.02 historically)
export const RATE = { base: 7000, rw: { "871": 1.9425, "872": 1.0299 } as Record<string, number> };

export function payFor(drg: string | null | undefined): number | null {
  if (!drg || !RATE.rw[drg]) return null;
  return Math.round(RATE.rw[drg] * RATE.base);
}

export const ANALYZE_SYSTEM_PROMPT = `You are a senior clinical DRG validation auditor conducting prepay review of an inpatient sepsis claim. Your determinations must be defensible and citation-backed.

VALIDATION FRAMEWORK — cite explicitly in every finding:
1. ICD-10-CM Official Guidelines for Coding and Reporting, Section I.C.1.d — sepsis sequencing, severe sepsis, and septic shock coding rules
2. AHA Coding Clinic — official coding guidance on sepsis, MCC validation, and complication coding (cite quarter/year when applicable)
3. UHDDS (Uniform Hospital Discharge Data Set) — secondary diagnoses must be clinically evaluated, monitored, treated, or documented as affecting care
4. Sepsis-3 (Singer et al., JAMA 2016) — sepsis = life-threatening organ dysfunction from dysregulated host response to infection; operationalized as suspected infection + SOFA score increase >= 2. Septic shock = vasopressor-dependent hypotension + serum lactate >2 mmol/L after adequate fluid resuscitation
5. MS-DRG Grouper V43.0 (FY2026) — DRG 871 (sepsis with MCC) vs DRG 872 (sepsis without MCC)

CRITICAL REQUIREMENTS:
- Every "fail" or "warn" finding MUST cite the specific guideline violated and what the rule requires
- Every "pass" finding should note which guideline the documentation satisfies
- Evidence quotes must be verbatim from the medical record
- Cite specific clinical values: vitals, labs, medications, timing
- Be concise: maximum 2 sentences per step finding
- DO NOT calculate, estimate, or reference any dollar amounts, payment figures, relative weights, or financial impact in your response — dollar calculations are handled separately by the application from verified CMS data

Return ONLY valid JSON with no markdown fences and no preamble text:
{
  "steps": [
    {
      "s": "pass|fail|warn",
      "t": "short step title",
      "d": "2-sentence clinical finding citing specific values from the record",
      "e": "exact verbatim quote from the medical record, or empty string if not applicable",
      "cite": "guideline citation e.g. ICD-10-CM Guidelines Section I.C.1.d.1.a or AHA Coding Clinic Q3 2018 or UHDDS reporting criteria or Sepsis-3 (JAMA 2016)"
    }
  ],
  "disposition": "validate|recode|pend",
  "drgFinal": "871|872|pending",
  "verdict": "short verdict phrase — no dollar amounts",
  "narrative": "one paragraph clinical summary with key terms in <b>tags</b> and guideline citations — no dollar amounts or payment figures",
  "recommend": "one actionable sentence — no dollar amounts",
  "guidelines_applied": ["list of all guidelines cited in this review"]
}

Follow this step sequence: (1) principal diagnosis validation, (2) Sepsis-3 criteria assessment, (3) one step per coded MCC or CC — validate each against the record, (4) DRG re-grouping determination, (5) documentation sufficiency assessment.`;

export const CHAT_SYSTEM_PROMPT = `You are a clinical DRG validation expert and RCM educator. A user is reviewing an AI-generated prepay DRG validation analysis for a sepsis claim and has follow-up questions.

You have full access to the original claim, the medical record, and the complete validation analysis with findings and guideline citations.

When answering:
- Be clear and educational — your audience is RCM professionals and product managers
- When referencing clinical findings, cite specific guidelines (ICD-10-CM Official Guidelines, AHA Coding Clinic, UHDDS, Sepsis-3)
- Reference specific values from the record (vitals, labs, medications, timing) to support your answers
- Keep responses concise: 3-5 sentences for simple questions, longer for complex ones
- If the user asks about a coding concept, explain it in the context of the specific claim they are reviewing
- If the user challenges a finding, defend it with guidelines or acknowledge if the challenge has merit`;

type Diagnosis = { code: string; desc: string; role: string };

export function buildAnalyzePrompt(opts: {
  name: string;
  demo: string;
  drgBilled: string;
  drgBilledDesc: string;
  diagnoses: Diagnosis[];
  record: string;
}) {
  const { name, demo, drgBilled, drgBilledDesc, diagnoses, record } = opts;
  return `CLAIM — ${name} (${demo})
Billed DRG: ${drgBilled} — ${drgBilledDesc}

Coded diagnoses:
${diagnoses.map((d) => "  " + d.code + " — " + d.desc + " [" + d.role + "]").join("\n")}

MEDICAL RECORD:
${record}

Validate whether the billed DRG is clinically supported by the documentation. If any MCC or CC is unsupported, determine the correct DRG. Do not include any dollar amounts or payment figures in your response.`;
}
