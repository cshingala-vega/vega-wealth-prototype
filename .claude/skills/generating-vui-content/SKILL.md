---
name: generating-vui-content
description: Generate realistic mock data and content for VUI prototypes — mock data, realistic content, sample data, seed data, placeholder content, test data, domain data, fake data, prototype data, dummy data, user profiles, product listings, order history, team members
user-invocable: true
---

# Generating VUI Content

This skill helps you generate realistic, diverse mock data for prototypes built with VUI components. Every dataset should feel like it came from a real product — never placeholder slop.

## Content Principles

### Diverse Names

Always use a mix of cultural backgrounds. Never default to all-Western names.

Good examples:
- Amara Osei, Kai Tanaka, Priya Sharma, Lucas Moreno, Sofia Chen
- Fatima Al-Rashid, Ingrid Bergström, Tomás Herrera, Mei-Ling Wu, Oluwaseun Adeyemi
- Rhys Blackwood, Nadia Volkov, Arjun Patel, Camille Dubois, Hiroshi Nakamura

### Emails

Always use the `@example.com` domain. Never use real domains.

```
amara.osei@example.com
kai.tanaka@example.com
```

### Dates

Use relative dates anchored to today. Never hardcode stale dates.

```tsx
import { subDays, subHours, addDays, format } from "date-fns"

const today = new Date()
const recentOrders = [
  { date: subHours(today, 2) },   // "2 hours ago"
  { date: subDays(today, 1) },    // "yesterday"
  { date: subDays(today, 3) },    // "3 days ago"
  { date: addDays(today, 7) },    // "next week"
]
```

When dates must be static (e.g. start dates, signup dates), use `new Date("2026-...")` values relative to the current year.

### Amounts and Numbers

Use plausible, varied numbers with proper formatting:
- Prices: `$14.99`, `$2,340.00`, `$89.00`
- Counts: `847 items`, `12,403 users`, `3.2k`
- Percentages: `94.2%`, `12%`, `-3.1%`

Format with `Intl.NumberFormat` or utility helpers:

```tsx
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
fmt.format(2340) // "$2,340.00"
```

### Status Distribution

Use a realistic mix across records — not all positive, not all negative:
- ~40% positive (active, completed, paid)
- ~30% neutral/pending (pending, processing, in-progress)
- ~20% negative (cancelled, failed, overdue)
- ~10% other (draft, archived, on-hold)

### Images

For avatars, use UI Avatars:
```
https://ui-avatars.com/api/?name=Amara+Osei
https://ui-avatars.com/api/?name=Kai+Tanaka
```

For product or generic images, use Picsum with seeded IDs for consistency:
```
https://picsum.photos/seed/prod-001/200
https://picsum.photos/seed/prod-002/200
```

### Text Content

Write realistic copy that matches the component's purpose. Descriptions should sound like a real PM wrote them — concise, specific, not generic.

- Task title: "Migrate auth service to OAuth 2.1" not "Task 1"
- Product name: "Wireless Charging Pad — Slate" not "Product A"
- Notification: "Deployment to staging completed in 2m 14s" not "Something happened"

**Never use lorem ipsum.** Ever.

## Type-First Approach

Always define the TypeScript interface before generating data. This keeps the data structure explicit and lets the prototype catch mismatches early.

```tsx
type Contact = {
  id: string
  name: string
  email: string
  company: string
  role: string
  status: "active" | "inactive" | "lead"
  dealValue: number
}

const contacts: Contact[] = [
  {
    id: "con-001",
    name: "Amara Osei",
    email: "amara.osei@example.com",
    company: "Verdant Systems",
    role: "VP of Engineering",
    status: "active",
    dealValue: 48000,
  },
  // ...
]
```

## Status to Dot Variant Mapping

VUI's `Dot` component uses semantic variants. Map your domain statuses to these variants:

```tsx
import { Dot } from "@/components/vui/dot"

const statusMap: Record<string, "positive" | "negative" | "pending" | "neutral"> = {
  active: "positive",
  completed: "positive",
  paid: "positive",
  pending: "pending",
  processing: "pending",
  "in-progress": "pending",
  cancelled: "negative",
  failed: "negative",
  overdue: "negative",
  draft: "neutral",
  archived: "neutral",
  inactive: "neutral",
}

// Usage
<Dot variant={statusMap[item.status]}>{item.status}</Dot>
```

## Badge Variant Mapping for Priority

```tsx
import { Badge } from "@/components/vui/badge"

const priorityMap: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  critical: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
}

<Badge variant={priorityMap[item.priority]}>{item.priority}</Badge>
```

## Date Formatting

Use `Intl.DateTimeFormat` for display or `date-fns` `format()`:

```tsx
// Intl — no dependency
new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date)
// → "Mar 11, 2026"

// date-fns — when already in the project
import { format, formatDistanceToNow } from "date-fns"
format(date, "MMM d, yyyy")          // "Mar 11, 2026"
formatDistanceToNow(date, { addSuffix: true }) // "3 days ago"
```

## Data Generation Patterns

- Generate **8-12 items** per dataset — enough to fill a table or list without overwhelming
- Use **sequential IDs** with a domain prefix: `con-001`, `ORD-1042`, `task-007`
- Mix statuses following the distribution above
- Vary string lengths — some names short, some long
- Include at least one edge-case value per dataset (e.g. a $0 deal, an empty tags array, a very long name)

## VUI Component Imports

All VUI components are installed via:
```bash
npx shadcn@latest add https://cn.vui.run/r/[name]
```

And imported from:
```tsx
import { Dot } from "@/components/vui/dot"
import { Badge } from "@/components/vui/badge"
import { DataTable } from "@/components/vui/data-table"
```

## Ready-to-Use Datasets

See [references/domain-datasets.md](./references/domain-datasets.md) for 5 complete, copy-paste-ready datasets:
1. CRM Contacts
2. E-commerce Orders
3. Project Management Tasks
4. HR Employees
5. SaaS Metrics / Billing

## Critical Rules

1. **Never use lorem ipsum** — write real copy that matches context
2. **Always use `@example.com`** for email addresses
3. **Keep data culturally diverse** — names, locations, companies
4. **Define types first** — interface before data
5. **Use relative dates** — anchor to `new Date()` or current year
6. **Map statuses to VUI variants** — Dot for status, Badge for priority
7. **8-12 records** per dataset — realistic volume
8. **Format numbers properly** — currency, percentages, counts
