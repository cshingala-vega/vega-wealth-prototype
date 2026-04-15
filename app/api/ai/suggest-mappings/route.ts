import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic()

interface MappingSuggestion {
  field: string
  suggestion: string | null
  confidence: "HIGH" | "MEDIUM" | "LOW"
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { columns: string[] }
    const { columns } = body

    if (!columns || columns.length === 0) {
      return NextResponse.json({ mappings: [] })
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an AI assistant helping a financial operations team map columns from a trade file to a standard schema.

The standard schema fields are:
- transactionId (Transaction ID / Reference number)
- amount (Trade amount / value)
- transactionType (Subscription or Redemption)
- effectiveDate (Order date / effective date / settlement date)
- fundName (Fund name)
- shareClass (Share class)
- investorName (Investor name)
- status (Trade status / stage)
- currency (Currency code)

The uploaded file has these column names: ${JSON.stringify(columns)}

For each schema field, suggest the best matching column name from the list and rate your confidence as HIGH (clear match), MEDIUM (likely match), or LOW (uncertain). If no column is a reasonable match, return null for that field.

Respond only with a JSON array matching this structure:
[{ "field": "transactionId", "suggestion": "column_name_or_null", "confidence": "HIGH|MEDIUM|LOW" }]`,
        },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No JSON array found in response")
    }

    const mappings = JSON.parse(jsonMatch[0]) as MappingSuggestion[]
    return NextResponse.json({ mappings })
  } catch (err) {
    console.error("suggest-mappings error:", err)
    return NextResponse.json({ mappings: [] }, { status: 500 })
  }
}
