"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import {
  PageWrapper, PageContent, PageHeader, PageHeaderContent, PageHeaderTitle, PageHeaderDescription,
} from "@/components/vui/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/vui/card"
import { Button } from "@/components/vui/button"
import { Badge } from "@/components/vui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/vui/dialog"
import { Input } from "@/components/vui/input"
import { Label } from "@/components/vui/label"
import { Alert } from "@/components/vui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/vui/select"
import { Upload, X, AlertCircle, Info } from "lucide-react"
import { createReconciliationRun, createTransferAgent } from "../actions"

interface TA { id: string; name: string }
interface FundOption { id: string; name: string }
interface ParsedFile { file: File; columns: string[]; rowCount: number; error?: string }

function StepIndicator({ current }: { current: number }) {
  const steps = ["Upload", "Column Mapping", "Results", "Done"]
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

function parseClientFile(file: File): Promise<{ columns: string[]; rowCount: number; error?: string }> {
  return new Promise((resolve) => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      resolve({ columns: [], rowCount: 0, error: "Only .xlsx and .csv files are supported." }); return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      try {
        if (ext === "csv") {
          const text = new TextDecoder().decode(buffer)
          const result = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true })
          if (result.data.length === 0) { resolve({ columns: [], rowCount: 0, error: "File appears to be empty." }); return }
          resolve({ columns: result.data[0] as string[], rowCount: Math.max(0, result.data.length - 1) })
        } else {
          const wb = XLSX.read(buffer, { type: "array" })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
          if (rows.length === 0) { resolve({ columns: [], rowCount: 0, error: "File appears to be empty." }); return }
          resolve({ columns: (rows[0] as string[]).map(String), rowCount: Math.max(0, rows.length - 1) })
        }
      } catch { resolve({ columns: [], rowCount: 0, error: "Failed to parse file." }) }
    }
    reader.readAsArrayBuffer(file)
  })
}

