import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic()

interface SummaryRequest {
  distributorName: string
  closeCycle: string
  rowsIngested: number
  rowsExcluded: number
  rowsFlagged: number
  aiQualityScore: number
  flagBreakdown: { type: string; count: number }[]
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SummaryRequest

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `You are writing a brief operational summary for a GP operations team after a trade file ingestion run.

Run details:
- Distributor: ${body.distributorName}
- Close cycle: ${body.closeCycle}
- Rows ingested: ${body.rowsIngested}
- Rows excluded: ${body.rowsExcluded}
- Rows flagged: ${body.rowsFlagged}
- AI quality score: ${body.aiQualityScore}/100
- Flag breakdown: ${JSON.stringify(body.flagBreakdown)}

Write 2–3 sentences in plain English summarising what happened in this ingestion run. Be factual and specific. Do not use jargon. Do not include greetings or sign-offs. Focus on what the ops person needs to know.`,
        },
      ],
    })

    const summary = message.content[0].type === "text" ? message.content[0].text : ""
    return NextResponse.json({ summary })
  } catch (err) {
    console.error("generate-summary error:", err)
    return NextResponse.json({ summary: "" }, { status: 500 })
  }
}
