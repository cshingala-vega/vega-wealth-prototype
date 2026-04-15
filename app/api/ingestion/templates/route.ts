import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const distributorId = searchParams.get("distributorId")
  if (!distributorId) return NextResponse.json({ hasTemplates: false })

  const count = await prisma.columnMappingTemplate.count({ where: { distributorId } })
  return NextResponse.json({ hasTemplates: count > 0 })
}
