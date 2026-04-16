import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic()

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { exceptions: object[] }
    const message = await client.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 2048,
      messages: [{
        role: "user",
        content: `You are analysing trade reconciliation exceptions for a private markets GP operations team. For each exception below, write one sentence explaining the most likely root cause in plain English. Be specific about amounts and exception types. Do not use jargon.

Exceptions:
${JSON.stringify(body.exceptions)}

Respond ONLY with a JSON array:
[{ "exceptionId": "...", "rootCause": "..." }]`,
      }],
    })
    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("No JSON found")
    const rootCauses = JSON.parse(jsonMatch[0]) as { exceptionId: string; rootCause: string }[]
    return NextResponse.json({ rootCauses })
  } catch (err) {
    console.error("generate-exception-root-causes error:", err)
    return NextResponse.json({ rootCauses: [] }, { status: 500 })
  }
}
