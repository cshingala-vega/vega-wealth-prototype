import { prisma } from "@/lib/prisma"
import { UploadForm } from "./upload-form"

async function getPageData() {
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "celestial" } })
  const distributors = await prisma.distributor.findMany({
    where: { organizationId: org.id },
    orderBy: { name: "asc" },
  })
  return { distributors }
}

export default async function NewIngestionPage() {
  const { distributors } = await getPageData()
  return <UploadForm distributors={distributors} />
}
