import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ReconMappingForm } from "./mapping-form"

export default async function ReconMappingPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const run = await prisma.reconciliationRun.findUnique({
    where: { id: runId }, include: { transferAgent: true },
  })
  if (!run) notFound()

  const templates = await prisma.columnMappingTemplate.findMany({
    where: { transferAgentId: run.transferAgentId },
    orderBy: [{ isDefault: "desc" }, { lastUsedAt: "desc" }],
  })

  const previewRows = (run.previewRows as Record<string, string>[] | null) ?? []

  return (
    <ReconMappingForm
      run={{
        id: run.id, fileName: run.fileName, detectedColumns: run.detectedColumns,
        transferAgentName: run.transferAgent.name,
        closeCycle: run.closeCycle.toISOString().slice(0, 7),
      }}
      templates={templates.map((t) => ({
        id: t.id, name: t.name, isDefault: t.isDefault, mappingJson: t.mappingJson as Record<string, string>,
      }))}
      previewRows={previewRows.slice(0, 10)}
    />
  )
}
