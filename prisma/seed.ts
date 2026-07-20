import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CASES = [
  {
    id: "CLM-SEP-0142",
    name: "R. Alvarez",
    demo: "68 F · 6-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 48200,
    claim: [
      { code: "A41.51", desc: "Sepsis due to Escherichia coli", role: "PDX" },
      { code: "R65.21", desc: "Severe sepsis with septic shock", role: "MCC" },
      { code: "N17.9", desc: "Acute kidney injury, unspecified", role: "MCC" },
      { code: "N39.0", desc: "Urinary tract infection, site not specified", role: "CC" },
    ],
    record: `68 F presented to ED with 2 days of dysuria, fever, and progressive confusion.

On arrival: T 39.1°C, HR 118, BP 86/52, RR 24, lactate 3.4 mmol/L. Altered mental status and suprapubic tenderness. UA: >100 WBC/hpf, positive nitrites, positive leukocyte esterase. Blood cultures ×2 drawn — both subsequently positive for Escherichia coli. Urine culture: E. coli >100,000 CFU/mL.

Resuscitated with 30 mL/kg crystalloid; MAP remained <65 mmHg. Norepinephrine initiated and titrated over 18 hours for septic shock. Creatinine rose from documented baseline 0.9 to 2.3 mg/dL with urine output <0.5 mL/kg/hr, consistent with acute kidney injury (KDIGO stage 2). Empiric IV ceftriaxone started, de-escalated to ciprofloxacin per sensitivities.

Hospital course: hemodynamics stabilized by day 2, pressors weaned, creatinine returned toward baseline (1.1) by discharge, mental status cleared. Discharged day 6 on oral antibiotics.

Assessment: Severe sepsis with septic shock secondary to E. coli urosepsis; acute kidney injury, resolving.`,
  },
  {
    id: "CLM-SEP-0177",
    name: "T. Okafor",
    demo: "74 M · 4-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 39400,
    claim: [
      { code: "A41.9", desc: "Sepsis, unspecified organism", role: "PDX" },
      { code: "J96.00", desc: "Acute respiratory failure, unspecified", role: "MCC" },
      { code: "J18.9", desc: "Pneumonia, unspecified organism", role: "CC" },
    ],
    record: `74 M with COPD admitted from clinic with 3 days of productive cough, fever, and dyspnea.

ED vitals: T 38.6°C, HR 104, BP 96/60 (transiently 88/56, responded to 1 L crystalloid), RR 22, SpO2 93% on 2 L/min nasal cannula. WBC 16.8, lactate 2.4 mmol/L. CXR: right lower lobe consolidation. Diagnosed with community-acquired pneumonia with sepsis.

No arterial blood gas was obtained. Oxygen requirement remained 2 L NC throughout the admission and the patient was weaned to room air on day 3. No noninvasive or invasive ventilation. No documentation of respiratory distress, accessory muscle use, or PaO2/PaCO2 abnormality.

Hemodynamics: single transient hypotensive episode on arrival, fluid-responsive; no vasopressors administered; repeat lactate 1.6 by hour 8. Started on ceftriaxone and azithromycin.

Hospital course: afebrile by day 2, improving oxygenation, discharged day 4.

Assessment: CAP with sepsis; hypoxia improved; respiratory status stable on low-flow oxygen.`,
  },
  {
    id: "CLM-SEP-0203",
    name: "M. Brennan",
    demo: "81 F · 3-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 41900,
    claim: [
      { code: "A41.9", desc: "Sepsis, unspecified organism", role: "PDX" },
      { code: "N17.9", desc: "Acute kidney injury, unspecified", role: "MCC" },
      { code: "N39.0", desc: "Urinary tract infection, site not specified", role: "CC" },
    ],
    record: `81 F, history of CKD stage 3 (baseline creatinine noted in problem list as "chronic, ~1.6"), nursing-home resident, brought in for lethargy and decreased oral intake.

ED: T 38.2°C, HR 96, BP 108/64, RR 18, SpO2 96% on room air. WBC 13.1, creatinine 2.1 mg/dL. UA cloudy with WBC and bacteria. Lactate 1.9 mmol/L.

No prior baseline creatinine available in the current record beyond the problem-list notation. No repeat creatinine trend documented during the stay at the time of coding. Blood cultures drawn — results pending. Urine culture pending.

Physician note states "possible urosepsis vs UTI"; there is no explicit statement establishing sepsis versus localized UTI, and no documentation clarifying whether the elevated creatinine represents acute kidney injury superimposed on CKD or the chronic baseline.

Started on empiric ceftriaxone and IV fluids. Plan to trend renal function and follow cultures.`,
  },
  {
    id: "CLM-SEP-0241",
    name: "D. Nakamura",
    demo: "71 M · 5-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 52100,
    claim: [
      { code: "A41.59", desc: "Other gram-negative sepsis (Klebsiella)", role: "PDX" },
      { code: "N17.9", desc: "Acute kidney injury, unspecified", role: "MCC" },
      { code: "K83.09", desc: "Cholangitis, unspecified", role: "CC" },
      { code: "E11.9", desc: "Type 2 diabetes mellitus w/o complications", role: "CC" },
    ],
    record: `71 M with type 2 diabetes and recent ERCP for choledocholithiasis (2 weeks prior) presented with 2 days of worsening right upper quadrant pain, fever, and jaundice consistent with Charcot's triad.

ED vitals: T 38.9°C, HR 112, BP 92/58, RR 20, SpO2 97% on room air. Lactate 3.1 mmol/L. Total bilirubin 4.2, direct bilirubin 3.1, ALP 340 U/L. WBC 18.4. Creatinine 2.1 mg/dL (documented baseline 0.8 from pre-procedure labs 2 weeks prior).

Blood cultures ×2 — both positive for Klebsiella pneumoniae. Emergent ERCP with stone extraction and biliary stent placement day 1. IV piperacillin-tazobactam initiated, narrowed per sensitivities.

Creatinine trended: 2.1 → 1.8 → 1.3 → 0.9. Urine output maintained >0.5 mL/kg/hr throughout.

Assessment: Klebsiella pneumoniae sepsis secondary to acute obstructive cholangitis; acute kidney injury (KDIGO stage 2), resolved.`,
  },
  {
    id: "CLM-SEP-0258",
    name: "K. Williams",
    demo: "63 M · 4-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 37800,
    claim: [
      { code: "A41.02", desc: "Sepsis due to MRSA", role: "PDX" },
      { code: "R65.21", desc: "Severe sepsis with septic shock", role: "MCC" },
      { code: "T80.211A", desc: "BSI due to central venous catheter, initial", role: "CC" },
    ],
    record: `63 M with stage IIIA colon cancer on cycle 4 of FOLFOX chemotherapy via tunneled PICC line, presented with 3 days of fevers, rigors, and mild confusion.

ED vitals: T 39.3°C, HR 122, BP 102/64 (one transient reading of 88/52 on arrival, responded to 500 mL NS bolus within 20 minutes), RR 22, SpO2 96% on room air. WBC 22.6, lactate 1.8 mmol/L. Mild confusion on arrival, cleared to baseline by day 2.

Peripheral blood cultures ×2: MRSA. PICC line cultures: 4/4 bottles MRSA, differential time to positivity 82 minutes — consistent with CLABSI. PICC removed on admission. No vasopressors at any point. Repeat lactate 1.4 at hour 4. BP stable after initial bolus through discharge.

IV vancomycin started. Repeat cultures day 2: negative. TEE: no vegetations.

Assessment: MRSA catheter-related bloodstream infection (CLABSI); sepsis with encephalopathy. Septic shock documented by admitting physician based on transient hypotensive episode on arrival.`,
  },
];

async function main() {
  for (const c of CASES) {
    const existing = await prisma.claim.findUnique({ where: { claimNumber: c.id } });
    if (existing) {
      console.log(`skip ${c.id} (already seeded)`);
      continue;
    }

    const claim = await prisma.claim.create({
      data: {
        claimNumber: c.id,
        patientName: c.name,
        patientDemo: c.demo,
        drgBilled: c.drgBilled,
        drgBilledDesc: c.drgBilledDesc,
        charge: c.charge,
        seedSource: true,
        status: "OCR_COMPLETE",
        diagnoses: {
          create: c.claim.map((d) => ({ code: d.code, desc: d.desc, role: d.role as "PDX" | "MCC" | "CC" })),
        },
        charts: {
          create: {
            fileName: `${c.id}-seed-record.txt`,
            fileType: "text/plain",
            status: "OCR_COMPLETE",
            hocrFiles: {
              create: {
                extractedText: c.record,
              },
            },
          },
        },
      },
    });

    console.log(`seeded ${claim.claimNumber}`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
