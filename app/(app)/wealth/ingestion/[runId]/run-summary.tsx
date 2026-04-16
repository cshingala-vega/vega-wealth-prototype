"use client"

import Link from "next/link"
import {
  PageWrapper,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
} from "@/components/vui/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/vui/card"
import { Button } from "@/components/vui/button"
import { Badge } from "@/components/vui/badge"
import { Alert } from "@/components/vui/alert"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/vui/tooltip"
import { CheckCircle, ChevronDown, Info, Lock } from "lucide-react"
import { useState } from "react"

type AiFlag = { type: string; reason: string }

interface RunInfo {
  id: string
  fileName: string
  distributorName: string
  closeCycle: string
  closeCycleRaw: string
  committedAt: string
  committedBy: string
  templateName: string
  rowsProcessed: number
  rowsIngested: number
  rowsExcluded: number
  rowsFlagged: number
  aiQualityScore: number | null
  aiSummary: string | null
}

interface FlaggedOrder {
  transactionId: string
  transactionType: string
  amount: number
  fundName: string | null
  investorName: string | null
  flags: AiFlag[]
}

interface RunSummaryProps {
  run: RunInfo
  distributorAvgScore: number | null
  isFirstRun: boolean
  flaggedOrders: FlaggedOrder[]
  isReadOnly: boolean
}

const FLAG_LABELS: Record<string, string> = {
  POTENTIAL_NIGO: "Potential NIGO",
  POSSIBLE_DUPLICATE: "Possible Duplicate",
  FUND_NOT_RECOGNISED: "Fund Not Recognised",
  MISSING_REQUIRED: "Missing Required Field",
}

function StepIndicator({ allDone }: { allDone: boolean }) {
  const steps = ["Upload", "Column Mapping", "Review", "Summary"]
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-semibold text-white">
              ✓
            </div>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </div>
          {i < steps.length - 1 && <div className="mx-4 h-px w-12 bg-green-500/50" />}
        </div>
      ))}
    </div>
  )
}

function QualityScore({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-600"
  return <span className={`text-5xl font-bold ${color}`}>{score}</span>
}

export function RunSummary({
  run,
  distributorAvgScore,
  isFirstRun,
  flaggedOrders,
  isReadOnly,
}: RunSummaryProps) {
  const [flaggedOpen, setFlaggedOpen] = useState(false)

  const benchmarkText = isFirstRun
    ? "First run for this distributor"
    : distributorAvgScore !== null && run.aiQualityScore !== null
      ? `${run.aiQualityScore >= distributorAvgScore ? "Above" : run.aiQualityScore === distributorAvgScore ? "In line with" : "Below"} your average for ${run.distributorName} (${distributorAvgScore}/100)`
      : ""

  return (
    <TooltipProvider>
      <PageWrapper>
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>
              {isReadOnly ? "Run Detail" : "Ingestion Complete"}
            </PageHeaderTitle>
          </PageHeaderContent>
        </PageHeader>
        <PageContent className="space-y-6">
          {/* Step indicator (or read-only banner) */}
          {isReadOnly ? (
            <Alert className="flex items-center gap-2 border-muted bg-muted/30 text-muted-foreground">
              <Lock className="h-4 w-4 shrink-0" />
              <span className="text-sm">
                Read-only — this run was committed on {run.committedAt}.
              </span>
            </Alert>
          ) : (
            <div className="space-y-3">
              <StepIndicator allDone />
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">
                  {run.rowsIngested} rows successfully committed to the order book
                </span>
              </div>
            </div>
          )}

          {/* Run detail card */}
          <Card>
            <CardHeader>
              <CardTitle>Run details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                {[
                  { label: "Distributor", value: run.distributorName },
                  { label: "Close Cycle", value: run.closeCycle },
                  { label: "File Name", value: run.fileName },
                  { label: "Committed At", value: run.committedAt },
                  { label: "Committed By", value: run.committedBy },
                  { label: "Mapping Template", value: run.templateName },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Rows Processed", value: run.rowsProcessed },
              { label: "Rows Added", value: run.rowsIngested },
              { label: "Rows Excluded", value: run.rowsExcluded },
              { label: "Rows Flagged", value: run.rowsFlagged },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Quality Score */}
          {run.aiQualityScore !== null && (
            <Card>
              <CardContent className="pt-6 flex items-end gap-3">
                <QualityScore score={run.aiQualityScore} />
                <div className="pb-1">
                  <p className="text-sm font-medium">AI Quality Score</p>
                  <p className="text-sm text-muted-foreground">{benchmarkText}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Narrative */}
          {run.aiSummary && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4 text-primary" />
                  AI Ingestion Narrative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{run.aiSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Flagged rows collapsible */}
          {flaggedOrders.length > 0 && (
            <Collapsible open={flaggedOpen} onOpenChange={setFlaggedOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="flex cursor-pointer flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      Flagged Rows ({flaggedOrders.length})
                    </CardTitle>
                    <ChevronDown
                      className={[
                        "h-4 w-4 text-muted-foreground transition-transform",
                        flaggedOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Fund</TableHead>
                          <TableHead>Investor</TableHead>
                          <TableHead>Flag Type</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flaggedOrders.map((o, i) =>
                          o.flags.map((f, fi) => (
                            <TableRow key={`${i}-${fi}`}>
                              {fi === 0 && (
                                <>
                                  <TableCell className="font-mono text-xs" rowSpan={o.flags.length}>
                                    {o.transactionId}
                                  </TableCell>
                                  <TableCell rowSpan={o.flags.length}>
                                    <Badge variant="secondary" className="text-xs">
                                      {o.transactionType}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-medium" rowSpan={o.flags.length}>
                                    ${o.amount.toLocaleString("en-US")}
                                  </TableCell>
                                  <TableCell className="text-sm" rowSpan={o.flags.length}>
                                    {o.fundName ?? "—"}
                                  </TableCell>
                                  <TableCell className="text-sm" rowSpan={o.flags.length}>
                                    {o.investorName ?? "—"}
                                  </TableCell>
                                </>
                              )}
                              <TableCell>
                                <Badge className="text-xs bg-amber-500/15 text-amber-700 border-amber-500/30">
                                  {FLAG_LABELS[f.type] ?? f.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {f.reason}
                              </TableCell>
                            </TableRow>
                          )),
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {!isReadOnly && (
              <Button asChild>
                <Link href={`/wealth/reconciliation/new?closeCycle=${run.closeCycleRaw}`}>
                  Start Reconciliation
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/wealth/ingestion">← Back to Ingestion</Link>
            </Button>
          </div>
        </PageContent>
      </PageWrapper>
    </TooltipProvider>
  )
}
