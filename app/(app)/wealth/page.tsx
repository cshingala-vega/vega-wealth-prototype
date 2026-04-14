import {
  PageWrapper,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
} from "@/components/vui/layout/page-layout"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/vui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/vui/table"
import { Badge } from "@/components/vui/badge"
import { Button } from "@/components/vui/button"

const holdings = [
  {
    id: "1",
    name: "Vanguard S&P 500 ETF",
    ticker: "VOO",
    category: "Equity",
    quantity: 42,
    avgCost: 380.5,
    currentPrice: 431.2,
    totalValue: 18110.4,
    gain: 2130.9,
    gainPct: 13.34,
  },
  {
    id: "2",
    name: "iShares Core US Agg Bond ETF",
    ticker: "AGG",
    category: "Fixed Income",
    quantity: 120,
    avgCost: 96.8,
    currentPrice: 98.4,
    totalValue: 11808.0,
    gain: 192.0,
    gainPct: 1.65,
  },
  {
    id: "3",
    name: "Apple Inc.",
    ticker: "AAPL",
    category: "Equity",
    quantity: 30,
    avgCost: 162.0,
    currentPrice: 211.45,
    totalValue: 6343.5,
    gain: 1483.5,
    gainPct: 30.53,
  },
  {
    id: "4",
    name: "Brookfield Infrastructure Partners",
    ticker: "BIP",
    category: "Alternative",
    quantity: 75,
    avgCost: 38.2,
    currentPrice: 35.9,
    totalValue: 2692.5,
    gain: -172.5,
    gainPct: -6.02,
  },
  {
    id: "5",
    name: "iShares MSCI Emerging Markets ETF",
    ticker: "EEM",
    category: "Equity",
    quantity: 200,
    avgCost: 41.6,
    currentPrice: 44.3,
    totalValue: 8860.0,
    gain: 540.0,
    gainPct: 6.49,
  },
  {
    id: "6",
    name: "US Treasury Bill 6M",
    ticker: "T-BILL",
    category: "Cash & Equiv.",
    quantity: 50000,
    avgCost: 1.0,
    currentPrice: 1.0,
    totalValue: 50000.0,
    gain: 0,
    gainPct: 0,
  },
]

const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0)
const totalGain = holdings.reduce((sum, h) => sum + h.gain, 0)

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function GainCell({ gain, pct }: { gain: number; pct: number }) {
  const positive = gain >= 0
  return (
    <span className={positive ? "text-green-600" : "text-red-500"}>
      {positive ? "+" : ""}
      {fmt(gain)} ({positive ? "+" : ""}
      {pct.toFixed(2)}%)
    </span>
  )
}

const categoryColors: Record<string, "default" | "secondary" | "outline"> = {
  Equity: "default",
  "Fixed Income": "secondary",
  Alternative: "outline",
  "Cash & Equiv.": "outline",
}

export default function WealthPage() {
  return (
    <PageWrapper>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Wealth</PageHeaderTitle>
          <PageHeaderDescription>
            Portfolio value:{" "}
            <span className="font-semibold text-foreground">${fmt(totalValue)}</span>
            {" · "}
            Total gain:{" "}
            <span className="font-semibold text-green-600">+${fmt(totalGain)}</span>
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Export</Button>
          <Button>Add holding</Button>
        </PageHeaderActions>
      </PageHeader>
      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>{holdings.length} positions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Gain / Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <div className="font-medium">{h.name}</div>
                      <div className="text-xs text-muted-foreground">{h.ticker}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={categoryColors[h.category] ?? "outline"}>
                        {h.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{h.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${fmt(h.avgCost)}</TableCell>
                    <TableCell className="text-right">${fmt(h.currentPrice)}</TableCell>
                    <TableCell className="text-right font-medium">${fmt(h.totalValue)}</TableCell>
                    <TableCell className="text-right">
                      <GainCell gain={h.gain} pct={h.gainPct} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageContent>
    </PageWrapper>
  )
}
