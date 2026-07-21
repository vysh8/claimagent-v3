import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CASES = [
  {
    id: "40217659843",
    name: "J. Delgado",
    demo: "58 M · 5-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 44500,
    claim: [
      { code: "A41.51", desc: "Sepsis due to Escherichia coli", role: "PDX" },
      { code: "R65.21", desc: "Severe sepsis with septic shock", role: "MCC" },
      { code: "N39.0", desc: "Urinary tract infection, site not specified", role: "CC" },
    ],
  },
  {
    id: "50392847156",
    name: "S. Whitfield",
    demo: "76 F · 4-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 38900,
    claim: [
      { code: "A41.9", desc: "Sepsis, unspecified organism", role: "PDX" },
      { code: "N17.9", desc: "Acute kidney injury, unspecified", role: "MCC" },
      { code: "J18.9", desc: "Pneumonia, unspecified organism", role: "CC" },
    ],
  },
  {
    id: "61847293015",
    name: "M. Osei",
    demo: "67 M · 6-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 51200,
    claim: [
      { code: "A41.59", desc: "Other gram-negative sepsis", role: "PDX" },
      { code: "N17.9", desc: "Acute kidney injury, unspecified", role: "MCC" },
      { code: "K83.09", desc: "Cholangitis, unspecified", role: "CC" },
      { code: "E11.9", desc: "Type 2 diabetes mellitus w/o complications", role: "CC" },
    ],
  },
  {
    id: "72956140382",
    name: "P. Vasquez",
    demo: "59 F · 5-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 40700,
    claim: [
      { code: "A41.02", desc: "Sepsis due to MRSA", role: "PDX" },
      { code: "R65.21", desc: "Severe sepsis with septic shock", role: "MCC" },
      { code: "T80.211A", desc: "BSI due to central venous catheter, initial", role: "CC" },
    ],
  },
  {
    id: "83614759201",
    name: "L. Chen",
    demo: "82 F · 4-day LOS · POS 21",
    drgBilled: "871",
    drgBilledDesc: "Sepsis w/o MV >96h — WITH MCC",
    charge: 36400,
    claim: [
      { code: "A41.9", desc: "Sepsis, unspecified organism", role: "PDX" },
      { code: "R65.20", desc: "Severe sepsis without septic shock", role: "MCC" },
      { code: "J69.0", desc: "Aspiration pneumonia", role: "CC" },
    ],
  },
];

async function main() {
  const deletedClaims = await prisma.claim.deleteMany({});
  console.log(`cleared ${deletedClaims.count} existing claims`);

  for (const c of CASES) {
    const claim = await prisma.claim.create({
      data: {
        claimNumber: c.id,
        patientName: c.name,
        patientDemo: c.demo,
        drgBilled: c.drgBilled,
        drgBilledDesc: c.drgBilledDesc,
        charge: c.charge,
        seedSource: true,
        status: "NEW",
        diagnoses: {
          create: c.claim.map((d) => ({ code: d.code, desc: d.desc, role: d.role as "PDX" | "MCC" | "CC" })),
        },
      },
    });

    console.log(`seeded ${claim.claimNumber} — ${claim.patientName}`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
