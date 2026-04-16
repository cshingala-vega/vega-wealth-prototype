"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  PageWrapper, PageContent, PageHeader, PageHeaderContent, PageHeaderTitle, PageHeaderDescription,
} from "@/components/vui/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/vui/card"
import { Button } from "@/components/vui/button"
import { Badge } from "@/components/vui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/vui/select"
import { Input } from "@/components/vui/input"
import { Label } from "@/components/vui/label"
import { Checkbox } from "@/components/vui/checkbox"
import { Alert } from "@/components/vui/alert"
import { ScrollArea } from "@/components/vui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/vui/table"
import { AlertCircle, Info, Loader2 } from "lucide-react"
import { saveReconciliationMapping } from "../../actions"

const REQUIRED_FIELDS = [
  { key: "taTxnId", label: "TA Transaction ID / Shared Reference" },
  { key: "amount", label: "Amount" },
  { key: "transactionType", label: "Transaction Type" },
  { key: "effectiveDate", label: "Order Date / Effective Date" },
]
const OPTIONAL_FIELDS = [
  { key: "fundName", label: "Fund Name" }, { key: "shareClass", label: "Share Class" },
  { key: "status", label: "Status / Stage" }, { key: "currency", label: "Currency" },
]
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]

interface AiSuggestion { field: string; suggestion: string | null; confidence: "HIGH" | "MEDIUM" | "LOW" }
interface RunInfo { id: string; fileName: string; detectedColumns: string[]; transferAgentName: string; closeCycle: string }
interface Template { id: string; name: string; isDefault: boolean; mappingJson: Record<string, string> }

function StepIndicator({ current }: { current: number }) {
  const steps = ["Upload", "Column Mapping", "Results", "Done"]
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const step = i + 1; const isActive = step === current; const isDone = step < current
        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={["flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold", isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"].join(" ")}>{isDone ? "✓" : step}</div>
              <span className={["text-sm", isActive ? "font-medium text-foreground" : "text-muted-foreground"].join(" ")}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="mx-4 h-px w-12 bg-border" />}
          </div>
        )
      })}
    </div>
  )
}

function ConfidenceDot({ confidence }: { confidence: "HIGH" | "MEDIUM" | "LOW" }) {
  const c = { HIGH: "bg-green-500", MEDIUM: "bg-amber-500", LOW: "bg-red-500" }
  return <span className={`inline-block h-2 w-2 rounded-full ${c[confidence]}`} title={confidence} />
}

