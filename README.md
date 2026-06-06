# ClaimAgent v2 — Prepay DRG Validation (Sepsis)

A full-stack prototype demonstrating agentic AI review of prepay sepsis claims. The system validates coded ICD-10 diagnoses against medical records using Claude, grounded in real coding guidelines (ICD-10-CM Official Guidelines, AHA Coding Clinic, UHDDS, and Sepsis-3).

## What it does

- **5 pre-loaded sepsis cases** spanning different infection sources (urinary, pulmonary, biliary, catheter-related) and audit challenges (MCC overcoding, documentation ambiguity, principal diagnosis validation)
- **Live Claude analysis** — each "Run Agent" click sends the claim + record to Claude and returns citation-backed clinical findings
- **Three-way disposition**: Validate (DRG stands) / Recode-down (871→872, MCC unsupported) / Pend (documentation insufficient, provider query needed)
- **Dollar impact** grounded in real FY2026 MS-DRG relative weights (V43.0)
- **Guideline citations** — every finding cites the specific coding authority (ICD-10-CM §I.C.1.d, AHA Coding Clinic, UHDDS, Sepsis-3)
- **Follow-up chat** — ask questions about the analysis, coding logic, or documentation gaps
- **Editable records** — modify the medical record text and re-run to see how the analysis changes

## Architecture

```
Frontend (static HTML)  →  Vercel Serverless Functions  →  Anthropic API (Claude)
     public/index.html       api/analyze.js                  claude-sonnet-4
                              api/chat.js
                              api/claims.js
```

- **Frontend**: Single HTML file, no build step, vanilla JS
- **Backend**: Three serverless API routes on Vercel (Node.js 18+)
- **Auth**: Passcode-based access control via request header
- **Data**: 5 synthetic sepsis cases stored server-side (no database needed)

## Deployment (step by step)

### 1. Create a GitHub repository

Go to github.com → New Repository → name it `claimagent-v2` → Public or Private → Create.

### 2. Push this project to GitHub

```bash
cd claimagent-v2
git init
git add .
git commit -m "Initial commit: ClaimAgent v2"
git remote add origin https://github.com/YOUR_USERNAME/claimagent-v2.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to vercel.com → **Add New → Project**
2. Import your `claimagent-v2` repository from GitHub
3. Leave all build settings as defaults (Vercel auto-detects the structure)
4. Click **Deploy**

### 4. Set environment variables

After the first deploy, go to your project in Vercel:

1. **Settings → Environment Variables**
2. Add these two variables:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your key from console.anthropic.com (starts with `sk-ant-`) |
| `ACCESS_PASSCODE` | Any passcode you want to share with reviewers (e.g. `claimagent2026`) |

3. Click **Save**
4. Go to **Deployments → ⋮ menu on the latest deploy → Redeploy** (so the new env vars take effect)

### 5. Share it

Your app is live at `https://claimagent-v2-XXXX.vercel.app`. Share the URL and the access passcode with your reviewers.

To rename the URL: Settings → Domains → add a custom subdomain like `claimagent.vercel.app`.

## Cost estimate

Claude Sonnet 4 pricing: $3/M input tokens, $15/M output tokens.

Each analysis call: ~2,000 input tokens + ~1,500 output tokens ≈ $0.03  
Each chat follow-up: ~2,500 input tokens + ~500 output tokens ≈ $0.015  

For 6-7 users doing ~10 analyses + ~20 chat messages each: **~$4 total**.

## Validation framework

Every agent finding cites one or more of these authorities:

| Source | What it covers |
|--------|---------------|
| ICD-10-CM Official Guidelines §I.C.1.d | Sepsis sequencing, severe sepsis, septic shock coding rules |
| AHA Coding Clinic | Official Q&A guidance on edge cases (sepsis, MCC validation) |
| UHDDS | When a secondary diagnosis can be reported (evaluated/monitored/treated) |
| Sepsis-3 (JAMA 2016) | Clinical definition: infection + SOFA ≥2 organ dysfunction |
| MS-DRG Grouper V43.0 | DRG 871 (with MCC) vs 872 (without MCC) assignment logic |

## Notes

- All patient data is synthetic — no PHI
- The tool surfaces recommendations for a human auditor; it does not auto-adjudicate
- Dollar figures use DRG 871 RW 1.9425 (verified CMS FY2026) and 872 RW ~1.04 (estimated) × $7,000 blended base rate
