"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  PageWrapper,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
} from "@/components/vui/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/vui/card"
import { Button } from "@/components/vui/button"
import { Badge } from "@/components/vui/badge"
import { Checkbox } from "@/components/vui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/vui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/vui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/vui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/vui/tooltip"
import { ChevronDown, Flag, AlertCircle } from "lucide-react"
import { commitIngestionRun } from "../../actions"

type FlagType = "POTENTIAL_NIGO" | "POSSIBLE_DUPLICATE" | "FUND_NOT_RECOGNISED" | "MISSING_REQUIRED"
interface AiFlag { type: FlagType; reason: string }
interface RowWithFlags { row: Record<string, string>; flags: AiFlag[] }

interface RunInfo {
  id: string
  fileName: string
  distributorName: string
  templateName: string | null
}

interface ReviewClientProps {
  run: RunInfo
  rowsWithFlags: RowWithFlags[]
  aiQualityScore: number
  flagBreakdown: Record<string, number>
  distributorAvgScore: number | null
  isFirstRun: boolean
}

const FLAG_META: Record<FlagType, { label: string; emoji: string; className: string }> = {
  POTENTIAL_NIGO: { label: "Potential NIGO", emoji: "🟡", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  POSSIBLE_DUPLICATE: { label: "Possible Duplicate", emoji: "🔵", className: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  FUND_NOT_RECOGNISED: { label: "Fund Not Recognised", emoji: "🔴", className: "bg-red-500/15 text-red-700 border-red-500/30" },
  MISSING_REQUIRED: { label: "Missing Required Field", emoji: "⚠️", className: "bg-orange-500/15 text-orange-700 border-orange-500/30" },
}

function StepIndicator({ current }: { current: number }) {
  const steps = ["Upload", "Column Mapping", "Review", "Summary"]
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const step = i + 1
        const isActive = step === current
        const isDone = step < current
        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={["flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold", isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"].join(" ")}>
                {isDone ? "✓" : step}
              </div>
              <span className={["text-sm", isActive ? "font-medium text-foreground" : "text-muted-foreground"].join(" ")}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="mx-4 h-px w-12 bg-border" />}
          </div>
        )
      })}
    </div>
  )
}

