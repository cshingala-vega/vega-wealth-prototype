"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  PageWrapper, PageContent, PageHeader, PageHeaderContent, PageHeaderTitle, PageHeaderActions,
} from "@/components/vui/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/vui/card"
import { Button } from "@/components/vui/button"
import { Badge } from "@/components/vui/badge"
import { Alert } from "@/components/vui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/vui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/vui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/vui/select"
import { Checkbox } from "@/components/vui/checkbox"
import { Input } from "@/components/vui/input"
import { Label } from "@/components/vui/label"
import { Textarea } from "@/components/vui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/vui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/vui/tooltip"
import { Skeleton } from "@/components/vui/skeleton"
import {
  ChevronDown, Eye, Briefcase, Info, X, AlertTriangle, Lock,
} from "lucide-react"
import { updateExceptionResolution, createCase, generateCaseDraft } from "../../actions"
import { toast } from "sonner"

interface ExceptionRow {
  id: string; exceptionType: string; taTxnId: string | null
  workbenchOrderId: string | null; portalTxnId: string | null
  amount: number; fundName: string | null
  fieldDiffs: Record<string, { portal: string | number; ta: string | number }> | null
  aiPriority: number; aiRootCause: string | null; isPersistent: boolean
  resolution: string; resolutionReason: string | null; resolutionNote: string | null
  daysOpen: number
  portalStatus: string | null; portalAmount: number | null
  portalFund: string | null; portalShareClass: string | null
  portalInvestor: string | null; portalType: string | null; portalDate: string | null
}

interface RunInfo {
  id: string; fileName: string; taName: string; fundName: string
  closeCycle: string; runDate: string
  taRowCount: number; portalOrderCount: number; matchedCount: number
  issuesCount: number; matchRate: number | null; aiNarrative: string | null
  transferAgentId: string
}

interface DeltaInfo { aiDeltaSummary: string | null; newExceptions: number; resolvedExceptions: number; persistentExceptions: number }

const TYPE_LABELS: Record<string, string> = {
  STAGE_MISMATCH: "Stage Mismatch", AMOUNT_FIELD_DIFF: "Amount/Field Diff",
  MISSING_IN_PORTAL: "Missing in Portal", MISSING_IN_TA: "Missing in TA",
}
const PRIORITY_COLORS: Record<number, string> = { 1: "bg-red-500", 2: "bg-orange-500", 3: "bg-amber-500", 4: "bg-blue-500", 5: "bg-gray-400" }
const PRIORITY_LABELS: Record<number, string> = { 1: "Critical", 2: "High", 3: "Medium", 4: "Low", 5: "Info" }
const FILTER_TYPES = ["All", "STAGE_MISMATCH", "AMOUNT_FIELD_DIFF", "MISSING_IN_PORTAL", "MISSING_IN_TA"] as const
const RESOLUTION_REASONS = ["Agreed Verbally", "Timing Difference", "Raised as Case", "Data Entry Error", "Duplicate", "Other"]

function fmtUsd(n: number) { return `$${n.toLocaleString("en-US")}` }

