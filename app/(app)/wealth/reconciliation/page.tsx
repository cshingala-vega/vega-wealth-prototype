import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ExceptionResolution, ReconciliationStatus } from "@/lib/generated/prisma/client"
import {
  PageWrapper, PageContent, PageHeader, PageHeaderContent, PageHeaderTitle, PageHeaderActions,
} from "@/components/vui/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/vui/card"
import { Button } from "@/components/vui/button"
import { Badge } from "@/components/vui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/vui/table"
import { Plus } from "lucide-react"
import { AiBriefing, MatchRateChart } from "./dashboard-client"

function fmtUsd(n: number) { return `$${n.toLocaleString("en-US")}` }

async function getOrgId() {
  return (await prisma.organization.findUniqueOrThrow({ where: { slug: "celestial" } })).id
}

export default async function ReconciliationDashboardPage() {
  const orgId = await getOrgId()

  // Metrics
  const openCount = await prisma.exception.count({
    where: { organizationId: orgId, resolution: ExceptionResolution.OPEN },
  })
  const latestRun = await prisma.reconciliationRun.findFirst({
    where: { organizationId: orgId, status: ReconciliationStatus.COMPLETE },
    orderBy: { createdAt: "desc" },
  })
  const matchRate = latestRun?.matchRate ?? null

  const oldestOpen = await prisma.exception.findFirst({
    where: { organizationId: orgId, resolution: ExceptionResolution.OPEN },
    orderBy: { createdAt: "asc" },
  })
  const longestOpenDays = oldestOpen
    ? Math.floor((Date.now() - oldestOpen.createdAt.getTime()) / 86400000)
    : 0

  // Open exceptions for the queue
  const openExceptions = await prisma.exception.findMany({
    where: { organizationId: orgId, resolution: { in: [ExceptionResolution.OPEN, ExceptionResolution.COMMUNICATED] } },
    orderBy: { aiPriority: "asc" },
    include: { run: { include: { transferAgent: true } } },
  })

  // Match rate trend — last 10 runs
  const recentRuns = await prisma.reconciliationRun.findMany({
    where: { organizationId: orgId, status: ReconciliationStatus.COMPLETE },
    orderBy: { createdAt: "asc" },
    take: 10,
    include: { transferAgent: true },
  })

  // AI briefing data
  const highPriority = openExceptions.filter((e) => e.aiPriority <= 2).length
  const persistentCount = openExceptions.filter((e) => e.isPersistent).length
  const topExceptions = openExceptions.slice(0, 5).map((e) => ({
    type: e.exceptionType,
    amount: Number(e.amount),
    fund: e.fundName ?? "Unknown",
    daysOpen: Math.floor((Date.now() - e.createdAt.getTime()) / 86400000),
    isPersistent: e.isPersistent,
  }))

  const chartData = recentRuns.map((r) => ({
    date: r.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    matchRate: r.matchRate ?? 0,
    ta: r.transferAgent.name,
  }))

  const hasRuns = recentRuns.length > 0

  return (
    <PageWrapper>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Reconciliation</PageHeaderTitle>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button asChild>
            <Link href="/wealth/reconciliation/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Reconciliation
            </Link>
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <PageContent className="space-y-6">
        {!hasRuns ? (
          <Card>
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-muted-foreground">
                No reconciliation runs yet. Upload your first TA ledger to get started.
              </p>
              <Button asChild>
                <Link href="/wealth/reconciliation/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Reconciliation
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* AI Briefing */}
            <AiBriefing
              briefingInput={{
                openExceptions: openCount,
                highPriorityCount: highPriority,
                persistentCount,
                longestOpenDays,
                topExceptions,
              }}
            />

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Open Exceptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{openCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Latest Match Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {matchRate !== null ? (
                    <Badge className={matchRate >= 90 ? "bg-green-500/15 text-green-600 border-green-500/30" : matchRate >= 75 ? "bg-amber-500/15 text-amber-600 border-amber-500/30" : "bg-red-500/15 text-red-600 border-red-500/30"}>
                      {matchRate}%
                    </Badge>
                  ) : (
                    <p className="text-3xl font-bold text-muted-foreground">—</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Longest Open Exception</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{longestOpenDays > 0 ? `${longestOpenDays}d` : "—"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Split view: exception queue + chart */}
            <div className="grid grid-cols-5 gap-4">
              {/* Exception queue (60%) */}
              <div className="col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Open Exception Queue</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Priority</TableHead>
                          <TableHead>TA Txn ID</TableHead>
                          <TableHead>Exception Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Fund</TableHead>
                          <TableHead className="text-right">Days</TableHead>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {openExceptions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No open exceptions.
                            </TableCell>
                          </TableRow>
                        ) : (
                          openExceptions.map((exc) => {
                            const days = Math.floor((Date.now() - exc.createdAt.getTime()) / 86400000)
                            const priorityColors: Record<number, string> = {
                              1: "bg-red-500", 2: "bg-orange-500", 3: "bg-amber-500", 4: "bg-blue-500", 5: "bg-gray-400",
                            }
                            const typeLabels: Record<string, string> = {
                              STAGE_MISMATCH: "Stage Mismatch",
                              AMOUNT_FIELD_DIFF: "Amount/Field Diff",
                              MISSING_IN_PORTAL: "Missing in Portal",
                              MISSING_IN_TA: "Missing in TA",
                            }
                            return (
                              <TableRow key={exc.id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell>
                                  <Link href={`/wealth/reconciliation/${exc.runId}/results?highlight=${exc.id}`} className="block">
                                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${priorityColors[exc.aiPriority] ?? "bg-gray-400"}`} />
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <Link href={`/wealth/reconciliation/${exc.runId}/results?highlight=${exc.id}`} className="block font-mono text-xs">
                                    {exc.taTxnId ?? "—"}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <Badge className="text-xs bg-muted text-muted-foreground">
                                    {typeLabels[exc.exceptionType] ?? exc.exceptionType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">{fmtUsd(Number(exc.amount))}</TableCell>
                                <TableCell className="text-sm max-w-[100px] truncate">{exc.fundName ?? "—"}</TableCell>
                                <TableCell className="text-right text-sm">{days}</TableCell>
                                <TableCell>{exc.isPersistent && <span title="Persistent">🔥</span>}</TableCell>
                                <TableCell>
                                  <Badge className={exc.resolution === "OPEN" ? "bg-red-500/15 text-red-600 border-red-500/30" : "bg-amber-500/15 text-amber-600 border-amber-500/30"}>
                                    {exc.resolution === "OPEN" ? "Open" : "Communicated"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Match rate chart (40%) */}
              <div className="col-span-2">
                <MatchRateChart data={chartData} />
              </div>
            </div>
          </>
        )}
      </PageContent>
    </PageWrapper>
  )
}
