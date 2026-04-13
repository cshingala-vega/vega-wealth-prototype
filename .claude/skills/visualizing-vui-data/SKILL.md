---
name: visualizing-vui-data
description: Builds data visualization pages with charts, graphs, dashboards, metrics, analytics panels, and visualization components using recharts. Use when creating stats cards, KPIs, data tables with inline charts, pie charts, bar charts, line charts, area charts, or any data-driven UI with VUI components.
user-invocable: true
---

# Visualizing VUI Data

Build data visualization pages using VUI's chart components, stat cards, and data tables. VUI wraps recharts with theme-aware containers, tooltips, and legends that integrate with the whitelabel CSS variable system.

## Installing the Chart Stack

```bash
npx shadcn@latest add https://cn.vui.run/r/chart
```

This installs `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, and `ChartStyle` into `@/components/vui/chart`. It also adds `recharts` as a dependency.

For stat card layouts, also install:
```bash
npx shadcn@latest add https://cn.vui.run/r/card
npx shadcn@latest add https://cn.vui.run/r/badge
npx shadcn@latest add https://cn.vui.run/r/table
```

## ChartConfig Type

Every chart starts with a `ChartConfig` object that maps data keys to labels, icons, and colors:

```tsx
import { type ChartConfig } from "@/components/vui/chart"

// Option 1: Static color (same in light and dark)
const config = {
  revenue: {
    label: "Revenue",
    color: "#2563eb",
  },
} satisfies ChartConfig

// Option 2: Theme-aware colors (different per theme)
const config = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "#2563eb",
      dark: "#60a5fa",
    },
  },
} satisfies ChartConfig
```

Each key in the config maps to `{ label, icon?, color? }` OR `{ label, icon?, theme: { light, dark } }`. You cannot mix `color` and `theme` on the same key.

## CSS Variable Injection

`ChartContainer` reads the config and auto-generates `--color-<key>` CSS variables scoped to the chart element. Use these variables in recharts primitives:

```tsx
<Line stroke="var(--color-revenue)" />
<Bar fill="var(--color-sales)" />
<Area fill="var(--color-traffic)" stroke="var(--color-traffic)" />
```

For theme-aware charts, the container injects different values under `.dark` and default selectors, so colors adapt automatically.

## ChartContainer

Wraps all recharts content. Provides the config context and a `ResponsiveContainer`:

```tsx
import { ChartContainer } from "@/components/vui/chart"
import { LineChart, Line } from "recharts"

<ChartContainer config={chartConfig} className="h-[300px] w-full">
  <LineChart data={data}>
    <Line dataKey="revenue" stroke="var(--color-revenue)" />
  </LineChart>
</ChartContainer>
```

The container renders with `aspect-video` by default. Override with `className="h-[300px] w-full"` or similar.

## Available Recharts Primitives

Import these directly from `"recharts"`:

- **Line charts:** `LineChart`, `Line`
- **Bar charts:** `BarChart`, `Bar`
- **Area charts:** `AreaChart`, `Area`
- **Pie charts:** `PieChart`, `Pie`, `Cell`
- **Radar charts:** `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`
- **Radial charts:** `RadialBarChart`, `RadialBar`
- **Shared:** `XAxis`, `YAxis`, `CartesianGrid`, `ResponsiveContainer`, `Tooltip`, `Legend`

Always import recharts primitives from `"recharts"`, not from the VUI chart module.

## ChartTooltip + ChartTooltipContent

Custom tooltip that reads `ChartConfig` for labels and uses VUI's themed tooltip styling:

```tsx
import { ChartTooltip, ChartTooltipContent } from "@/components/vui/chart"

<ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
```

**`indicator` prop options:**
- `"dot"` (default) — small colored circle
- `"line"` — thin colored bar
- `"dashed"` — dashed border indicator

**Other useful props on `ChartTooltipContent`:**
- `hideLabel` — omit the label row
- `hideIndicator` — omit the color indicator
- `nameKey` — override which data key maps to the config label
- `labelKey` — override which key to use for the tooltip header
- `formatter` — custom render function for tooltip items
- `labelFormatter` — custom render function for the tooltip header

## ChartLegend + ChartLegendContent

Legend that reads `ChartConfig` for labels and icons:

```tsx
import { ChartLegend, ChartLegendContent } from "@/components/vui/chart"

<ChartLegend content={<ChartLegendContent />} />
```

Props on `ChartLegendContent`:
- `hideIcon` — omit the colored square
- `nameKey` — override which data key maps to config labels
- `verticalAlign` — `"top"` or `"bottom"` (default), controls padding direction

## Stat Card Pattern

Stat cards use standard Card components with computed metrics:

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/vui/card"

<Card>
  <CardHeader>
    <CardDescription>Total Revenue</CardDescription>
    <CardTitle className="text-3xl font-bold tabular-nums">$45,231</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      <span className="text-emerald-600">+20.1%</span> from last month
    </p>
  </CardContent>
</Card>
```

Arrange in a responsive grid:
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* 4 stat cards */}
</div>
```

## Color Strategy

**Use `theme` for production charts** where light/dark appearance matters:
```tsx
theme: { light: "#2563eb", dark: "#60a5fa" }
```

**Use `color` for quick prototypes** or charts where one color works in both modes:
```tsx
color: "#8b5cf6"
```

Good color palettes for multi-series charts:
- Blues: `#2563eb`, `#60a5fa`, `#93c5fd`
- Mixed: `#2563eb`, `#e11d48`, `#16a34a`, `#f59e0b`
- Oklch (theme-aware): `oklch(0.6 0.2 250)`, `oklch(0.6 0.2 15)`, `oklch(0.6 0.15 150)`

## Data Format

Recharts expects an array of flat objects with consistent keys:

```tsx
const data = [
  { month: "Jan", revenue: 4000, expenses: 2400 },
  { month: "Feb", revenue: 3000, expenses: 1398 },
  { month: "Mar", revenue: 5000, expenses: 3200 },
]
```

Each key used as a `dataKey` in a chart element should have a corresponding entry in `ChartConfig`.

## Critical Rules

1. **Always wrap charts in `ChartContainer`** — it provides the config context, responsive sizing, and CSS variable injection. Raw recharts without the container will not have VUI theming.
2. **Define `ChartConfig` before use** — the config must be declared outside the component or memoized. Each data key used in chart elements needs a config entry.
3. **Import chart components from `@/components/vui/chart`** — `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`.
4. **Import recharts primitives from `"recharts"`** — `LineChart`, `BarChart`, `Bar`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Pie`, `Cell`, `Area`, etc.
5. **Use CSS variables for colors** — `stroke="var(--color-<key>)"` and `fill="var(--color-<key>)"` where `<key>` matches a ChartConfig key.
6. **Add `"use client"` directive** — chart pages use browser APIs and must be client components.
7. **Use `satisfies ChartConfig`** — for type safety on config objects without losing key inference.

## References

- [references/chart-recipes.md](references/chart-recipes.md) — Complete chart and dashboard recipes with working TSX
