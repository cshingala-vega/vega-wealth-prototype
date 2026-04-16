import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { ReconUploadForm } from "./upload-form"

async function getPageData() {
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "celestial" } })
  const transferAgents = await prisma.transferAgent.findMany({
    where: { organizationId: org.id }, orderBy: { name: "asc" },
  })
  const funds = await prisma.fund.findMany({
    where: { organizationId: org.id }, orderBy: { name: "asc" },
  })
  return { transferAgents, funds }
}

export default async function NewReconciliationPage() {
  const { transferAgents, funds } = await getPageData()
  return (
    <Suspense>
      <ReconUploadForm transferAgents={transferAgents} funds={funds} />
    </Suspense>
  )
}
