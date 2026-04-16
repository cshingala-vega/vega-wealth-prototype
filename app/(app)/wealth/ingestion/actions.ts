"use server"

import { prisma } from "@/lib/prisma"
import { IngestionStatus } from "@/lib/generated/prisma/client"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { revalidatePath } from "next/cache"

// Hard-coded org/user context for prototype (no auth session yet)
const DEMO_ORG_ID = "celestial"  // We query by slug
const DEMO_USER_EMAIL = "ops@celestial.com"

async function getDemoContext() {
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "celestial" } })
  const user = await prisma.user.findUniqueOrThrow({ where: { email: DEMO_USER_EMAIL } })
  return { orgId: org.id, userId: user.id }
}

// ─── Parse file headers and preview rows ──────────────────────────────────────

function parseFileBuffer(
  buffer: Buffer,
  fileName: string,
): { columns: string[]; previewRows: Record<string, string>[] } {
  const ext = fileName.split(".").pop()?.toLowerCase()

  if (ext === "csv") {
    const text = buffer.toString("utf-8")
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    })
    const columns = result.meta.fields ?? []
    const previewRows = (result.data as Record<string, string>[]).slice(0, 50)
    return { columns, previewRows }
  }

  // xlsx / xls
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" })
  const columns = rows.length > 0 ? Object.keys(rows[0]) : []
  const previewRows = rows.slice(0, 50)
  return { columns, previewRows }
}

// ─── createIngestionRun ────────────────────────────────────────────────────────