export function ReconMappingForm({ run, templates, previewRows }: { run: RunInfo; templates: Template[]; previewRows: Record<string, string>[] }) {
  const router = useRouter()
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([])
  const [aiLoading, setAiLoading] = useState(true)
  const [aiUnavailable, setAiUnavailable] = useState(false)
  const [saveTemplate, setSaveTemplate] = useState(true)
  const [templateName, setTemplateName] = useState(`${run.transferAgentName} — ${new Date(run.closeCycle + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/ai/suggest-mappings", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ columns: run.detectedColumns }),
        })
        if (!res.ok) throw new Error()
        const data = (await res.json()) as { mappings: AiSuggestion[] }
        setSuggestions(data.mappings)
        const init: Record<string, string> = {}
        for (const s of data.mappings) { if (s.suggestion) init[s.field] = s.suggestion }
        setMapping(init)
      } catch { setAiUnavailable(true) }
      finally { setAiLoading(false) }
    }
    void load()
  }, [run.detectedColumns])

  function getSuggestion(field: string) { return suggestions.find((s) => s.field === field) }
  function setField(field: string, value: string) { setMapping((p) => ({ ...p, [field]: value === "__none__" ? "" : value })); setFieldErrors((p) => ({ ...p, [field]: "" })) }
  function loadTemplate(tid: string) {
    const tpl = templates.find((t) => t.id === tid); if (!tpl) return
    const inv: Record<string, string> = {}
    for (const [src, schema] of Object.entries(tpl.mappingJson)) inv[schema] = src
    setMapping(inv)
  }

  const mappedPreview = previewRows.map((row) => {
    const out: Record<string, string> = {}
    for (const f of ALL_FIELDS) { const src = mapping[f.key]; out[f.label] = src ? (row[src] ?? "") : "" }
    return out
  })
  const previewHeaders = ALL_FIELDS.filter((f) => mapping[f.key]).map((f) => f.label)

  async function handleSubmit() {
    const errors: Record<string, string> = {}
    for (const f of REQUIRED_FIELDS) { if (!mapping[f.key]) errors[f.key] = "Required" }
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setSubmitting(true)
    const result = await saveReconciliationMapping({ runId: run.id, mapping, saveTemplate, templateName })
    setSubmitting(false)
    if (result.success) router.push(`/wealth/reconciliation/${run.id}/results`)
  }

  return (
    <PageWrapper>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Column Mapping</PageHeaderTitle>
          <PageHeaderDescription>{run.fileName}</PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent className="space-y-6">
        <StepIndicator current={2} />
        {aiUnavailable && (
          <Alert className="flex items-center gap-2 border-amber-500/30 bg-amber-500/10 text-amber-700">
            <Info className="h-4 w-4 shrink-0" /><span className="text-sm">AI suggestions unavailable — please map columns manually.</span>
          </Alert>
        )}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 space-y-4">
            {templates.length > 0 && (
              <div className="flex items-center gap-3">
                <Label className="shrink-0 text-sm text-muted-foreground">Load template:</Label>
                <Select onValueChange={loadTemplate}>
                  <SelectTrigger className="w-64"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} {t.isDefault ? "(default)" : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {aiLoading ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Getting AI column suggestions…</span></div>
            ) : (
              <Card>
                <CardHeader><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Required fields</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Vega Schema Field</TableHead><TableHead>Source Column</TableHead><TableHead className="w-24">Confidence</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {REQUIRED_FIELDS.map((f) => {
                        const sug = getSuggestion(f.key); const hasError = fieldErrors[f.key]
                        return (
                          <TableRow key={f.key} className={hasError ? "bg-red-500/5" : undefined}>
                            <TableCell className="font-medium">{f.label}</TableCell>
                            <TableCell>
                              <Select value={mapping[f.key] ?? ""} onValueChange={(v) => setField(f.key, v)}>
                                <SelectTrigger className={hasError ? "border-red-500" : ""}><SelectValue placeholder="Select column…" /></SelectTrigger>
                                <SelectContent>{run.detectedColumns.map((col) => <SelectItem key={col} value={col}>{col}</SelectItem>)}</SelectContent>
                              </Select>
                              {hasError && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" />{hasError}</p>}
                            </TableCell>
                            <TableCell>
                              {sug && mapping[f.key] === sug.suggestion ? (
                                <div className="flex items-center gap-1.5"><ConfidenceDot confidence={sug.confidence} /><span className="text-xs text-muted-foreground">{sug.confidence}</span></div>
                              ) : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardHeader className="border-t pt-4"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Optional fields</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Vega Schema Field</TableHead><TableHead>Source Column</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {OPTIONAL_FIELDS.map((f) => (
                        <TableRow key={f.key}>
                          <TableCell className="text-muted-foreground">{f.label}</TableCell>
                          <TableCell>
                            <Select value={mapping[f.key] ?? "__none__"} onValueChange={(v) => setField(f.key, v)}>
                              <SelectTrigger><SelectValue placeholder="— Not mapped —" /></SelectTrigger>
                              <SelectContent><SelectItem value="__none__">— Not mapped —</SelectItem>{run.detectedColumns.map((col) => <SelectItem key={col} value={col}>{col}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="save-tpl-r" checked={saveTemplate} onCheckedChange={(v) => setSaveTemplate(v === true)} />
                  <label htmlFor="save-tpl-r" className="text-sm font-medium cursor-pointer">Save as template</label>
                </div>
                {saveTemplate && <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name" />}
              </CardContent>
            </Card>
          </div>
          <div className="col-span-2">
            <Card className="sticky top-4">
              <CardHeader><CardTitle className="text-sm">Live Preview</CardTitle></CardHeader>
              <CardContent className="p-0">
                {previewHeaders.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted-foreground">Map columns to see a preview.</p>
                ) : (
                  <ScrollArea style={{ maxHeight: 480 }}>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow>{previewHeaders.map((h) => <TableHead key={h} className="whitespace-nowrap text-xs">{h}</TableHead>)}</TableRow></TableHeader>
                        <TableBody>
                          {mappedPreview.map((row, i) => (
                            <TableRow key={i}>{previewHeaders.map((h) => <TableCell key={h} className="text-xs whitespace-nowrap">{row[h] || <span className="text-muted-foreground/50">—</span>}</TableCell>)}</TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/wealth/reconciliation/new")}>← Back</Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting || aiLoading}>{submitting ? "Running…" : "Run Reconciliation →"}</Button>
        </div>
      </PageContent>
    </PageWrapper>
  )
}
