import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { RunSummary } from "../run-summary"

export default async function SummaryPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const run = await prisma.ingestionRun.findUnique({
    where: { id: runId },
    include: { distributor: true, user: true, template: true, orders: true },
  })
  if (!run) notFound()

  const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "celestial" } })
  const priorRuns = await prisma.ingestionRun.findMany({
    where: {
      distributorId: run.distributorId,
      organizationId: org.id,
      id: { not: run.id },
      aiQualityScore: { not: null },
    },
  })
  const avgScore =
    priorRuns.length > 0
      ? Math.round(priorRuns.reduce((s, r) => s + (r.aiQualityScore ?? 0), 0) / priorRuns.length)
      : null

  type AiFlag = { type: string; reason: string }
  const flaggedOrders = run.orders.filter(
    (o) => Array.isArray(o.aiFlags) && (o.aiFlags as AiFlag[]).length > 0,
  )

  return (
    <RunSummary
      run={{
        id: run.id,
        fileName: run.fileName,
        distributorName: run.distributor.name,
        closeCycle: run.closeCycle.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        closeCycleRaw: run.closeCycle.toISOString().slice(0, 10),
        committedAt: run.committedAt
          ? run.committedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
            " · " +
            run.committedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          : "—",
        committedBy: run.user.name ?? run.user.email,
        templateName: run.template?.name ?? "—",
        rowsProcessed: run.rowsProcessed,
        rowsIngested: run.rowsIngested,
        rowsExcluded: run.rowsExcluded,
        rowsFlagged: run.rowsFlagged,
        aiQualityScore: run.aiQualityScore,
        aiSummary: run.aiSummary,
      }}
      distributorAvgScore={avgScore}
      isFirstRun={priorRuns.length === 0}
      flaggedOrders={flaggedOrders.map((o) => ({
        transactionId: o.transactionId,
        transactionType: o.transactionType,
        amount: Number(o.amount),
        fundName: o.fundName,
        investorName: o.investorName,
        flags: o.aiFlags as AiFlag[],
      }))}
      isReadOnly={false}
    />
  )
}
