import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MappingForm } from "./mapping-form"

export default async function MappingPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const run = await prisma.ingestionRun.findUnique({
    where: { id: runId },
    include: { distributor: true },
  })
  if (!run) notFound()

  const templates = await prisma.columnMappingTemplate.findMany({
    where: { distributorId: run.distributorId },
    orderBy: [{ isDefault: "desc" }, { lastUsedAt: "desc" }],
  })

  const previewRows = (run.previewRows as Record<string, string>[] | null) ?? []

  return (
    <MappingForm
      run={{
        id: run.id,
        fileName: run.fileName,
        detectedColumns: run.detectedColumns,
        distributorId: run.distributorId,
        distributorName: run.distributor.name,
        closeCycle: run.closeCycle.toISOString().slice(0, 7),
      }}
      templates={templates.map((t) => ({
        id: t.id,
        name: t.name,
        isDefault: t.isDefault,
        mappingJson: t.mappingJson as Record<string, string>,
      }))}
      previewRows={previewRows.slice(0, 10)}
    />
  )
}
