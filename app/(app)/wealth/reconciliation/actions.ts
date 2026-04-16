"use server"

import { prisma } from "@/lib/prisma"
import { ReconciliationStatus, ExceptionResolution } from "@/lib/generated/prisma/client"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { revalidatePath } from "next/cache"

async function getDemoContext() {
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "celestial" } })
  const user = await prisma.user.findUniqueOrThrow({ where: { email: "ops@celestial.com" } })
  return { orgId: org.id, userId: user.id }
}

function parseFileBuffer(
  buffer: Buffer,
  fileName: string,
): { columns: string[]; previewRows: Record<string, string>[] } {
  const ext = fileName.split(".").pop()?.toLowerCase()
  if (ext === "csv") {
    const text = buffer.toString("utf-8")
    const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
    return { columns: result.meta.fields ?? [], previewRows: result.data.slice(0, 200) }
  }
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" })
  return { columns: rows.length > 0 ? Object.keys(rows[0]) : [], previewRows: rows.slice(0, 200) }
}

// ─── createReconciliationRun ───────────────────────────────────────────────────

export async function createReconciliationRun(formData: FormData): Promise<{
  success: boolean; runId?: string; error?: string
}> {
  try {
    const { orgId, userId } = await getDemoContext()
    const transferAgentId = formData.get("transferAgentId") as string
    const fundId = formData.get("fundId") as string
    const closeCycleStr = formData.get("closeCycle") as string
    const file = formData.get("file") as File
    if (!transferAgentId || !fundId || !closeCycleStr || !file)
      return { success: false, error: "Missing required fields" }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { columns, previewRows } = parseFileBuffer(buffer, file.name)
    if (columns.length === 0) return { success: false, error: "File appears to be empty" }

    const run = await prisma.reconciliationRun.create({
      data: {
        organizationId: orgId, transferAgentId, fundId, userId,
        closeCycle: new Date(closeCycleStr), fileName: file.name,
        detectedColumns: columns, previewRows: previewRows as object[],
        status: ReconciliationStatus.PENDING, taRowCount: previewRows.length,
      },
    })
    return { success: true, runId: run.id }
  } catch (err) {
    console.error("createReconciliationRun error:", err)
    return { success: false, error: "Failed to create reconciliation run" }
  }
}

// ─── saveReconciliationMapping ─────────────────────────────────────────────────

export async function saveReconciliationMapping(input: {
  runId: string; mapping: Record<string, string>; saveTemplate: boolean; templateName: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { orgId } = await getDemoContext()
    const run = await prisma.reconciliationRun.findUniqueOrThrow({ where: { id: input.runId } })

    let templateId: string | undefined
    if (input.saveTemplate) {
      await prisma.columnMappingTemplate.updateMany({
        where: { transferAgentId: run.transferAgentId, organizationId: orgId, isDefault: true },
        data: { isDefault: false },
      })
      const existing = await prisma.columnMappingTemplate.findFirst({
        where: { transferAgentId: run.transferAgentId, organizationId: orgId, name: input.templateName },
      })
      const template = existing
        ? await prisma.columnMappingTemplate.update({
            where: { id: existing.id },
            data: { mappingJson: input.mapping, isDefault: true, lastUsedAt: new Date() },
          })
        : await prisma.columnMappingTemplate.create({
            data: {
              transferAgentId: run.transferAgentId, organizationId: orgId,
              name: input.templateName, mappingJson: input.mapping,
              isDefault: true, lastUsedAt: new Date(),
            },
          })
      templateId = template.id
    }

    // Map preview rows to schema field names
    const rawRows = run.previewRows as Record<string, string>[] | null
    const mappedRows = rawRows
      ? rawRows.map((row) => {
          const mapped: Record<string, string> = {}
          Object.entries(input.mapping).forEach(([schemaField, sourceCol]) => {
            if (sourceCol && sourceCol !== "") mapped[schemaField] = row[sourceCol] ?? ""
          })
          return mapped
        })
      : []

    await prisma.reconciliationRun.update({
      where: { id: input.runId },
      data: { status: ReconciliationStatus.RUNNING, templateId, previewRows: mappedRows as object[] },
    })

    // Run reconciliation engine
    await runReconciliationEngine(input.runId)

    return { success: true }
  } catch (err) {
    console.error("saveReconciliationMapping error:", err)
    return { success: false, error: "Failed to save mapping" }
  }
}