export async function createIngestionRun(formData: FormData): Promise<{
  success: boolean
  runId?: string
  error?: string
}> {
  try {
    const { orgId, userId } = await getDemoContext()

    const distributorId = formData.get("distributorId") as string
    const closeCycleStr = formData.get("closeCycle") as string
    const file = formData.get("file") as File

    if (!distributorId || !closeCycleStr || !file) {
      return { success: false, error: "Missing required fields" }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const { columns, previewRows } = parseFileBuffer(buffer, file.name)

    if (columns.length === 0) {
      return { success: false, error: "File appears to be empty" }
    }

    const run = await prisma.ingestionRun.create({
      data: {
        distributorId,
        organizationId: orgId,
        userId,
        closeCycle: new Date(closeCycleStr),
        fileName: file.name,
        detectedColumns: columns,
        previewRows: previewRows as object[],
        status: IngestionStatus.PENDING,
        rowsProcessed: previewRows.length,
      },
    })

    return { success: true, runId: run.id }
  } catch (err) {
    console.error("createIngestionRun error:", err)
    return { success: false, error: "Failed to create ingestion run" }
  }
}

// ─── saveColumnMapping ─────────────────────────────────────────────────────────

export async function saveColumnMapping(input: {
  runId: string
  mapping: Record<string, string>
  saveTemplate: boolean
  templateName: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { orgId } = await getDemoContext()

    const run = await prisma.ingestionRun.findUniqueOrThrow({
      where: { id: input.runId },
      include: { distributor: true },
    })

    let templateId: string | undefined

    if (input.saveTemplate) {
      // Unset previous default for this distributor
      await prisma.columnMappingTemplate.updateMany({
        where: { distributorId: run.distributorId, organizationId: orgId, isDefault: true },
        data: { isDefault: false },
      })

      // Upsert: update existing template with same name, or create new
      const existing = await prisma.columnMappingTemplate.findFirst({
        where: {
          distributorId: run.distributorId,
          organizationId: orgId,
          name: input.templateName,
        },
      })

      const template = existing
        ? await prisma.columnMappingTemplate.update({
            where: { id: existing.id },
            data: { mappingJson: input.mapping, isDefault: true, lastUsedAt: new Date() },
          })
        : await prisma.columnMappingTemplate.create({
            data: {
              distributorId: run.distributorId,
              organizationId: orgId,
              name: input.templateName,
              mappingJson: input.mapping,
              isDefault: true,
              lastUsedAt: new Date(),
            },
          })

      templateId = template.id
    }

    // Build preview rows with mapped headers
    const previewRows = run.previewRows as Record<string, string>[] | null

    await prisma.ingestionRun.update({
      where: { id: input.runId },
      data: {
        status: IngestionStatus.REVIEW,
        templateId,
        // Store mapped preview rows for review step
        previewRows: previewRows
          ? previewRows.map((row) => {
              const mapped: Record<string, string> = {}
              Object.entries(input.mapping).forEach(([schemaField, sourceCol]) => {
                if (sourceCol && sourceCol !== "") {
                  mapped[schemaField] = row[sourceCol] ?? ""
                }
              })
              return mapped
            })
          : [],
      },
    })

    return { success: true }
  } catch (err) {
    console.error("saveColumnMapping error:", err)
    return { success: false, error: "Failed to save mapping" }
  }
}

// ─── commitIngestionRun ────────────────────────────────────────────────────────

type AiFlag = { type: string; reason: string }

function computeQualityScore(flags: AiFlag[]): number {
  const deductions: Record<string, number> = {
    MISSING_REQUIRED: 5,
    FUND_NOT_RECOGNISED: 3,
    POSSIBLE_DUPLICATE: 2,
    POTENTIAL_NIGO: 4,
  }
  let score = 100
  for (const flag of flags) {
    score -= deductions[flag.type] ?? 0
  }
  return Math.max(0, score)
}

function detectFlags(row: Record<string, string>, knownFundAliases: string[]): AiFlag[] {
  const flags: AiFlag[] = []
  const required = ["transactionId", "amount", "transactionType", "effectiveDate"]

  for (const field of required) {
    if (!row[field] || row[field].trim() === "") {
      flags.push({ type: "MISSING_REQUIRED", reason: `${field} is missing or empty` })
    }
  }

  if (row.fundName && !knownFundAliases.includes(row.fundName.trim())) {
    flags.push({
      type: "FUND_NOT_RECOGNISED",
      reason: `Fund '${row.fundName}' not found in registry`,
    })
  }

  // Unrecognised transaction type is always a standalone POTENTIAL_NIGO
  const rawType = (row.transactionType ?? "").trim()
  if (rawType !== "" && rawType.toLowerCase() !== "subscription" && rawType.toLowerCase() !== "redemption") {
    flags.push({
      type: "POTENTIAL_NIGO",
      reason: `Unrecognised transaction type: ${rawType}`,
    })
  }

  // POTENTIAL_NIGO: 2+ of these conditions true
  let nigoCount = 0
  if (!row.investorName || row.investorName.trim() === "") nigoCount++
  if (!row.shareClass || row.shareClass.trim() === "") nigoCount++
  if (row.fundName && !knownFundAliases.includes(row.fundName.trim())) nigoCount++
  if (nigoCount >= 2) {
    flags.push({
      type: "POTENTIAL_NIGO",
      reason: "Multiple data quality issues detected on this row",
    })
  }

  return flags
}

export async function commitIngestionRun(input: {
  runId: string
  includedIndices: number[]
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { orgId } = await getDemoContext()

    const run = await prisma.ingestionRun.findUniqueOrThrow({
      where: { id: input.runId },
      include: { distributor: true },
    })

    const previewRows = (run.previewRows as Record<string, string>[]) ?? []
    const includedSet = new Set(input.includedIndices)

    // Load known fund aliases
    const funds = await prisma.fund.findMany({ where: { organizationId: orgId } })
    const knownAliases = funds.flatMap((f) => f.aliases)

    // Detect duplicates by transactionId within this batch
    const seenTxIds = new Map<string, number>()
    const allFlags: AiFlag[][] = previewRows.map((row, i) => {
      const rowFlags = detectFlags(row, knownAliases)
      const txId = row.transactionId?.trim() ?? ""
      if (txId) {
        if (seenTxIds.has(txId)) {
          rowFlags.push({
            type: "POSSIBLE_DUPLICATE",
            reason: `Possible duplicate of row ${(seenTxIds.get(txId) ?? 0) + 1}`,
          })
        } else {
          seenTxIds.set(txId, i)
        }
      }
      return rowFlags
    })

    const committedRows = previewRows.filter((_, i) => includedSet.has(i))
    const excludedCount = previewRows.length - includedSet.size
    const flaggedRows = committedRows.filter((_, i) => {
      const originalIndex = [...includedSet][i]
      return allFlags[originalIndex]?.length > 0
    })

    // Compute quality score across all committed rows' flags
    const allCommittedFlags = [...includedSet].flatMap((i) => allFlags[i] ?? [])
    const aiQualityScore = computeQualityScore(allCommittedFlags)

    // Generate AI summary
    let aiSummary = ""
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ai/generate-summary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            distributorName: run.distributor.name,
            closeCycle: run.closeCycle.toISOString().slice(0, 10),
            rowsIngested: committedRows.length,
            rowsExcluded: excludedCount,
            rowsFlagged: flaggedRows.length,
            aiQualityScore,
            flagBreakdown: Object.entries(
              allCommittedFlags.reduce<Record<string, number>>((acc, f) => {
                acc[f.type] = (acc[f.type] ?? 0) + 1
                return acc
              }, {}),
            ).map(([type, count]) => ({ type, count })),
          }),
        },
      )
      const data = (await res.json()) as { summary: string }
      aiSummary = data.summary
    } catch {
      aiSummary = `${committedRows.length} trades from ${run.distributor.name} were committed to the order book.`
    }

    // Write WorkbenchOrder records then update run
    const orderCreates = [...includedSet].map((i) => {
      const row = previewRows[i]
      const flags = allFlags[i] ?? []
      return prisma.workbenchOrder.create({
        data: {
          runId: run.id,
          organizationId: orgId,
          transactionId: row.transactionId ?? `TXN-${i}`,
          transactionType: row.transactionType ?? "Subscription",
          amount: parseFloat(row.amount ?? "0") || 0,
          effectiveDate: row.effectiveDate ? new Date(row.effectiveDate) : new Date(),
          fundName: row.fundName ?? null,
          shareClass: row.shareClass ?? null,
          investorName: row.investorName ?? null,
          status: row.status ?? "Committed",
          currency: row.currency ?? "USD",
          aiFlags: flags.length > 0 ? flags : undefined,
          isExcluded: false,
        },
      })
    })

    await prisma.$transaction([
      ...orderCreates,
      prisma.ingestionRun.update({
        where: { id: run.id },
        data: {
          status: IngestionStatus.COMMITTED,
          committedAt: new Date(),
          rowsProcessed: previewRows.length,
          rowsIngested: committedRows.length,
          rowsExcluded: excludedCount,
          rowsFlagged: flaggedRows.length,
          aiQualityScore,
          aiSummary,
        },
      }),
    ])

    revalidatePath("/wealth/ingestion")
    return { success: true }
  } catch (err) {
    console.error("commitIngestionRun error:", err)
    return { success: false, error: "Failed to commit ingestion run" }
  }
}

// ─── createDistributor ─────────────────────────────────────────────────────────

export async function createDistributor(name: string): Promise<{
  success: boolean
  distributor?: { id: string; name: string }
  error?: string
}> {
  try {
    const { orgId } = await getDemoContext()
    const distributor = await prisma.distributor.create({
      data: { name, organizationId: orgId },
    })
    revalidatePath("/wealth/ingestion/new")
    return { success: true, distributor: { id: distributor.id, name: distributor.name } }
  } catch (err) {
    console.error("createDistributor error:", err)
    return { success: false, error: "Failed to create distributor" }
  }
}
