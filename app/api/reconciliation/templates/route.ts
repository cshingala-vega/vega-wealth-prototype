import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const transferAgentId = searchParams.get("transferAgentId")
  if (!transferAgentId) return NextResponse.json({ hasTemplates: false })
  const count = await prisma.columnMappingTemplate.count({ where: { transferAgentId } })
  return NextResponse.json({ hasTemplates: count > 0 })
}