export function ResultsClient({
  run, exceptions: initialExceptions, delta, persistentCount, highlightId, isReadOnly,
}: {
  run: RunInfo; exceptions: ExceptionRow[]; delta: DeltaInfo | null
  persistentCount: number; highlightId: string | null; isReadOnly: boolean
}) {
  const [exceptions, setExceptions] = useState(initialExceptions)
  const [filter, setFilter] = useState<string>("All")
  const [search, setSearch] = useState("")
  const [briefingOpen, setBriefingOpen] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [showCaseModal, setShowCaseModal] = useState(false)
  const [caseExcIds, setCaseExcIds] = useState<string[]>([])
  const highlightRef = useRef<HTMLTableRowElement>(null)

  // Scroll to highlighted exception
  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [highlightId])

  const filtered = exceptions.filter((e) => {
    if (filter !== "All" && e.exceptionType !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (e.taTxnId?.toLowerCase().includes(q)) || (e.portalTxnId?.toLowerCase().includes(q)) || (e.fundName?.toLowerCase().includes(q)) || (e.portalInvestor?.toLowerCase().includes(q))
    }
    return true
  })

  const selected = selectedId ? exceptions.find((e) => e.id === selectedId) ?? null : null
  const missingInPortal = exceptions.filter((e) => e.exceptionType === "MISSING_IN_PORTAL").length
  const missingInTA = exceptions.filter((e) => e.exceptionType === "MISSING_IN_TA").length
  const matchRateColor = (run.matchRate ?? 0) >= 90 ? "text-green-600" : (run.matchRate ?? 0) >= 75 ? "text-amber-600" : "text-red-600"

  function openCaseForSelection() {
    setCaseExcIds([...checked]); setShowCaseModal(true)
  }
  function openCaseForOne(excId: string) {
    setCaseExcIds([excId]); setShowCaseModal(true)
  }

  return (
    <TooltipProvider>
      <PageWrapper>
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>{isReadOnly ? "Run Detail" : "Results"}</PageHeaderTitle>
          </PageHeaderContent>
          <PageHeaderActions>
            <Button variant="outline" asChild>
              <Link href="/wealth/reconciliation">← Back</Link>
            </Button>
          </PageHeaderActions>
        </PageHeader>
        <PageContent className="space-y-6">
          {isReadOnly && (
            <Alert className="flex items-center gap-2 border-muted bg-muted/30 text-muted-foreground">
              <Lock className="h-4 w-4 shrink-0" />
              <span className="text-sm">Read-only — this run was completed on {run.runDate}.</span>
            </Alert>
          )}

          {/* Run summary bar */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span><strong>{run.taName}</strong></span>
                <span className="text-muted-foreground">|</span>
                <span>{run.fundName}</span>
                <span className="text-muted-foreground">|</span>
                <span>{run.closeCycle}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{run.fileName}</span>
                <span className="text-muted-foreground">|</span>
                <span>{run.runDate}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <span>TA Rows: <strong>{run.taRowCount}</strong></span>
                <span>Portal Orders: <strong>{run.portalOrderCount}</strong></span>
                <span>Matched: <strong>{run.matchedCount}</strong></span>
                <span>Issues: <strong className="text-amber-600">{run.issuesCount}</strong></span>
                <span>Missing in Portal: <strong>{missingInPortal}</strong></span>
                <span>Missing in TA: <strong>{missingInTA}</strong></span>
                <span>Match Rate: <strong className={matchRateColor}>{run.matchRate ?? 0}%</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* AI Run Briefing */}
          <Collapsible open={briefingOpen} onOpenChange={setBriefingOpen}>
            <Card className="border-primary/30 bg-primary/5">
              <CollapsibleTrigger asChild>
                <CardHeader className="flex cursor-pointer flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="h-4 w-4 text-primary" />AI Run Briefing
                  </CardTitle>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${briefingOpen ? "rotate-180" : ""}`} />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-3">
                  {run.aiNarrative && <p className="text-sm leading-relaxed">{run.aiNarrative}</p>}
                  {delta?.aiDeltaSummary && (
                    <div><p className="text-xs font-medium text-muted-foreground mb-1">Since your last run:</p><p className="text-sm">{delta.aiDeltaSummary}</p></div>
                  )}
                  {persistentCount > 0 && (
                    <Alert className="flex items-center gap-2 border-amber-500/30 bg-amber-500/10 text-amber-700">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{persistentCount} exception(s) have appeared in 3 or more consecutive runs and may require escalation.</span>
                    </Alert>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Filter tabs + search */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1">
              {FILTER_TYPES.map((f) => {
                const count = f === "All" ? exceptions.length : exceptions.filter((e) => e.exceptionType === f).length
                const label = f === "All" ? "All" : TYPE_LABELS[f] ?? f
                return (
                  <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm"
                    onClick={() => setFilter(f)}>{label} ({count})</Button>
                )
              })}
            </div>
            <div className="flex gap-2">
              {checked.size > 0 && !isReadOnly && (
                <Button size="sm" onClick={openCaseForSelection}>Create Case ({checked.size})</Button>
              )}
              <Input placeholder="Search…" className="w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Exception table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {!isReadOnly && <TableHead className="w-8"></TableHead>}
                    <TableHead className="w-10">P</TableHead>
                    <TableHead>TA Txn ID</TableHead>
                    <TableHead>Portal Order ID</TableHead>
                    <TableHead>Fund / Class</TableHead>
                    <TableHead>Exception Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((exc) => (
                    <TableRow
                      key={exc.id}
                      ref={exc.id === highlightId ? highlightRef : undefined}
                      className={[
                        exc.isPersistent ? "border-l-2 border-l-amber-500" : "",
                        exc.id === highlightId ? "bg-primary/5" : "",
                        "cursor-pointer hover:bg-muted/50",
                      ].join(" ")}
                      onClick={() => setSelectedId(exc.id)}
                    >
                      {!isReadOnly && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={checked.has(exc.id)} onCheckedChange={(v) => {
                            setChecked((prev) => { const n = new Set(prev); v ? n.add(exc.id) : n.delete(exc.id); return n })
                          }} />
                        </TableCell>
                      )}
                      <TableCell><span className={`inline-block h-2.5 w-2.5 rounded-full ${PRIORITY_COLORS[exc.aiPriority] ?? "bg-gray-400"}`} /></TableCell>
                      <TableCell className="font-mono text-xs">{exc.taTxnId ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{exc.portalTxnId ?? "—"}</TableCell>
                      <TableCell className="text-sm max-w-[120px] truncate">{exc.fundName ?? "—"}</TableCell>
                      <TableCell><Badge className="text-xs bg-muted text-muted-foreground">{TYPE_LABELS[exc.exceptionType]}</Badge></TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {exc.exceptionType === "AMOUNT_FIELD_DIFF" && exc.fieldDiffs?.amount ? (
                          <span>TA: {fmtUsd(Number(exc.fieldDiffs.amount.ta))} <span className="text-amber-600">vs</span> Portal: {fmtUsd(Number(exc.fieldDiffs.amount.portal))}</span>
                        ) : fmtUsd(exc.amount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {exc.exceptionType === "STAGE_MISMATCH" && exc.fieldDiffs?.status ? (
                          <span>TA: {String(exc.fieldDiffs.status.ta)} <span className="text-amber-600">vs</span> {String(exc.fieldDiffs.status.portal)}</span>
                        ) : "—"}
                      </TableCell>
                      <TableCell>{exc.isPersistent && <span title="Persistent">🔥</span>}</TableCell>
                      <TableCell className="text-right text-sm">{exc.daysOpen}</TableCell>
                      <TableCell>
                        <Badge className={exc.resolution === "OPEN" ? "bg-red-500/15 text-red-600 border-red-500/30" : exc.resolution === "RESOLVED" ? "bg-green-500/15 text-green-600 border-green-500/30" : "bg-amber-500/15 text-amber-600 border-amber-500/30"}>
                          {exc.resolution === "OPEN" ? "Open" : exc.resolution === "RESOLVED" ? "Resolved" : exc.resolution === "COMMUNICATED" ? "Comm." : "Escalated"}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedId(exc.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          {!isReadOnly && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCaseForOne(exc.id)}><Briefcase className="h-3.5 w-3.5" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </PageContent>
      </PageWrapper>

      {/* Exception Detail Side Panel */}
      {selected && (
        <ExceptionPanel
          exc={selected} isReadOnly={isReadOnly}
          onClose={() => setSelectedId(null)}
          onResolutionSaved={(id, resolution, reason, note) => {
            setExceptions((prev) => prev.map((e) => e.id === id ? { ...e, resolution, resolutionReason: reason ?? null, resolutionNote: note ?? null } : e))
            setSelectedId(null)
          }}
          onCreateCase={() => { setSelectedId(null); openCaseForOne(selected.id) }}
        />
      )}

      {/* Case Creation Modal */}
      {showCaseModal && (
        <CaseModal
          run={run}
          exceptions={exceptions.filter((e) => caseExcIds.includes(e.id))}
          onClose={() => setShowCaseModal(false)}
          onCreated={(sentComm) => {
            if (sentComm) {
              setExceptions((prev) => prev.map((e) => caseExcIds.includes(e.id) ? { ...e, resolution: "COMMUNICATED" } : e))
            }
            setShowCaseModal(false); setChecked(new Set())
            toast.success(sentComm ? "Case created and message sent" : "Case created")
          }}
        />
      )}
    </TooltipProvider>
  )
}

// ─── Exception Side Panel ────────────────────────────────────────────────────

function ExceptionPanel({ exc, isReadOnly, onClose, onResolutionSaved, onCreateCase }: {
  exc: ExceptionRow; isReadOnly: boolean; onClose: () => void
  onResolutionSaved: (id: string, resolution: string, reason?: string, note?: string) => void
  onCreateCase: () => void
}) {
  const [resolution, setResolution] = useState(exc.resolution)
  const [reason, setReason] = useState(exc.resolutionReason ?? "")
  const [note, setNote] = useState(exc.resolutionNote ?? "")
  const [saving, setSaving] = useState(false)

  useEffect(() => { setResolution(exc.resolution); setReason(exc.resolutionReason ?? ""); setNote(exc.resolutionNote ?? "") }, [exc.id])

  async function save() {
    setSaving(true)
    const result = await updateExceptionResolution({ exceptionId: exc.id, resolution, resolutionReason: reason || undefined, resolutionNote: note || undefined })
    setSaving(false)
    if (result.success) onResolutionSaved(exc.id, resolution, reason, note)
  }

  const comparisonFields = [
    { label: "Transaction ID", portal: exc.portalTxnId, ta: exc.taTxnId },
    { label: "Type", portal: exc.portalType, ta: exc.fieldDiffs?.transactionType ? String(exc.fieldDiffs.transactionType.ta) : exc.portalType },
    { label: "Amount", portal: exc.portalAmount !== null ? fmtUsd(exc.portalAmount) : null, ta: fmtUsd(exc.amount) },
    { label: "Stage", portal: exc.portalStatus, ta: exc.fieldDiffs?.status ? String(exc.fieldDiffs.status.ta) : exc.portalStatus },
    { label: "Effective Date", portal: exc.portalDate, ta: null },
    { label: "Fund", portal: exc.portalFund, ta: exc.fundName },
    { label: "Investor", portal: exc.portalInvestor, ta: null },
  ]

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[480px] border-l bg-background shadow-xl overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Badge className="bg-muted text-muted-foreground">{TYPE_LABELS[exc.exceptionType]}</Badge>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${PRIORITY_COLORS[exc.aiPriority]}`} />
              <span className="text-sm font-medium">Priority {exc.aiPriority} — {PRIORITY_LABELS[exc.aiPriority]}</span>
            </div>
            {exc.isPersistent && (
              <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30">⚠ Persistent — seen in multiple runs</Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        {/* Comparison table */}
        <Table>
          <TableHeader><TableRow><TableHead>Field</TableHead><TableHead>Portal</TableHead><TableHead>TA Ledger</TableHead></TableRow></TableHeader>
          <TableBody>
            {comparisonFields.map(({ label, portal, ta }) => {
              const diff = portal && ta && String(portal) !== String(ta)
              return (
                <TableRow key={label} className={diff ? "bg-amber-500/5" : ""}>
                  <TableCell className="text-muted-foreground text-sm">{label}</TableCell>
                  <TableCell className={`text-sm ${diff ? "font-medium" : ""}`}>{portal ?? "—"}</TableCell>
                  <TableCell className={`text-sm ${diff ? "font-medium" : ""}`}>{ta ?? "—"}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {/* AI Root Cause */}
        {exc.aiRootCause && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Info className="h-4 w-4 text-primary" />AI Analysis</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{exc.aiRootCause}</p></CardContent>
          </Card>
        )}

        {/* Resolution */}
        <div className="space-y-3">
          <Label>Resolution Status</Label>
          <Select value={resolution} onValueChange={setResolution} disabled={isReadOnly}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="COMMUNICATED">Communicated</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="ESCALATED">Escalated</SelectItem>
            </SelectContent>
          </Select>

          {resolution === "RESOLVED" && (
            <>
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason} disabled={isReadOnly}>
                <SelectTrigger><SelectValue placeholder="Select reason…" /></SelectTrigger>
                <SelectContent>{RESOLUTION_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <Label>Note {reason === "Other" && <span className="text-red-500">*</span>}</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} disabled={isReadOnly} rows={3} placeholder="Optional note…" />
            </>
          )}

          {!isReadOnly && (
            <Button onClick={() => void save()} disabled={saving || (resolution === "RESOLVED" && reason === "Other" && !note)}>
              {saving ? "Saving…" : "Save"}
            </Button>
          )}
        </div>

        {/* Footer actions */}
        {!isReadOnly && (
          <div className="flex gap-3 pt-4 border-t">
            <Button size="sm" onClick={onCreateCase}>Create Case</Button>
            <Tooltip><TooltipTrigger asChild><span><Button size="sm" variant="outline" disabled>View Trade</Button></span></TooltipTrigger><TooltipContent>Order book coming soon</TooltipContent></Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Case Creation Modal ─────────────────────────────────────────────────────

function CaseModal({ run, exceptions, onClose, onCreated }: {
  run: RunInfo; exceptions: ExceptionRow[]
  onClose: () => void; onCreated: (sentComm: boolean) => void
}) {
  const firstExc = exceptions[0]
  const defaultCounterpartyType = firstExc?.exceptionType === "MISSING_IN_PORTAL" ? "Distributor" : "Transfer Agent"
  const [title, setTitle] = useState(`${TYPE_LABELS[firstExc?.exceptionType] ?? "Exception"} — ${run.taName} — ${run.closeCycle}`)
  const [counterpartyType] = useState(defaultCounterpartyType)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [draftLoading, setDraftLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [excIds, setExcIds] = useState(exceptions.map((e) => e.id))

  useEffect(() => {
    async function loadDraft() {
      const summaries = exceptions.map((e) =>
        `${TYPE_LABELS[e.exceptionType]}: ${e.taTxnId ?? "N/A"}, amount ${fmtUsd(e.amount)}, ${e.fieldDiffs ? JSON.stringify(e.fieldDiffs) : "no field diffs"}`
      ).join("\n")
      const result = await generateCaseDraft({
        counterpartyName: run.taName, counterpartyType, fundName: run.fundName,
        closeCycle: run.closeCycle, exceptionSummaries: summaries,
      })
      setSubject(result.subject); setBody(result.body)
      setDraftLoading(false)
    }
    void loadDraft()
  }, [])

  async function handleCreate(sendComm: boolean) {
    setCreating(true)
    await createCase({
      title, counterpartyType, counterpartyId: run.transferAgentId,
      exceptionIds: excIds, sendComm,
      subject: sendComm ? subject : undefined, body: sendComm ? body : undefined,
    })
    setCreating(false)
    onCreated(sendComm)
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create Case</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Counterparty</Label>
            <p className="text-sm mt-1">{run.taName} <Badge variant="secondary" className="ml-2">{counterpartyType}</Badge></p>
          </div>
          <div>
            <Label>Exceptions included ({excIds.length})</Label>
            <div className="mt-2 space-y-1">
              {exceptions.filter((e) => excIds.includes(e.id)).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm border rounded px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs bg-muted text-muted-foreground">{TYPE_LABELS[e.exceptionType]}</Badge>
                    <span className="font-mono text-xs">{e.taTxnId ?? "—"}</span>
                    <span>{fmtUsd(e.amount)}</span>
                  </div>
                  {excIds.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExcIds((p) => p.filter((id) => id !== e.id))}><X className="h-3 w-3" /></Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>AI Draft Message</Label>
            {draftLoading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-20 w-full" /></div>
            ) : (
              <>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject…" />
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
              </>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="outline" onClick={() => void handleCreate(false)} disabled={creating || !title}>Create Case Only</Button>
          <Button onClick={() => void handleCreate(true)} disabled={creating || !title || !subject}>
            {creating ? "Creating…" : "Create Case & Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
