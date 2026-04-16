import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic()

interface BriefingRequest {
  openExceptions: number; highPriorityCount: number; persistentCount: number
  longestOpenDays: number
  topExceptions: { type: string; amount: number; fund: string; daysOpen: number; isPersistent: boolean }[]
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as BriefingRequest
    const message = await client.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 256,
      messages: [{
        role: "user",
        content: `You are writing a daily operational briefing for a GP operations team managing private market fund reconciliations.

Current state:
- Open exceptions: ${body.openExceptions}
- High priority exceptions: ${body.highPriorityCount}
- Persistent exceptions (3+ runs): ${body.persistentCount}
- Longest open exception: ${body.longestOpenDays} days
- Top exceptions: ${JSON.stringify(body.topExceptions)}

Write 2–3 sentences in plain English summarising what the ops team needs to focus on today. Be specific — name amounts, exception types, and urgency where relevant. Do not use jargon. Do not use greetings or sign-offs.`,
      }],
    })
    const briefing = message.content[0].type === "text" ? message.content[0].text : ""
    return NextResponse.json({ briefing })
  } catch (err) {
    console.error("reconciliation-briefing error:", err)
    return NextResponse.json({ briefing: "" }, { status: 500 })
  }
}