export function ReconUploadForm({ transferAgents: initTAs, funds }: { transferAgents: TA[]; funds: FundOption[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tas, setTas] = useState<TA[]>(initTAs)
  const [selectedTAId, setSelectedTAId] = useState("")
  const [selectedFundId, setSelectedFundId] = useState(searchParams.get("fundId") ?? "")
  const [closeCycle, setCloseCycle] = useState(searchParams.get("closeCycle") ?? "")
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showNewTA, setShowNewTA] = useState(false)
  const [newTAName, setNewTAName] = useState("")
  const [creatingTA, setCreatingTA] = useState(false)
  const [hasTemplates, setHasTemplates] = useState(false)
  const prefilled = !!searchParams.get("closeCycle")

  async function handleTAChange(id: string) {
    setSelectedTAId(id)
    try {
      const [tplRes, cycleRes] = await Promise.all([
        fetch(`/api/reconciliation/templates?transferAgentId=${id}`),
        fetch(`/api/reconciliation/latest-cycle?transferAgentId=${id}`),
      ])
      if (tplRes.ok) setHasTemplates(((await tplRes.json()) as { hasTemplates: boolean }).hasTemplates)
      if (cycleRes.ok && !prefilled) {
        const data = (await cycleRes.json()) as { closeCycle: string | null }
        setCloseCycle(data.closeCycle ?? "")
      }
    } catch { /* ignore */ }
  }

  async function handleFile(files: FileList | File[]) {
    const f = Array.from(files)[0]
    if (!f) return
    const parsed = await parseClientFile(f)
    setParsedFile({ file: f, ...parsed })
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); void handleFile(e.dataTransfer.files)
  }, [])

  async function handleSubmit() {
    if (!parsedFile || !selectedTAId || !selectedFundId || !closeCycle) return
    setSubmitting(true); setSubmitError("")
    const fd = new FormData()
    fd.append("transferAgentId", selectedTAId)
    fd.append("fundId", selectedFundId)
    fd.append("closeCycle", closeCycle)
    fd.append("file", parsedFile.file)
    const result = await createReconciliationRun(fd)
    setSubmitting(false)
    if (result.success && result.runId) router.push(`/wealth/reconciliation/${result.runId}/mapping`)
    else setSubmitError(result.error ?? "Something went wrong")
  }

  async function handleCreateTA() {
    if (!newTAName.trim()) return
    setCreatingTA(true)
    const result = await createTransferAgent(newTAName.trim())
    setCreatingTA(false)
    if (result.success && result.transferAgent) {
      setTas((prev) => [...prev, result.transferAgent!])
      setSelectedTAId(result.transferAgent.id)
      setShowNewTA(false); setNewTAName("")
    }
  }

  const canSubmit = !!parsedFile && !parsedFile.error && !!selectedTAId && !!selectedFundId && !!closeCycle

  return (
    <PageWrapper>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>New Reconciliation</PageHeaderTitle>
          <PageHeaderDescription>Upload a Transfer Agent ledger file to begin.</PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent className="space-y-6">
        <StepIndicator current={1} />
        <Card>
          <CardHeader><CardTitle>File details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Transfer Agent */}
            <div className="space-y-1.5">
              <Label>Transfer Agent *</Label>
              <div className="flex gap-2">
                <Select value={selectedTAId} onValueChange={(v) => void handleTAChange(v)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select transfer agent…" /></SelectTrigger>
                  <SelectContent>{tas.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={() => setShowNewTA(true)}>+ Add new</Button>
              </div>
            </div>

            {/* Fund */}
            <div className="space-y-1.5">
              <Label>Fund *</Label>
              <Select value={selectedFundId} onValueChange={setSelectedFundId}>
                <SelectTrigger><SelectValue placeholder="Select fund…" /></SelectTrigger>
                <SelectContent>{funds.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
              {prefilled && selectedFundId && <p className="text-xs text-muted-foreground">Pre-filled from your last ingestion run</p>}
            </div>

            {/* Close Cycle */}
            <div className="space-y-1.5">
              <Label>Close Cycle *</Label>
              <Input type="date" value={closeCycle} onChange={(e) => setCloseCycle(e.target.value)} className="w-48" />
              {prefilled && closeCycle && <p className="text-xs text-muted-foreground">Pre-filled from your last ingestion run</p>}
            </div>

            {hasTemplates && selectedTAId && (
              <Alert className="flex items-start gap-2 border-blue-500/30 bg-blue-500/10 text-blue-700">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-sm">Saved mapping templates found for <strong>{tas.find((t) => t.id === selectedTAId)?.name}</strong>. These will be available in the next step.</span>
              </Alert>
            )}

            {/* File upload */}
            <div className="space-y-1.5">
              <Label>TA Ledger File *</Label>
              <div
                className={["flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors", isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"].join(" ")}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div><p className="font-medium">Drop file here or click to browse</p><p className="text-sm text-muted-foreground">Accepts .xlsx and .csv</p></div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.csv" className="hidden"
                  onChange={(e) => { if (e.target.files) void handleFile(e.target.files); e.target.value = "" }} />
              </div>
            </div>

            {parsedFile && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{parsedFile.file.name}</p>
                    {parsedFile.error ? (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" />{parsedFile.error}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">{parsedFile.rowCount} rows detected</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setParsedFile(null)}><X className="h-4 w-4" /></Button>
                </div>
                {!parsedFile.error && parsedFile.columns.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {parsedFile.columns.slice(0, 8).map((col) => <Badge key={col} variant="secondary" className="text-xs">{col}</Badge>)}
                    {parsedFile.columns.length > 8 && <Badge variant="outline" className="text-xs">+{parsedFile.columns.length - 8} more</Badge>}
                  </div>
                )}
              </div>
            )}
            {submitError && <p className="text-sm text-red-500 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" />{submitError}</p>}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/wealth/reconciliation")}>Cancel</Button>
          <Button onClick={() => void handleSubmit()} disabled={!canSubmit || submitting}>{submitting ? "Processing…" : "Continue →"}</Button>
        </div>
      </PageContent>

      <Dialog open={showNewTA} onOpenChange={setShowNewTA}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add transfer agent</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Name</Label>
            <Input placeholder="e.g. Northern Trust" value={newTAName} onChange={(e) => setNewTAName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleCreateTA() }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTA(false)}>Cancel</Button>
            <Button onClick={() => void handleCreateTA()} disabled={!newTAName.trim() || creatingTA}>{creatingTA ? "Creating…" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
