---
name: rendering-vui-demos
description: Renders individual VUI CN component demos with realistic data and all variant combinations. Applies when previewing a component, showing component variants, testing what a VUI component looks like, rendering a demo, or exploring available components. Provides example code with mock data for any registry component.
user-invocable: true
---

# Rendering VUI Demos

Quickly render VUI CN components with realistic data to evaluate appearance and behavior.

## Workflow

1. User names a component (or describes a need)
2. Look up the component in the [registry index](references/registry-index.md)
3. Generate a demo page showing all variants with realistic data
4. Place the demo at a route the user can view (e.g., `app/demo/page.tsx`)

## Demo Page Template

```tsx
// app/demo/page.tsx
"use client"

import { ComponentName } from "@/components/vui/component-name"

export default function Demo() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">ComponentName Demo</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-muted-foreground">Variants</h2>
        <div className="flex flex-wrap gap-4">
          {/* Show each variant */}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-muted-foreground">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          {/* Show each size */}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-muted-foreground">Composition</h2>
        {/* Show compound component usage with realistic data */}
      </section>
    </div>
  )
}
```

## Installing Components

Components are installed via the shadcn CLI into the consumer project:
```bash
npx shadcn@latest add https://cn.vui.run/r/[name]
```

This places them in `@/components/vui/`. Always check if the component is installed before importing.

## Mock Data Guidelines

- **Names**: Use diverse, realistic names — "Amara Osei", "Kai Tanaka", "Priya Sharma"
- **Dates**: Use dates relative to today — `new Date()`, `subDays(new Date(), 3)`
- **Amounts**: Use plausible numbers — $14.99, $2,340.00, 847 items
- **Status**: Mix of states — 2 positive, 1 pending, 1 negative
- **Images**: Use `https://picsum.photos/200` or `https://ui-avatars.com/api/?name=Name` for placeholders
- **Text**: Write realistic copy that matches the component's purpose — never lorem ipsum
- **Emails**: Use `@example.com` domain — "amara@example.com"

## Variant Rendering Rules

For components with CVA variants, show **every** variant × size combination:

```tsx
// Button: 6 variants × 3 main sizes = 18 combinations
const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const
const sizes = ["default", "sm", "lg"] as const

{variants.map(v => (
  <div key={v} className="flex items-center gap-2">
    {sizes.map(s => <Button key={s} variant={v} size={s}>{v} {s}</Button>)}
  </div>
))}
```

## Compound Component Rules

Always show the **full composition** — never render a parent without its expected children:

```tsx
// Wrong: bare Card
<Card>Some content</Card>

// Correct: full Card composition
<Card>
  <CardHeader>
    <CardTitle>Monthly Revenue</CardTitle>
    <CardDescription>Revenue breakdown for March 2026</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold">$12,450.00</p>
  </CardContent>
  <CardFooter>
    <p className="text-sm text-muted-foreground">+12% from last month</p>
  </CardFooter>
</Card>
```

## Critical Rules

1. **Import from `@/components/vui/`** — components are installed there by the shadcn CLI from the VUI registry
2. **Show ALL exported variants** for the component
3. **Include compound sub-components** — don't just show Card, show Card + CardHeader + CardTitle + CardContent
4. **Add `"use client"`** only when the demo uses useState, useEffect, or event handlers
5. **Use VUI color tokens** (e.g., `bg-button-primary`) not standard Tailwind colors in any custom wrappers
6. **Label each section** so the PM can identify what they're looking at

## Registry Quick Lookup

See [references/registry-index.md](references/registry-index.md) for all available components, their exports, and usage examples.
