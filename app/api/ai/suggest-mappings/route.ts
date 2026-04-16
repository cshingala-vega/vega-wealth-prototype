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
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an AI assistant helping a financial operations team map columns from a trade file to a standard schema.

The standard schema fields are:
- transactionId or taTxnId (Transaction ID / Reference number / TA Transaction ID. Common aliases: transaction_ID, TxnRef, Reference, tx_id, trade_id)
- amount (Trade amount / value. Common aliases: trade_amount, Amount, TradeValue)
- transactionType (Subscription or Redemption. Common aliases: trade_type, Type, TradeType)
- effectiveDate (Order date / effective date / settlement date. Common aliases: effective_date, SettlementDate, TradeDate)
- fundName (Fund name. Common aliases: fund_name, Fund, FundName)
- shareClass (Share class. Common aliases: share_class, Class)
- investorName (Investor name. Common aliases: investor_name, Client, InvestorName)
- status (Trade status / stage. Common aliases: Stage, TradeStatus)
- currency (Currency code. Common aliases: CCY, Ccy)

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
