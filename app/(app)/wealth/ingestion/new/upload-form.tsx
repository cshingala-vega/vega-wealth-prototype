"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import * as XLSX from "xlsx"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/vui/dialog"
import { Input } from "@/components/vui/input"
import { Label } from "@/components/vui/label"
import { Alert } from "@/components/vui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/vui/select"
import { Upload, X, AlertCircle, Info, ChevronDown } from "lucide-react"
import { createIngestionRun, createDistributor } from "../actions"

interface Distributor {
  id: string
  name: string
}

interface ParsedFile {
  file: File
  columns: string[]
  rowCount: number
  error?: string
}

interface UploadFormProps {
  distributors: Distributor[]
}

// Step indicator component
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
              <div
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {isDone ? "✓" : step}
              </div>
              <span
                className={[
                  "text-sm",
                  isActive ? "font-medium text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-4 h-px w-12 bg-border" />
            )}
          </div>
        )
      })}
    </div>
  )
}

function parseClientFile(
  file: File,
): Promise<{ columns: string[]; rowCount: number; error?: string }> {
  return new Promise((resolve) => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      resolve({ columns: [], rowCount: 0, error: "Only .xlsx and .csv files are supported." })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      try {
        if (ext === "csv") {
          const text = new TextDecoder().decode(buffer)
          const result = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true })
          if (result.data.length === 0) {
            resolve({ columns: [], rowCount: 0, error: "This file appears to be empty. Please check and re-upload." })
            return
          }
          const cols = result.data[0] as string[]
          resolve({ columns: cols, rowCount: Math.max(0, result.data.length - 1) })
        } else {
          const wb = XLSX.read(buffer, { type: "array" })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
          if (rows.length === 0) {
            resolve({ columns: [], rowCount: 0, error: "This file appears to be empty. Please check and re-upload." })
            return
          }
          const cols = (rows[0] as string[]).map(String)
          resolve({ columns: cols, rowCount: Math.max(0, rows.length - 1) })
        }
      } catch {
        resolve({ columns: [], rowCount: 0, error: "Failed to parse file." })
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

export function UploadForm({ distributors: initialDistributors }: UploadFormProps) {
  const router = useRouter()
  const [distributors, setDistributors] = useState<Distributor[]>(initialDistributors)
  const [selectedDistributorId, setSelectedDistributorId] = useState("")
  const [closeCycle, setCloseCycle] = useState("")
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New distributor dialog
  const [showNewDistributor, setShowNewDistributor] = useState(false)
  const [newDistributorName, setNewDistributorName] = useState("")
  const [creatingDistributor, setCreatingDistributor] = useState(false)

  // Mapping templates notice
  const [hasTemplates, setHasTemplates] = useState(false)

  // Re-ingestion warning
  const [showReingestionWarning, setShowReingestionWarning] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)

  const selectedDistributor = distributors.find((d) => d.id === selectedDistributorId)

  async function handleDistributorChange(id: string) {
    setSelectedDistributorId(id)
    // Check for templates
    try {
      const res = await fetch(`/api/ingestion/templates?distributorId=${id}`)
      if (res.ok) {
        const data = (await res.json()) as { hasTemplates: boolean }
        setHasTemplates(data.hasTemplates)
      }
    } catch {
      // silently ignore
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const results: ParsedFile[] = []
    for (const f of arr) {
      const parsed = await parseClientFile(f)
      results.push({ file: f, ...parsed })
    }
    setParsedFiles((prev) => [...prev, ...results])
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      void handleFiles(e.dataTransfer.files)
    },
    [],
  )

  function removeFile(index: number) {
    setParsedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function doSubmit() {
    if (parsedFiles.length === 0 || !selectedDistributorId || !closeCycle) return
    setSubmitting(true)
    setSubmitError("")

    const firstFile = parsedFiles[0]
    const fd = new FormData()
    fd.append("distributorId", selectedDistributorId)
    fd.append("closeCycle", closeCycle)
    fd.append("file", firstFile.file)

    const result = await createIngestionRun(fd)
    setSubmitting(false)

    if (result.success && result.runId) {
      router.push(`/wealth/ingestion/${result.runId}/mapping`)
    } else {
      setSubmitError(result.error ?? "Something went wrong")
    }
  }

  async function handleSubmit() {
    // Check for re-ingestion
    if (selectedDistributorId && closeCycle) {
      try {
        const res = await fetch(
          `/api/ingestion/check-duplicate?distributorId=${selectedDistributorId}&closeCycle=${closeCycle}`,
        )
        if (res.ok) {
          const data = (await res.json()) as { exists: boolean; rowsCommitted?: number; date?: string }
          if (data.exists) {
            setPendingSubmit(true)
            setShowReingestionWarning(true)
            return
          }
        }
      } catch {
        // silently proceed
      }
    }
    void doSubmit()
  }

  async function handleCreateDistributor() {
    if (!newDistributorName.trim()) return
    setCreatingDistributor(true)
    const result = await createDistributor(newDistributorName.trim())
    setCreatingDistributor(false)
    if (result.success && result.distributor) {
      setDistributors((prev) => [...prev, result.distributor!])
      setSelectedDistributorId(result.distributor.id)
      setShowNewDistributor(false)
      setNewDistributorName("")
    }
  }

  const canSubmit =
    parsedFiles.length > 0 &&
    selectedDistributorId !== "" &&
    closeCycle !== "" &&
    parsedFiles.every((f) => !f.error)

  return (
    <PageWrapper>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>New Ingestion</PageHeaderTitle>
          <PageHeaderDescription>Upload a distributor trade file to begin.</PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent className="space-y-6">
        {/* Step indicator */}
        <StepIndicator current={1} />

        {/* Form card */}
        <Card>
          <CardHeader>
            <CardTitle>File details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Distributor */}
            <div className="space-y-1.5">
              <Label>Distributor *</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedDistributorId}
                  onValueChange={(v) => void handleDistributorChange(v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select distributor…" />
                  </SelectTrigger>
                  <SelectContent>
                    {distributors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewDistributor(true)}
                >
                  + Add new
                </Button>
              </div>
            </div>

            {/* Close Cycle */}
            <div className="space-y-1.5">
              <Label>Close Cycle *</Label>
              <Input
                type="date"
                value={closeCycle}
                onChange={(e) => setCloseCycle(e.target.value)}
                className="w-48"
              />
            </div>

            {/* Template notice */}
            {hasTemplates && selectedDistributor && (
              <Alert className="flex items-start gap-2 border-blue-500/30 bg-blue-500/10 text-blue-700">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-sm">
                  Saved mapping templates found for{" "}
                  <strong>{selectedDistributor.name}</strong>. These will be available in the
                  next step.
                </span>
              </Alert>
            )}

            {/* File upload zone */}
            <div className="space-y-1.5">
              <Label>File *</Label>
              <div
                className={[
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                ].join(" ")}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Accepts .xlsx and .csv</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) void handleFiles(e.target.files)
                    e.target.value = ""
                  }}
                />
              </div>
            </div>

            {/* Parsed file cards */}
            {parsedFiles.map((pf, i) => (
              <div
                key={i}
                className="rounded-lg border bg-muted/30 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{pf.file.name}</p>
                    {pf.error ? (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {pf.error}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        {pf.rowCount} rows detected
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => removeFile(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {!pf.error && pf.columns.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pf.columns.slice(0, 8).map((col) => (
                      <Badge key={col} variant="secondary" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                    {pf.columns.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{pf.columns.length - 8} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}

            {submitError && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                {submitError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/wealth/ingestion")}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={!canSubmit || submitting}>
            {submitting ? "Processing…" : "Continue →"}
          </Button>
        </div>
      </PageContent>

      {/* New distributor dialog */}
      <Dialog open={showNewDistributor} onOpenChange={setShowNewDistributor}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add distributor</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Merrill Lynch"
              value={newDistributorName}
              onChange={(e) => setNewDistributorName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreateDistributor()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDistributor(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleCreateDistributor()}
              disabled={!newDistributorName.trim() || creatingDistributor}
            >
              {creatingDistributor ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-ingestion warning dialog */}
      <Dialog
        open={showReingestionWarning}
        onOpenChange={(open) => {
          setShowReingestionWarning(open)
          if (!open) setPendingSubmit(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ingestion run already exists</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            An ingestion run for{" "}
            <strong>{selectedDistributor?.name}</strong> —{" "}
            <strong>
              {closeCycle
                ? new Date(closeCycle).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </strong>{" "}
            already exists. Starting a new run will not affect the existing data. Continue?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReingestionWarning(false)
                setPendingSubmit(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowReingestionWarning(false)
                void doSubmit()
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
