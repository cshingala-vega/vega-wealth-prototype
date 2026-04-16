import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic()

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      counterpartyName: string; counterpartyType: string; fundName: string
      closeCycle: string; exceptionSummaries: string
    }
    const message = await client.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 512,
      messages: [{
        role: "user",
        content: `You are writing an exception notification email on behalf of a GP operations team at a private markets fund manager.

The email is addressed to: ${body.counterpartyName} (${body.counterpartyType})
Regarding fund: ${body.fundName}, close cycle: ${body.closeCycle}

Exceptions to communicate:
${body.exceptionSummaries}

Write a professional but concise email:
- Subject line (one line, starting with "Subject:")
- Email body (3–5 sentences maximum)
- Be specific: include transaction IDs, amounts, and the exact discrepancy
- Request a response or correction by end of next business day
- Sign off as "GP Operations Team"
- Do not use jargon
- Do not be overly formal

Respond with subject line first, then a blank line, then the email body.`,
      }],
    })
    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const lines = text.split("\n")
    const subjectLine = lines.find((l) => l.startsWith("Subject:"))?.replace("Subject:", "").trim() ?? ""
    const bodyStart = lines.findIndex((l) => l.startsWith("Subject:"))
    const emailBody = lines.slice(bodyStart + 1).join("\n").trim()
    return NextResponse.json({ subject: subjectLine, body: emailBody })
  } catch (err) {
    console.error("generate-case-draft error:", err)
    return NextResponse.json({ subject: "", body: "" }, { status: 500 })
  }
}
