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
      { code: "N17.9",  desc: "Acute kidney injury, unspecified", role: "MCC" },
      { code: "N39.0",  desc: "Urinary tract infection, site not specified", role: "CC" }
    ],
    record: `68 F presented to ED with 2 days of dysuria, fever, and progressive confusion.

On arrival: T 39.1°C, HR 118, BP 86/52, RR 24, lactate 3.4 mmol/L. Altered mental status and suprapubic tenderness. UA: >100 WBC/hpf, positive nitrites, positive leukocyte esterase. Blood cultures ×2 drawn — both subsequently positive for Escherichia coli. Urine culture: E. coli >100,000 CFU/mL.

Resuscitated with 30 mL/kg crystalloid; MAP remained <65 mmHg. Norepinephrine initiated and titrated over 18 hours for septic shock. Creatinine rose from documented baseline 0.9 to 2.3 mg/dL with urine output <0.5 mL/kg/hr, consistent with acute kidney injury (KDIGO stage 2). Empiric IV ceftriaxone started, de-escalated to ciprofloxacin per sensitivities.

Hospital course: hemodynamics stabilized by day 2, pressors weaned, creatinine returned toward baseline (1.1) by discharge, mental status cleared. Discharged day 6 on oral antibiotics.

Assessment: Severe sepsis with septic shock secondary to E. coli urosepsis; acute kidney injury, resolving.`
  },
  {
    id: "CLM-SEP-0177",
    name: "T. Okafor",
    demo: "74 M · 4-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 39400,
    claim: [
      { code: "A41.9",  desc: "Sepsis, unspecified organism", role: "PDX" },
      { code: "J96.00", desc: "Acute respiratory failure, unspecified", role: "MCC" },
      { code: "J18.9",  desc: "Pneumonia, unspecified organism", role: "CC" }
    ],
    record: `74 M with COPD admitted from clinic with 3 days of productive cough, fever, and dyspnea.

ED vitals: T 38.6°C, HR 104, BP 96/60 (transiently 88/56, responded to 1 L crystalloid), RR 22, SpO2 93% on 2 L/min nasal cannula. WBC 16.8, lactate 2.4 mmol/L. CXR: right lower lobe consolidation. Diagnosed with community-acquired pneumonia with sepsis.

No arterial blood gas was obtained. Oxygen requirement remained 2 L NC throughout the admission and the patient was weaned to room air on day 3. No noninvasive or invasive ventilation. No documentation of respiratory distress, accessory muscle use, or PaO2/PaCO2 abnormality.

Hemodynamics: single transient hypotensive episode on arrival, fluid-responsive; no vasopressors administered; repeat lactate 1.6 by hour 8. Started on ceftriaxone + azithromycin.

Hospital course: afebrile by day 2, improving oxygenation, discharged day 4.

Assessment: CAP with sepsis; hypoxia improved; respiratory status stable on low-flow oxygen.`
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
      { code: "N39.0", desc: "Urinary tract infection, site not specified", role: "CC" }
    ],
    record: `81 F, history of CKD stage 3 (baseline creatinine noted in problem list as "chronic, ~1.6"), nursing-home resident, brought in for lethargy and decreased oral intake.

ED: T 38.2°C, HR 96, BP 108/64, RR 18, SpO2 96% on room air. WBC 13.1, creatinine 2.1 mg/dL. UA cloudy with WBC and bacteria. Lactate 1.9 mmol/L.

No prior baseline creatinine available in the current record beyond the problem-list notation. No repeat creatinine trend documented during the stay at the time of coding. Blood cultures drawn — results pending / not finalized in available documentation. Urine culture pending.

Physician note states "possible urosepsis vs UTI"; there is no explicit statement establishing sepsis versus localized UTI, and no documentation clarifying whether the elevated creatinine represents acute kidney injury superimposed on CKD or the chronic baseline.

Started on empiric ceftriaxone and IV fluids. Plan to trend renal function and follow cultures.`
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
      { code: "N17.9",  desc: "Acute kidney injury, unspecified", role: "MCC" },
      { code: "K83.09", desc: "Cholangitis, unspecified", role: "CC" },
      { code: "E11.9",  desc: "Type 2 diabetes mellitus w/o complications", role: "CC" }
    ],
    record: `71 M with type 2 diabetes and recent ERCP for choledocholithiasis (2 weeks prior) presented with 2 days of worsening right upper quadrant pain, fever, and jaundice consistent with Charcot's triad.

ED vitals: T 38.9°C, HR 112, BP 92/58, RR 20, SpO2 97% on room air. Lactate 3.1 mmol/L. Total bilirubin 4.2, direct bilirubin 3.1, ALP 340 U/L, AST 88, ALT 72. WBC 18.4. Creatinine 2.1 mg/dL (documented baseline 0.8 from pre-procedure labs 2 weeks prior). UA unremarkable. MRCP: common bile duct dilation with retained stone.

Blood cultures ×2 — both positive for Klebsiella pneumoniae. Bile aspirate obtained during ERCP also grew Klebsiella pneumoniae.

Resuscitated with 30 mL/kg crystalloid; MAP improved to >65 without vasopressor support. Repeat lactate 2.1 at hour 6. Emergent ERCP performed on day 1 with successful stone extraction and biliary stent placement. IV piperacillin-tazobactam initiated, narrowed to ceftriaxone per sensitivities.

Creatinine trended: 2.1 → 1.8 → 1.3 → 0.9 with IV hydration and biliary decompression. Urine output maintained >0.5 mL/kg/hr throughout.

Hospital course: fever resolved day 2, WBC normalized day 3, mental status intact throughout, tolerating diet by day 4. Discharged day 5 on oral antibiotics with GI follow-up.

Assessment: Klebsiella pneumoniae sepsis secondary to acute obstructive cholangitis with retained CBD stone; acute kidney injury (KDIGO stage 2), resolved with biliary decompression and resuscitation.`
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
      { code: "T80.211A", desc: "BSI due to central venous catheter, initial", role: "CC" }
    ],
    record: `63 M with stage IIIA colon cancer, currently on cycle 4 of FOLFOX chemotherapy via tunneled PICC line, presented with 3 days of fevers, rigors, and mild confusion.

ED vitals: T 39.3°C, HR 122, BP 102/64 (one transient reading of 88/52 on arrival, responded to 500 mL NS bolus within 20 minutes), RR 22, SpO2 96% on room air. WBC 22.6, lactate 1.8 mmol/L. Creatinine 1.3 (baseline 0.9 from pre-chemo labs 3 weeks prior). Mild confusion on arrival — oriented ×2, sluggish responses; cleared to baseline by day 2 after defervescence.

Peripheral blood cultures ×2: methicillin-resistant Staphylococcus aureus (MRSA). PICC line blood cultures: 4/4 bottles MRSA with differential time to positivity of 82 minutes — consistent with catheter-related bloodstream infection (CLABSI). PICC line removed on admission; peripheral IV access established.

No vasopressors administered at any point during the admission. Repeat lactate 1.4 at hour 4. Blood pressure remained stable (systolic 106–118) after the initial 500 mL fluid bolus through discharge.

IV vancomycin started with trough monitoring. Repeat blood cultures on day 2: negative. TEE performed to rule out endocarditis — negative for vegetations.

Hospital course: fevers resolved day 2, WBC trending down (22.6 → 14.2), mental status cleared, hemodynamically stable throughout. Discharged day 4 on IV vancomycin via new midline for planned 4-week course. Infectious disease follow-up arranged.

Assessment: MRSA catheter-related bloodstream infection (CLABSI); sepsis with encephalopathy. Septic shock documented by admitting physician based on the transient hypotensive episode on arrival.`
  }
];

module.exports = { CASES };