function QualityScore({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-600"
  return <span className={`text-5xl font-bold ${color}`}>{score}</span>
}

const PAGE_SIZE = 50

export function ReviewClient({
  run,
  rowsWithFlags,
  aiQualityScore,
  flagBreakdown,
  distributorAvgScore,
  isFirstRun,
}: ReviewClientProps) {
  const router = useRouter()
  const [checked, setChecked] = useState<Set<number>>(
    () => new Set(rowsWithFlags.map((_, i) => i)),
  )
  const [page, setPage] = useState(0)
  const [preflight, setPreflight] = useState(true)
  const [committing, setCommitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const totalPages = Math.ceil(rowsWithFlags.length / PAGE_SIZE)
  const pageRows = rowsWithFlags.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function toggleRow(i: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function toggleAll() {
    if (checked.size === rowsWithFlags.length) setChecked(new Set())
    else setChecked(new Set(rowsWithFlags.map((_, i) => i)))
  }

  const includedCount = checked.size
  const excludedCount = rowsWithFlags.length - checked.size
  const flaggedIncluded = [...checked].filter((i) => rowsWithFlags[i].flags.length > 0).length
  const hasMissingRequired = [...checked].some((i) =>
    rowsWithFlags[i].flags.some((f) => f.type === "MISSING_REQUIRED"),
  )

  async function doCommit() {
    setCommitting(true)
    const result = await commitIngestionRun({
      runId: run.id,
      includedIndices: [...checked],
    })
    setCommitting(false)
    if (result.success) {
      router.push(`/wealth/ingestion/${run.id}/summary`)
    }
  }

  function handleCommit() {
    if (hasMissingRequired) {
      setShowWarning(true)
    } else {
      void doCommit()
    }
  }

  const benchmarkText = isFirstRun
    ? "First run for this distributor"
    : distributorAvgScore !== null
      ? `${aiQualityScore >= distributorAvgScore ? "Above" : aiQualityScore === distributorAvgScore ? "In line with" : "Below"} your average for ${run.distributorName} (${distributorAvgScore}/100)`
      : ""

  const flagTypes = Object.keys(flagBreakdown) as FlagType[]

  return (
    <TooltipProvider>
      <PageWrapper>
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>Review & Commit</PageHeaderTitle>
            <PageHeaderDescription>{run.fileName}</PageHeaderDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent className="space-y-6 pb-24">
          <StepIndicator current={3} />

          {/* AI Pre-flight panel */}
          <Collapsible open={preflight} onOpenChange={setPreflight}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="flex cursor-pointer flex-row items-center justify-between">
                  <CardTitle className="text-base">AI Pre-flight Check</CardTitle>
                  <ChevronDown
                    className={[
                      "h-4 w-4 text-muted-foreground transition-transform",
                      preflight ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {/* Score */}
                  <div className="flex items-end gap-3">
                    <QualityScore score={aiQualityScore} />
                    <div className="pb-1">
                      <p className="text-sm font-medium">AI Quality Score</p>
                      <p className="text-sm text-muted-foreground">{benchmarkText}</p>
                    </div>
                  </div>

                  {/* Flag pills */}
                  {flagTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {flagTypes.map((type) => {
                        const meta = FLAG_META[type]
                        return (
                          <Badge key={type} className={meta.className}>
                            {meta.emoji} {meta.label} ({flagBreakdown[type]})
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  {flagTypes.length === 0 && (
                    <p className="text-sm text-muted-foreground">No flags detected. All rows look clean.</p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Trades table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checked.size === rowsWithFlags.length}
                  onCheckedChange={toggleAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  {checked.size === rowsWithFlags.length ? "Deselect all" : "Select all"}
                </label>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ←
                  </Button>
                  Page {page + 1} / {totalPages}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    →
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead className="w-8">✓</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Fund</TableHead>
                    <TableHead>Share Class</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead className="w-16">Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map(({ row, flags }, pageI) => {
                    const globalI = page * PAGE_SIZE + pageI
                    const isFlagged = flags.length > 0
                    return (
                      <TableRow
                        key={globalI}
                        className={isFlagged ? "border-l-2 border-l-amber-500" : undefined}
                      >
                        <TableCell className="text-muted-foreground text-xs">{globalI + 1}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={checked.has(globalI)}
                            onCheckedChange={() => toggleRow(globalI)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{row.transactionId ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={row.transactionType === "Subscription" ? "default" : "secondary"} className="text-xs">
                            {row.transactionType ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {row.amount
                            ? `$${parseFloat(row.amount).toLocaleString("en-US", { minimumFractionDigits: 0 })}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.effectiveDate
                            ? new Date(row.effectiveDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm max-w-[120px] truncate">{row.fundName ?? "—"}</TableCell>
                        <TableCell className="text-sm">{row.shareClass ?? "—"}</TableCell>
                        <TableCell className="text-sm max-w-[120px] truncate">{row.investorName ?? "—"}</TableCell>
                        <TableCell>
                          {isFlagged && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Flag className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <ul className="space-y-1">
                                  {flags.map((f, fi) => (
                                    <li key={fi} className="text-xs">
                                      <strong>{FLAG_META[f.type]?.label ?? f.type}:</strong> {f.reason}
                                    </li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </PageContent>

        {/* Sticky commit bar */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur px-6 py-4 ml-[var(--sidebar-width,240px)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-6 text-sm">
              <span>
                <span className="font-semibold">{includedCount}</span>{" "}
                <span className="text-muted-foreground">to commit</span>
              </span>
              <span>
                <span className="font-semibold">{excludedCount}</span>{" "}
                <span className="text-muted-foreground">excluded</span>
              </span>
              <span>
                <span className="font-semibold text-amber-600">{flaggedIncluded}</span>{" "}
                <span className="text-muted-foreground">flagged</span>
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/wealth/ingestion/${run.id}/mapping`)}
              >
                ← Back
              </Button>
              <Button
                onClick={handleCommit}
                disabled={includedCount === 0 || committing}
              >
                {committing ? "Committing…" : "Commit to Order Book"}
              </Button>
            </div>
          </div>
          {includedCount === 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              No rows selected. Select at least one row to commit.
            </p>
          )}
        </div>

        {/* Commit warning dialog */}
        <Dialog open={showWarning} onOpenChange={setShowWarning}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rows with missing required fields</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-2">
              {[...checked].filter((i) => rowsWithFlags[i].flags.some((f) => f.type === "MISSING_REQUIRED")).length} rows with missing required fields are included. These may cause issues during reconciliation. Are you sure you want to commit them?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWarning(false)}>
                Review flagged rows
              </Button>
              <Button
                onClick={() => {
                  setShowWarning(false)
                  void doCommit()
                }}
              >
                Commit anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageWrapper>
    </TooltipProvider>
  )
}
