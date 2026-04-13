# Chart Recipes

Complete, working chart recipes using VUI chart components with recharts.

---

## 1. Line Chart (Time Series) — Monthly Revenue

```tsx
"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/vui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

const chartData = [
  { month: "Jan", revenue: 18600 },
  { month: "Feb", revenue: 22400 },
  { month: "Mar", revenue: 19800 },
  { month: "Apr", revenue: 27300 },
  { month: "May", revenue: 31200 },
  { month: "Jun", revenue: 29500 },
  { month: "Jul", revenue: 34100 },
  { month: "Aug", revenue: 32800 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "#2563eb",
      dark: "#60a5fa",
    },
  },
} satisfies ChartConfig

export function RevenueLineChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value) => `Month: ${value}`}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-revenue)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
```

---

## 2. Bar Chart (Comparison) — Product Sales

```tsx
"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/vui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

const chartData = [
  { product: "Widget A", online: 4200, retail: 2800 },
  { product: "Widget B", online: 3100, retail: 4100 },
  { product: "Widget C", online: 5600, retail: 3200 },
  { product: "Widget D", online: 2900, retail: 1800 },
  { product: "Widget E", online: 4800, retail: 3900 },
  { product: "Widget F", online: 3700, retail: 2600 },
]

const chartConfig = {
  online: {
    label: "Online Sales",
    theme: {
      light: "#2563eb",
      dark: "#60a5fa",
    },
  },
  retail: {
    label: "Retail Sales",
    theme: {
      light: "#e11d48",
      dark: "#fb7185",
    },
  },
} satisfies ChartConfig

export function ProductSalesBarChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="product"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
        />
        <ChartTooltip
          content={<ChartTooltipContent indicator="dot" />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="online"
          fill="var(--color-online)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="retail"
          fill="var(--color-retail)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
```

**Stacked variant:** Add `stackId="sales"` to both `<Bar>` elements to stack them instead of grouping side by side.

---

## 3. Pie Chart (Distribution) — Category Breakdown

```tsx
"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/vui/chart"
import { PieChart, Pie, Cell } from "recharts"

const chartData = [
  { category: "electronics", value: 42500, fill: "var(--color-electronics)" },
  { category: "clothing", value: 28300, fill: "var(--color-clothing)" },
  { category: "groceries", value: 18700, fill: "var(--color-groceries)" },
  { category: "furniture", value: 12400, fill: "var(--color-furniture)" },
  { category: "other", value: 8100, fill: "var(--color-other)" },
]

const chartConfig = {
  value: {
    label: "Sales",
  },
  electronics: {
    label: "Electronics",
    theme: { light: "#2563eb", dark: "#60a5fa" },
  },
  clothing: {
    label: "Clothing",
    theme: { light: "#e11d48", dark: "#fb7185" },
  },
  groceries: {
    label: "Groceries",
    theme: { light: "#16a34a", dark: "#4ade80" },
  },
  furniture: {
    label: "Furniture",
    theme: { light: "#f59e0b", dark: "#fbbf24" },
  },
  other: {
    label: "Other",
    theme: { light: "#6b7280", dark: "#9ca3af" },
  },
} satisfies ChartConfig

export function CategoryPieChart() {
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[350px]">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="category" hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          strokeWidth={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.category} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="category" />} />
      </PieChart>
    </ChartContainer>
  )
}
```

---

## 4. Area Chart (Stacked) — Traffic Sources Over Time

```tsx
"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/vui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"

const chartData = [
  { month: "Jan", organic: 4200, paid: 2400, referral: 1800 },
  { month: "Feb", organic: 4800, paid: 2100, referral: 2200 },
  { month: "Mar", organic: 5100, paid: 3200, referral: 1900 },
  { month: "Apr", organic: 5600, paid: 2800, referral: 2600 },
  { month: "May", organic: 6200, paid: 3500, referral: 2400 },
  { month: "Jun", organic: 5900, paid: 4100, referral: 2800 },
  { month: "Jul", organic: 6800, paid: 3800, referral: 3100 },
  { month: "Aug", organic: 7200, paid: 4200, referral: 2900 },
  { month: "Sep", organic: 6500, paid: 3600, referral: 3400 },
  { month: "Oct", organic: 7100, paid: 4500, referral: 3000 },
]

const chartConfig = {
  organic: {
    label: "Organic",
    theme: { light: "#2563eb", dark: "#60a5fa" },
  },
  paid: {
    label: "Paid",
    theme: { light: "#e11d48", dark: "#fb7185" },
  },
  referral: {
    label: "Referral",
    theme: { light: "#16a34a", dark: "#4ade80" },
  },
} satisfies ChartConfig

export function TrafficAreaChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="fillOrganic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-organic)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-organic)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="fillPaid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-paid)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-paid)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="fillReferral" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-referral)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-referral)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="referral"
          stackId="traffic"
          stroke="var(--color-referral)"
          fill="url(#fillReferral)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="paid"
          stackId="traffic"
          stroke="var(--color-paid)"
          fill="url(#fillPaid)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="organic"
          stackId="traffic"
          stroke="var(--color-organic)"
          fill="url(#fillOrganic)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
```

