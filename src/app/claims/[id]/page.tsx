import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import ClaimDetail from "@/components/ClaimDetail";

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-6 max-w-6xl w-full mx-auto">
        <ClaimDetail initialClaim={JSON.parse(JSON.stringify(claim))} />
      </main>
    </div>
  );
}
