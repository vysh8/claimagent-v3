export type Solution = {
  slug: string;
  name: string;
  status: "live" | "soon";
  tagline: string;
  description: string;
  href: string;
  detail: string[];
};

export const SOLUTIONS: Solution[] = [
  {
    slug: "claim-review",
    name: "Prepay Claim Review",
    status: "live",
    tagline: "Validate DRG coding against documentation before a claim is paid",
    description:
      "An AI agent reads the uploaded medical chart, checks every coded diagnosis against ICD-10-CM guidelines, AHA Coding Clinic, and clinical criteria, and returns a citation-backed disposition — validate, recode, or pend for physician query.",
    href: "/claims",
    detail: [],
  },
  {
    slug: "prior-auth",
    name: "Prior Authorization",
    status: "soon",
    tagline: "Faster, defensible decisions on requested procedures",
    description:
      "Automates medical-necessity review against payer policy at request time, reducing turnaround from days to minutes while keeping every decision auditable and guideline-cited.",
    href: "/solutions/prior-auth",
    detail: [
      "Reads the clinical request alongside payer-specific medical policy and returns an approve, deny, or pend-for-information recommendation.",
      "Every determination cites the specific policy criterion applied, so reviewers and providers can see exactly why a request was decided the way it was.",
      "Designed to sit in front of existing UM workflow tools rather than replace them — a second set of eyes at request intake, not a black-box auto-denier.",
    ],
  },
  {
    slug: "payment-integrity",
    name: "Payment Integrity & FWA Detection",
    status: "soon",
    tagline: "Surface fraud, waste, and abuse patterns before payment",
    description:
      "Applies pattern detection across claims volume to flag outlier billing behavior, upcoding patterns, and provider-level anomalies for special investigations review.",
    href: "/solutions/payment-integrity",
    detail: [
      "Scores claims and billing providers on anomaly patterns learned from historical FWA cases, not just static edit rules.",
      "Prioritizes a review queue by estimated dollar exposure, so SIU teams work the highest-impact cases first.",
      "Every flag includes the specific comparison data (peer billing norms, historical pattern) that drove the score, for defensible case-building.",
    ],
  },
  {
    slug: "utilization-management",
    name: "Utilization Management",
    status: "soon",
    tagline: "Continued-stay and concurrent review, grounded in InterQual/MCG-style criteria",
    description:
      "Reviews ongoing inpatient stays and extended therapy courses against evidence-based criteria to confirm continued medical necessity, flagging cases ready for step-down or discharge planning.",
    href: "/solutions/utilization-management",
    detail: [
      "Continuously re-reads updated chart documentation during a stay, rather than requiring a manual re-submission trigger.",
      "Flags cases where documented clinical status no longer meets continued-stay criteria, with the specific criterion and supporting chart evidence cited.",
      "Built to complement care management teams' judgment, not override it — every flag is a recommendation for a human reviewer.",
    ],
  },
];
