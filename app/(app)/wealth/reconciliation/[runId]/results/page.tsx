import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ResultsClient } from "./results-client"

export default async function ResultsPage({ params, searchParams }: {
  params: Promise<{ runId: string }>; searchParams: Promise<{ highlight?: string }>
}) {
  const { runId } = await params
  const sp = await searchParams
  const run = await prisma.reconciliationRun.findUnique({
    where: { id: runId },
    include: { transferAgent: true, fund: true, user: true },
  })
  if (!run) notFound()

  const exceptions = await prisma.exception.findMany({
    where: { runId },
    orderBy: { aiPriority: "asc" },
    include: { workbenchOrder: true },
  })

  const delta = await prisma.runDelta.findFirst({ where: { runId } })

  const persistentCount = exceptions.filter((e) => e.isPersistent).length

  return (
    <ResultsClient
      run={{
        id: run.id, fileName: run.fileName,
        taName: run.transferAgent.name, fundName: run.fund.name,
        closeCycle: run.closeCycle.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        runDate: run.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        taRowCount: run.taRowCount, portalOrderCount: run.portalOrderCount,
        matchedCount: run.matchedCount, issuesCount: run.issuesCount, matchRate: run.matchRate,
        aiNarrative: run.aiNarrative,
        transferAgentId: run.transferAgentId,
      }}
      exceptions={exceptions.map((e) => ({
        id: e.id, exceptionType: e.exceptionType, taTxnId: e.taTxnId,
        workbenchOrderId: e.workbenchOrderId,
        portalTxnId: e.workbenchOrder?.transactionId ?? null,
        amount: Number(e.amount), fundName: e.fundName,
        fieldDiffs: e.fieldDiffs as Record<string, { portal: string | number; ta: string | number }> | null,
        aiPriority: e.aiPriority, aiRootCause: e.aiRootCause, isPersistent: e.isPersistent,
        resolution: e.resolution, resolutionReason: e.resolutionReason, resolutionNote: e.resolutionNote,
        daysOpen: Math.floor((Date.now() - e.createdAt.getTime()) / 86400000),
        portalStatus: e.workbenchOrder?.status ?? null,
        portalAmount: e.workbenchOrder ? Number(e.workbenchOrder.amount) : null,
        portalFund: e.workbenchOrder?.fundName ?? null,
        portalShareClass: e.workbenchOrder?.shareClass ?? null,
        portalInvestor: e.workbenchOrder?.investorName ?? null,
        portalType: e.workbenchOrder?.transactionType ?? null,
        portalDate: e.workbenchOrder?.effectiveDate?.toISOString().slice(0, 10) ?? null,
      }))}
      delta={delta ? { aiDeltaSummary: delta.aiDeltaSummary, newExceptions: delta.newExceptions, resolvedExceptions: delta.resolvedExceptions, persistentExceptions: delta.persistentExceptions } : null}
      persistentCount={persistentCount}
      highlightId={sp.highlight ?? null}
      isReadOnly={false}
    />
  )
}
