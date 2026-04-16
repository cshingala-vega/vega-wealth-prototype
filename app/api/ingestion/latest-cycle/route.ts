import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const distributorId = searchParams.get("distributorId")
  if (!distributorId) return NextResponse.json({ closeCycle: null })

  const run = await prisma.ingestionRun.findFirst({
    where: { distributorId },
    orderBy: { closeCycle: "desc" },
    select: { closeCycle: true },
  })

  return NextResponse.json({
    closeCycle: run ? run.closeCycle.toISOString().slice(0, 10) : null,
  })
}
