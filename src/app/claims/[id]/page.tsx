import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AppShell from "@/components/AppShell";
import ClaimDetail from "@/components/ClaimDetail";

export const dynamic = "force-dynamic";

export default async function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const claim = await prisma.claim.findUnique({
    where: { id },
    include: {
      diagnoses: true,
      charts: { include: { hocrFiles: { orderBy: { pageNumber: "asc" } } }, orderBy: { createdAt: "desc" } },
      analyses: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!claim) notFound();

  return (
    <AppShell>
      <div className="px-6 py-6 max-w-6xl w-full mx-auto">
        <ClaimDetail initialClaim={JSON.parse(JSON.stringify(claim))} />
      </div>
    </AppShell>
  );
}