// ─── runReconciliationEngine ───────────────────────────────────────────────────

function extractNumericId(txnId: string): string {
  const match = txnId.match(/(\d+)$/)
  return match ? match[1] : txnId
}

interface TaRow {
  taTxnId: string; amount: number; transactionType: string; effectiveDate: string
  fundName?: string; shareClass?: string; status?: string; currency?: string
}

interface PortalOrder {
  id: string; transactionId: string; transactionType: string; amount: number
  effectiveDate: Date; fundName: string | null; shareClass: string | null
  investorName: string | null; status: string | null
}

interface ExceptionData {
  exceptionType: "STAGE_MISMATCH" | "AMOUNT_FIELD_DIFF" | "MISSING_IN_PORTAL" | "MISSING_IN_TA"
  taTxnId: string | null; workbenchOrderId: string | null; amount: number
  fundName: string | null; fieldDiffs: Record<string, { portal: string | number; ta: string | number }> | null
}

async function runReconciliationEngine(runId: string) {
  const { orgId } = await getDemoContext()
  const run = await prisma.reconciliationRun.findUniqueOrThrow({
    where: { id: runId },
    include: { transferAgent: true, fund: true },
  })

  // Step 1: Parse TA rows from mapped preview
  const mappedRows = (run.previewRows as Record<string, string>[]) ?? []
  const taRows: TaRow[] = mappedRows.map((r) => ({
    taTxnId: r.taTxnId ?? "",
    amount: parseFloat(r.amount ?? "0") || 0,
    transactionType: r.transactionType ?? "",
    effectiveDate: r.effectiveDate ?? "",
    fundName: r.fundName, shareClass: r.shareClass, status: r.status, currency: r.currency,
  }))

  // Step 2: Load portal orders for this close cycle and org
  const cycleDate = new Date(run.closeCycle.toISOString().slice(0, 10))
  const nextDay = new Date(cycleDate)
  nextDay.setUTCDate(nextDay.getUTCDate() + 1)

  const portalOrders: PortalOrder[] = (
    await prisma.workbenchOrder.findMany({
      where: {
        organizationId: orgId,
        isExcluded: false,
        run: { closeCycle: { gte: cycleDate, lt: nextDay } },
      },
    })
  ).map((o) => ({
    id: o.id, transactionId: o.transactionId, transactionType: o.transactionType,
    amount: Number(o.amount), effectiveDate: o.effectiveDate,
    fundName: o.fundName, shareClass: o.shareClass, investorName: o.investorName, status: o.status,
  }))

  console.log(`[recon] closeCycle=${cycleDate.toISOString()}, portalOrders=${portalOrders.length}, taRows=${taRows.length}`)

  // Step 3: Match TA rows to portal orders
  const matchedPortalIds = new Set<string>()
  const exceptionData: ExceptionData[] = []
  let matchedCount = 0

  for (const taRow of taRows) {
    const taNumId = extractNumericId(taRow.taTxnId)

    // Primary match: shared reference
    let match = portalOrders.find(
      (p) => !matchedPortalIds.has(p.id) && extractNumericId(p.transactionId) === taNumId,
    )
    // Fallback match: composite
    if (!match) {
      const taDate = new Date(taRow.effectiveDate)
      match = portalOrders.find((p) => {
        if (matchedPortalIds.has(p.id)) return false
        const typeMatch = p.transactionType.toLowerCase() === taRow.transactionType.toLowerCase()
        const amountMatch = Math.abs(p.amount - taRow.amount) <= 500
        const dateDiff = Math.abs(p.effectiveDate.getTime() - taDate.getTime())
        const dateMatch = dateDiff <= 86400000 // 1 day
        return typeMatch && amountMatch && dateMatch
      })
    }

    if (!match) {
      // MISSING_IN_PORTAL
      exceptionData.push({
        exceptionType: "MISSING_IN_PORTAL", taTxnId: taRow.taTxnId,
        workbenchOrderId: null, amount: taRow.amount,
        fundName: taRow.fundName ?? null, fieldDiffs: null,
      })
      continue
    }

    matchedPortalIds.add(match.id)

    // Step 4: Classify matched pair
    const diffs: Record<string, { portal: string | number; ta: string | number }> = {}
    if (taRow.status && match.status && taRow.status.toLowerCase() !== match.status.toLowerCase()) {
      diffs.status = { portal: match.status, ta: taRow.status }
    }
    if (Math.abs(match.amount - taRow.amount) > 0.01) {
      diffs.amount = { portal: match.amount, ta: taRow.amount }
    }

    if (Object.keys(diffs).length === 0) {
      matchedCount++
      continue
    }

    const hasStatusDiff = "status" in diffs
    const hasAmountDiff = "amount" in diffs
    const exceptionType = hasStatusDiff ? "STAGE_MISMATCH" as const : "AMOUNT_FIELD_DIFF" as const

    exceptionData.push({
      exceptionType, taTxnId: taRow.taTxnId, workbenchOrderId: match.id,
      amount: taRow.amount, fundName: taRow.fundName ?? match.fundName, fieldDiffs: diffs,
    })
    // If both diffs, create a second exception for amount
    if (hasStatusDiff && hasAmountDiff) {
      exceptionData.push({
        exceptionType: "AMOUNT_FIELD_DIFF", taTxnId: taRow.taTxnId, workbenchOrderId: match.id,
        amount: taRow.amount, fundName: taRow.fundName ?? match.fundName,
        fieldDiffs: { amount: diffs.amount },
      })
    }
  }

  // Unmatched portal orders → MISSING_IN_TA
  for (const p of portalOrders) {
    if (!matchedPortalIds.has(p.id)) {
      exceptionData.push({
        exceptionType: "MISSING_IN_TA", taTxnId: null, workbenchOrderId: p.id,
        amount: p.amount, fundName: p.fundName, fieldDiffs: null,
      })
    }
  }

  // Step 5 + 6: Create exceptions with persistence check and priority scoring
  const createdExcIds: string[] = []
  for (const exc of exceptionData) {
    // Persistence check
    let isPersistent = false
    let firstSeenAt: Date | null = null
    let firstSeenRunId: string | null = null
    if (exc.taTxnId) {
      const prior = await prisma.exception.findFirst({
        where: { organizationId: orgId, taTxnId: exc.taTxnId, exceptionType: exc.exceptionType },
        orderBy: { createdAt: "asc" },
      })
      if (prior) { isPersistent = true; firstSeenAt = prior.createdAt; firstSeenRunId = prior.runId }
    }

    // Priority scoring
    let priority = 5
    const amt = exc.amount
    if (exc.exceptionType === "MISSING_IN_TA" && amt > 200000) priority = 1
    else if (isPersistent) priority = Math.min(priority, 1) // 3+ prior runs → critical
    else if (exc.exceptionType === "AMOUNT_FIELD_DIFF") {
      const portalAmt = exc.fieldDiffs?.amount ? Number(exc.fieldDiffs.amount.portal) : amt
      const variance = Math.abs(amt - portalAmt)
      priority = variance > 10000 ? 2 : 3
    } else if (exc.exceptionType === "MISSING_IN_PORTAL" && amt > 100000) priority = 2
    else if (exc.exceptionType === "MISSING_IN_PORTAL") priority = 4
    else if (exc.exceptionType === "STAGE_MISMATCH") priority = 3
    // Timing issue → info
    if (exc.fieldDiffs && !("amount" in exc.fieldDiffs) && !("status" in exc.fieldDiffs)) priority = 5

    const created = await prisma.exception.create({
      data: {
        runId, organizationId: orgId, exceptionType: exc.exceptionType,
        taTxnId: exc.taTxnId, workbenchOrderId: exc.workbenchOrderId,
        amount: exc.amount, fundName: exc.fundName,
        fieldDiffs: exc.fieldDiffs ? JSON.parse(JSON.stringify(exc.fieldDiffs)) : undefined,
        aiPriority: priority, isPersistent, firstSeenRunId, firstSeenAt,
        resolution: ExceptionResolution.OPEN,
      },
    })
    createdExcIds.push(created.id)
  }

  // Step 7: AI root causes (batched)
  let rootCauses: Record<string, string> = {}
  if (createdExcIds.length > 0) {
    try {
      const excRecords = await prisma.exception.findMany({ where: { id: { in: createdExcIds } } })
      const excSummaries = excRecords.map((e) => ({
        exceptionId: e.id, type: e.exceptionType, taTxnId: e.taTxnId,
        amount: Number(e.amount), fundName: e.fundName,
        fieldDiffs: e.fieldDiffs, isPersistent: e.isPersistent,
      }))

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ai/generate-exception-root-causes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exceptions: excSummaries }),
        },
      )
      if (res.ok) {
        const data = (await res.json()) as { rootCauses: { exceptionId: string; rootCause: string }[] }
        for (const rc of data.rootCauses) rootCauses[rc.exceptionId] = rc.rootCause
      }
    } catch { /* AI unavailable — proceed without root causes */ }

    for (const excId of createdExcIds) {
      if (rootCauses[excId]) {
        await prisma.exception.update({ where: { id: excId }, data: { aiRootCause: rootCauses[excId] } })
      }
    }
  }

  // Step 8: RunDelta
  const previousRun = await prisma.reconciliationRun.findFirst({
    where: { fundId: run.fundId, transferAgentId: run.transferAgentId, id: { not: run.id }, status: ReconciliationStatus.COMPLETE },
    orderBy: { createdAt: "desc" },
  })

  const persistentCount = exceptionData.filter((_, i) => {
    // Check the created exceptions for persistence
    return false // We'll count from DB
  }).length
  const persistentFromDb = await prisma.exception.count({
    where: { runId, isPersistent: true },
  })

  let aiDeltaSummary = ""
  if (previousRun) {
    try {
      const prevExcCount = await prisma.exception.count({ where: { runId: previousRun.id } })
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ai/generate-summary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            distributorName: run.transferAgent.name,
            closeCycle: run.closeCycle.toISOString().slice(0, 10),
            rowsIngested: matchedCount,
            rowsExcluded: 0,
            rowsFlagged: exceptionData.length,
            aiQualityScore: Math.round((matchedCount / Math.max(taRows.length, 1)) * 100),
            flagBreakdown: [],
          }),
        },
      )
      if (res.ok) {
        const data = (await res.json()) as { summary: string }
        aiDeltaSummary = data.summary
      }
    } catch { /* proceed */ }
  }

  await prisma.runDelta.create({
    data: {
      runId, previousRunId: previousRun?.id ?? null,
      newExceptions: exceptionData.length,
      resolvedExceptions: 0,
      persistentExceptions: persistentFromDb,
      aiDeltaSummary: aiDeltaSummary || `${exceptionData.length} exceptions found in this run.`,
    },
  })

  // Step 9: Generate run narrative and update
  const matchRate = taRows.length > 0 ? Math.round((matchedCount / taRows.length) * 1000) / 10 : 100
  let aiNarrative = `${matchedCount} of ${taRows.length} TA rows matched against ${portalOrders.length} portal orders (${matchRate}% match rate). ${exceptionData.length} exceptions identified.`
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ai/generate-summary`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distributorName: run.transferAgent.name,
          closeCycle: run.closeCycle.toISOString().slice(0, 10),
          rowsIngested: matchedCount,
          rowsExcluded: exceptionData.length,
          rowsFlagged: exceptionData.length,
          aiQualityScore: Math.round(matchRate),
          flagBreakdown: Object.entries(
            exceptionData.reduce<Record<string, number>>((acc, e) => {
              acc[e.exceptionType] = (acc[e.exceptionType] ?? 0) + 1; return acc
            }, {}),
          ).map(([type, count]) => ({ type, count })),
        }),
      },
    )
    if (res.ok) { aiNarrative = ((await res.json()) as { summary: string }).summary }
  } catch { /* use fallback */ }

  await prisma.reconciliationRun.update({
    where: { id: runId },
    data: {
      status: ReconciliationStatus.COMPLETE,
      matchedCount, issuesCount: exceptionData.length, matchRate,
      portalOrderCount: portalOrders.length, aiNarrative, completedAt: new Date(),
    },
  })

  revalidatePath("/wealth/reconciliation")
}

// ─── updateExceptionResolution ─────────────────────────────────────────────────

export async function updateExceptionResolution(input: {
  exceptionId: string; resolution: string; resolutionReason?: string; resolutionNote?: string
}): Promise<{ success: boolean }> {
  try {
    await prisma.exception.update({
      where: { id: input.exceptionId },
      data: {
        resolution: input.resolution as ExceptionResolution,
        resolutionReason: input.resolutionReason ?? null,
        resolutionNote: input.resolutionNote ?? null,
      },
    })
    return { success: true }
  } catch (err) {
    console.error("updateExceptionResolution error:", err)
    return { success: false }
  }
}

// ─── createCase ────────────────────────────────────────────────────────────────

export async function createCase(input: {
  title: string; counterpartyType: string; counterpartyId: string
  exceptionIds: string[]
  sendComm: boolean; subject?: string; body?: string
}): Promise<{ success: boolean; caseId?: string }> {
  try {
    const { orgId, userId } = await getDemoContext()
    const newCase = await prisma.case.create({
      data: {
        organizationId: orgId, title: input.title,
        counterpartyType: input.counterpartyType, counterpartyId: input.counterpartyId,
        items: { create: input.exceptionIds.map((eid) => ({ exceptionId: eid })) },
      },
    })

    if (input.sendComm && input.subject && input.body) {
      await prisma.caseComm.create({
        data: {
          caseId: newCase.id, direction: "OUTBOUND",
          subject: input.subject, body: input.body, sentBy: userId,
        },
      })
      await prisma.exception.updateMany({
        where: { id: { in: input.exceptionIds } },
        data: { resolution: ExceptionResolution.COMMUNICATED },
      })
    }

    revalidatePath("/wealth/reconciliation")
    return { success: true, caseId: newCase.id }
  } catch (err) {
    console.error("createCase error:", err)
    return { success: false }
  }
}

// ─── generateCaseDraft ─────────────────────────────────────────────────────────

export async function generateCaseDraft(input: {
  counterpartyName: string; counterpartyType: string; fundName: string
  closeCycle: string; exceptionSummaries: string
}): Promise<{ subject: string; body: string }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ai/generate-case-draft`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    )
    if (res.ok) return (await res.json()) as { subject: string; body: string }
  } catch { /* fallback */ }
  return { subject: `Exception Notification — ${input.fundName}`, body: "" }
}

// ─── createTransferAgent ───────────────────────────────────────────────────────

export async function createTransferAgent(name: string): Promise<{
  success: boolean; transferAgent?: { id: string; name: string }
}> {
  try {
    const { orgId } = await getDemoContext()
    const ta = await prisma.transferAgent.create({ data: { name, organizationId: orgId } })
    return { success: true, transferAgent: { id: ta.id, name: ta.name } }
  } catch (err) {
    console.error("createTransferAgent error:", err)
    return { success: false }
  }
}
