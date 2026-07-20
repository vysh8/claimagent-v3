# ClaimAgent v3 — Prepay DRG Sepsis Claim Review

A database-backed rebuild of [claimagent-v2](https://github.com/vysh8/claimagent-v2): a claims database, a medical
chart upload → OCR → HOCR pipeline, and an agent analytics button that runs Claude against the extracted record to
validate a billed DRG for prepay sepsis claims.

## Architecture

- **Next.js (App Router)** — UI + API routes, deployed on Vercel
- **Postgres + Prisma** — claims, diagnoses, chart/HOCR records, analysis results, chat history
- **Client-side OCR** — `tesseract.js` (+ `pdfjs-dist` for PDFs) runs in the browser, producing real HOCR output
- **File storage** — local disk in dev (`public/uploads/`), Vercel Blob in production (swaps automatically once
  `BLOB_READ_WRITE_TOKEN` is set)
- **Claude** — same DRG validation prompt/logic as v2, now reading from the database instead of hardcoded cases

## Local development

Requires Node 18+ (this repo pins Node 22 via `.nvmrc`) and a local Postgres instance.

```bash
nvm use
npm install
npx prisma migrate dev   # applies schema to DATABASE_URL in .env
npx prisma db seed       # loads the 5 reference sepsis cases
npm run dev
```

Fill in `.env`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `ANTHROPIC_API_KEY` | Claude API key — required for analyze/chat |
| `BLOB_READ_WRITE_TOKEN` | Leave unset locally; set once a Vercel Blob store is attached |

## Data model

See `prisma/schema.prisma`: `Claim` → `ClaimDiagnosis`, `MedicalChart` → `HocrFile`, plus `AnalysisResult` and
`ChatMessage`. A chart can have multiple `HocrFile` rows (one per page for multi-page PDFs).

## Notes

- All patient data is synthetic — no PHI
- The tool surfaces recommendations for a human auditor; it does not auto-adjudicate
