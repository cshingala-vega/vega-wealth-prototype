import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { IngestionStatus } from "@/lib/generated/prisma/client"
import {
  PageWrapper,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderActions,
} from "@/components/vui/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/vui/card"
import { Button } from "@/components/vui/button"
import { Badge } from "@/components/vui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/vui/table"
import { Plus } from "lucide-react"

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function fmtDateTime(d: Date) {
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  )
}

function QualityBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground">—</span>
  const variant =
    score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"
  const className =
    score >= 80
      ? "bg-green-500/15 text-green-600 border-green-500/30"
      : score >= 60
        ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
        : "bg-red-500/15 text-red-600 border-red-500/30"
  return (
    <Badge variant={variant} className={className}>
      {score}/100
    </Badge>
  )
}

function StatusBadge({ status }: { status: IngestionStatus }) {
  const map: Record<IngestionStatus, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "bg-muted text-muted-foreground" },
    MAPPING: { label: "Mapping", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
    REVIEW: { label: "Review", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
    COMMITTED: {
      label: "Committed",
      className: "bg-green-500/15 text-green-600 border-green-500/30",
    },
  }
  const { label, className } = map[status]
  return <Badge className={className}>{label}</Badge>
}

async function getOrgId() {
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "celestial" } })
  return org.id
}

export default async function IngestionHistoryPage() {
  const orgId = await getOrgId()

  const runs = await prisma.ingestionRun.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    include: { distributor: true, user: true },
  })

  const committed = runs.filter((r) => r.status === IngestionStatus.COMMITTED)
  const runsThisMonth = runs.filter((r) => {
    const now = new Date()
    return r.createdAt.getMonth() === now.getMonth() && r.createdAt.getFullYear() === now.getFullYear()
  }).length
  const totalRowsIngested = committed.reduce((s, r) => s + r.rowsIngested, 0)
  const scoresWithValue = committed.filter((r) => r.aiQualityScore !== null)
  const avgScore =
    scoresWithValue.length > 0
      ? Math.round(
          scoresWithValue.reduce((s, r) => s + (r.aiQualityScore ?? 0), 0) /
            scoresWithValue.length,
        )
      : null

  return (
    <PageWrapper>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Ingestion</PageHeaderTitle>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button asChild>
            <Link href="/wealth/ingestion/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Ingestion
            </Link>
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <PageContent className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Runs this month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{runsThisMonth}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total rows ingested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalRowsIngested.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg AI quality score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {avgScore !== null ? (
                <QualityBadge score={avgScore} />
              ) : (
                <p className="text-3xl font-bold text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History table */}
        <Card>
          {runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-muted-foreground">
                No ingestion runs yet. Upload your first distributor file to get started.
              </p>
              <Button asChild>
                <Link href="/wealth/ingestion/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Ingestion
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Time</TableHead>
                  <TableHead>Distributor</TableHead>
                  <TableHead>Close Cycle</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead className="text-right">Rows Processed</TableHead>
                  <TableHead className="text-right">Rows Added</TableHead>
                  <TableHead className="text-right">Rows Flagged</TableHead>
                  <TableHead>AI Quality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow
                    key={run.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={undefined}
                  >
                    <TableCell>
                      <Link href={`/wealth/ingestion/${run.id}`} className="block">
                        <span className="text-sm">{fmtDateTime(run.createdAt)}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/wealth/ingestion/${run.id}`} className="block font-medium">
                        {run.distributor.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/wealth/ingestion/${run.id}`} className="block">
                        {fmtDate(run.closeCycle)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/wealth/ingestion/${run.id}`}
                        className="block max-w-[180px] truncate text-sm text-muted-foreground"
                      >
                        {run.fileName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{run.rowsProcessed}</TableCell>
                    <TableCell className="text-right">{run.rowsIngested}</TableCell>
                    <TableCell className="text-right">
                      {run.rowsFlagged > 0 ? (
                        <span className="text-amber-600">{run.rowsFlagged}</span>
                      ) : (
                        run.rowsFlagged
                      )}
                    </TableCell>
                    <TableCell>
                      <QualityBadge score={run.aiQualityScore} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={run.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {run.user.name ?? run.user.email}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageContent>
    </PageWrapper>
  )
}
