import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ReviewClient } from "./review-client"

export default async function ReviewPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const run = await prisma.ingestionRun.findUnique({
    where: { id: runId },
    include: { distributor: true, template: true },
  })
  if (!run) notFound()

  // Get distributor avg quality score for benchmark
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
      ? Math.round(
          priorRuns.reduce((s, r) => s + (r.aiQualityScore ?? 0), 0) / priorRuns.length,
        )
      : null

  const previewRows = (run.previewRows as Record<string, string>[] | null) ?? []

  // Pre-compute flags server-side so we can show them in UI
  const funds = await prisma.fund.findMany({ where: { organizationId: org.id } })
  const knownAliases = funds.flatMap((f) => f.aliases)

  type FlagType = "POTENTIAL_NIGO" | "POSSIBLE_DUPLICATE" | "FUND_NOT_RECOGNISED" | "MISSING_REQUIRED"
  type AiFlag = { type: FlagType; reason: string }

  function detectFlags(row: Record<string, string>): AiFlag[] {
    const flags: AiFlag[] = []
    const required = ["transactionId", "amount", "transactionType", "effectiveDate"]
    for (const field of required) {
      if (!row[field] || row[field].trim() === "") {
        flags.push({ type: "MISSING_REQUIRED", reason: `${field} is missing or empty` })
      }
    }
    if (row.fundName && !knownAliases.includes(row.fundName.trim())) {
      flags.push({ type: "FUND_NOT_RECOGNISED", reason: `Fund '${row.fundName}' not found in registry` })
    }
    const rawType = (row.transactionType ?? "").trim()
    if (rawType !== "" && rawType.toLowerCase() !== "subscription" && rawType.toLowerCase() !== "redemption") {
      flags.push({ type: "POTENTIAL_NIGO", reason: `Unrecognised transaction type: ${rawType}` })
    }
    let nigoCount = 0
    if (!row.investorName || row.investorName.trim() === "") nigoCount++
    if (!row.shareClass || row.shareClass.trim() === "") nigoCount++
    if (row.fundName && !knownAliases.includes(row.fundName.trim())) nigoCount++
    if (nigoCount >= 2) {
      flags.push({ type: "POTENTIAL_NIGO", reason: "Multiple data quality issues on this row" })
    }
    return flags
  }

  const seenTxIds = new Map<string, number>()
  const rowsWithFlags = previewRows.map((row, i) => {
    const flags = detectFlags(row)
    const txId = row.transactionId?.trim() ?? ""
    if (txId) {
      if (seenTxIds.has(txId)) {
        flags.push({ type: "POSSIBLE_DUPLICATE", reason: `Possible duplicate of row ${(seenTxIds.get(txId) ?? 0) + 1}` })
      } else {
        seenTxIds.set(txId, i)
      }
    }
    return { row, flags }
  })

  // Compute quality score
  const allFlags = rowsWithFlags.flatMap((r) => r.flags)
  const deductions: Record<string, number> = {
    MISSING_REQUIRED: 5,
    FUND_NOT_RECOGNISED: 3,
    POSSIBLE_DUPLICATE: 2,
    POTENTIAL_NIGO: 4,
  }
  const aiQualityScore = Math.max(
    0,
    100 - allFlags.reduce((s, f) => s + (deductions[f.type] ?? 0), 0),
  )

  const flagBreakdown = allFlags.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <ReviewClient
      run={{
        id: run.id,
        fileName: run.fileName,
        distributorName: run.distributor.name,
        templateName: run.template?.name ?? null,
      }}
      rowsWithFlags={rowsWithFlags}
      aiQualityScore={aiQualityScore}
      flagBreakdown={flagBreakdown}
      distributorAvgScore={avgScore}
      isFirstRun={priorRuns.length === 0}
    />
  )
}