---

## 5. Stat Cards Dashboard — KPIs + Chart

A complete dashboard page with 4 stat cards and a revenue trend line chart.

```tsx
"use client"

import {
  PageWrapper,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
} from "@/components/vui/layout/page-layout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/vui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/vui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+20.1%",
    trend: "up" as const,
    description: "from last month",
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+12.4%",
    trend: "up" as const,
    description: "from last month",
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "-0.4%",
    trend: "down" as const,
    description: "from last month",
  },
  {
    title: "Avg. Order Value",
    value: "$68.40",
    change: "+5.7%",
    trend: "up" as const,
    description: "from last month",
  },
]

const revenueData = [
  { month: "Jan", revenue: 32000 },
  { month: "Feb", revenue: 36500 },
  { month: "Mar", revenue: 34200 },
  { month: "Apr", revenue: 38800 },
  { month: "May", revenue: 42100 },
  { month: "Jun", revenue: 45231 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: { light: "#2563eb", dark: "#60a5fa" },
  },
} satisfies ChartConfig

export default function DashboardPage() {
  return (
    <PageWrapper variant="full">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Dashboard</PageHeaderTitle>
          <PageHeaderDescription>
            Key performance metrics for June 2026
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader>
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums">
                  {stat.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  {stat.trend === "up" ? (
                    <ArrowUpIcon className="size-3 text-emerald-600" />
                  ) : (
                    <ArrowDownIcon className="size-3 text-red-600" />
                  )}
                  <span
                    className={
                      stat.trend === "up"
                        ? "font-medium text-emerald-600"
                        : "font-medium text-red-600"
                    }
                  >
                    {stat.change}
                  </span>{" "}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Trend Chart */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                data={revenueData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-revenue)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </PageContent>
    </PageWrapper>
  )
}
```

---

## 6. Data Table with Charts — Product Performance

A table of products with status badges and a summary bar chart below.

```tsx
"use client"

import {
  PageWrapper,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
} from "@/components/vui/layout/page-layout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Dot } from "@/components/vui/dot"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/vui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

const products = [
  {
    name: "Enterprise Plan",
    status: "active" as const,
    health: "positive" as const,
    revenue: 128400,
    customers: 42,
    growth: "+18.3%",
  },
  {
    name: "Pro Plan",
    status: "active" as const,
    health: "positive" as const,
    revenue: 84200,
    customers: 156,
    growth: "+12.7%",
  },
  {
    name: "Starter Plan",
    status: "active" as const,
    health: "pending" as const,
    revenue: 32100,
    customers: 312,
    growth: "+2.1%",
  },
  {
    name: "Legacy Plan",
    status: "deprecated" as const,
    health: "negative" as const,
    revenue: 12800,
    customers: 28,
    growth: "-8.4%",
  },
  {
    name: "Trial",
    status: "active" as const,
    health: "neutral" as const,
    revenue: 0,
    customers: 89,
    growth: "+45.2%",
  },
]

const summaryData = [
  { plan: "Enterprise", revenue: 128400, customers: 42 },
  { plan: "Pro", revenue: 84200, customers: 156 },
  { plan: "Starter", revenue: 32100, customers: 312 },
  { plan: "Legacy", revenue: 12800, customers: 28 },
  { plan: "Trial", revenue: 0, customers: 89 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: { light: "#2563eb", dark: "#60a5fa" },
  },
  customers: {
    label: "Customers",
    theme: { light: "#16a34a", dark: "#4ade80" },
  },
} satisfies ChartConfig

export default function ProductPerformancePage() {
  return (
    <PageWrapper variant="full">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Product Performance</PageHeaderTitle>
          <PageHeaderDescription>
            Revenue and customer metrics by plan
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Plans Overview</CardTitle>
            <CardDescription>All active and deprecated plans</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                  <TableHead className="text-right">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active" ? "secondary" : "outline"
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dot variant={product.health} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${product.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {product.customers}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        product.growth.startsWith("+")
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.growth}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Chart */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Revenue vs. Customers by Plan</CardTitle>
            <CardDescription>
              Comparing revenue and customer count across plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={summaryData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="plan"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="revenue"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="customers"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  yAxisId="revenue"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="customers"
                  dataKey="customers"
                  fill="var(--color-customers)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </PageContent>
    </PageWrapper>
  )
}
```
