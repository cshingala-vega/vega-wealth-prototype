"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/vui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/vui/collapsible"
import { Skeleton } from "@/components/vui/skeleton"
import { ChevronDown, Info } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface BriefingInput {
  openExceptions: number; highPriorityCount: number; persistentCount: number
  longestOpenDays: number
  topExceptions: { type: string; amount: number; fund: string; daysOpen: number; isPersistent: boolean }[]
}

interface ChartPoint { date: string; matchRate: number; ta: string }

export function AiBriefing({ briefingInput }: { briefingInput: BriefingInput }) {
  const [briefing, setBriefing] = useState("")
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    async function fetchBriefing() {
      try {
        const res = await fetch("/api/ai/reconciliation-briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(briefingInput),
        })
        if (res.ok) {
          const data = (await res.json()) as { briefing: string }
          setBriefing(data.briefing)
        }
      } catch { /* silently fail */ }
      setLoading(false)
    }
    void fetchBriefing()
  }, [])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-primary/30 bg-primary/5">
        <CollapsibleTrigger asChild>
          <CardHeader className="flex cursor-pointer flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-primary" />
              AI Daily Briefing
            </CardTitle>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
            ) : briefing ? (
              <p className="text-sm leading-relaxed">{briefing}</p>
            ) : (
              <p className="text-sm text-muted-foreground">AI briefing unavailable.</p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function MatchRateChart({ data }: { data: ChartPoint[] }) {
  const taNames = [...new Set(data.map((d) => d.ta))]
  const dateMap = new Map<string, Record<string, number | string>>()
  for (const d of data) {
    if (!dateMap.has(d.date)) dateMap.set(d.date, { date: d.date })
    dateMap.get(d.date)![d.ta] = d.matchRate
  }
  const pivoted = [...dateMap.values()]
  const colors = ["hsl(var(--primary))", "hsl(210 70% 50%)"]

  if (pivoted.length === 0) return <p className="text-sm text-muted-foreground py-8 text-center">No data yet.</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pivoted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              {taNames.length > 1 && <Legend />}
              {taNames.map((ta, i) => (
                <Line key={ta} type="monotone" dataKey={ta} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
