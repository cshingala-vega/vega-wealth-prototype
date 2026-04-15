import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const distributorId = searchParams.get("distributorId")
  const closeCycle = searchParams.get("closeCycle")
  if (!distributorId || !closeCycle) return NextResponse.json({ exists: false })

  const run = await prisma.ingestionRun.findFirst({
    where: {
      distributorId,
      closeCycle: new Date(closeCycle),
    },
    orderBy: { createdAt: "desc" },
  })

  if (!run) return NextResponse.json({ exists: false })
  return NextResponse.json({
    exists: true,
    rowsCommitted: run.rowsIngested,
    date: run.committedAt?.toISOString() ?? run.createdAt.toISOString(),
  })
}
