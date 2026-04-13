---
name: scaffolding-vui-apps
description: Scaffold multi-page Next.js App Router prototypes with VUI sidebar and topbar navigation, route groups, and layout files. Use this skill whenever someone wants to create a new app, set up routing, build an app shell, add navigation, scaffold a CRM, SaaS dashboard, admin panel, or any multi-page prototype with VUI components. Also applies when adding sidebar or topbar navigation to an existing project.
user-invocable: true
---

# Scaffolding VUI Apps

Generate navigable multi-page prototypes using VUI navigation components (Sidebar, Topbar) with Next.js App Router routing.

## When to Use

Use this skill when the user wants to:
- Create a new multi-page prototype or app shell
- Add sidebar or topbar navigation to a project
- Set up routing with route groups and layouts
- Scaffold a CRM, dashboard, admin panel, or SaaS prototype

## Prerequisites

Install VUI components the user needs:
```bash
npx shadcn@latest add https://cn.vui.run/r/sidebar
npx shadcn@latest add https://cn.vui.run/r/topbar
npx shadcn@latest add https://cn.vui.run/r/button
# Plus any page-level components (card, table, etc.)
```

Components land in `@/components/vui/`. Always verify they're installed before importing.

## App Shell Patterns

There are three common navigation patterns. Choose based on the prototype:

| Pattern | Best for | Components |
|---|---|---|
| **Sidebar app** | CRM, admin panels, settings-heavy apps | SidebarProvider + Sidebar + SidebarInset |
| **Topbar app** | Marketing SaaS, public-facing, content sites | TopbarProvider + Topbar + TopbarInset |
| **Combined** | Complex dashboards with both nav levels | Both providers nested |

## Directory Structure

Use Next.js route groups to scope layouts:

```
app/
├── layout.tsx              # Root: ThemeProvider, fonts, Toaster
├── (app)/                  # Route group for authenticated pages
│   ├── layout.tsx          # SidebarProvider + Sidebar + SidebarInset
│   ├── dashboard/
│   │   └── page.tsx
│   ├── contacts/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── (auth)/                 # Route group for auth screens
│   ├── layout.tsx          # Centered card layout, no nav
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
└── globals.css
```

Route groups `(app)` and `(auth)` share the root layout but have different sub-layouts — the app group gets a sidebar, the auth group gets a centered card.

## Root Layout

Every prototype needs a root layout with theme support:

```tsx
// app/layout.tsx
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/vui/sonner"
import "@/app/globals.css"

export const metadata: Metadata = { title: "My App" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster position="bottom-center" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Sidebar Navigation Wiring

The sidebar uses `usePathname()` for active state detection:

```tsx
// app/(app)/layout.tsx
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup,
  SidebarGroupLabel, SidebarGroupContent, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, SidebarInset,
  SidebarHeader, SidebarTrigger, SidebarRail,
} from "@/components/vui/sidebar"
import { LayoutDashboardIcon, UsersIcon, SettingsIcon } from "lucide-react"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Contacts", url: "/contacts", icon: UsersIcon },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <span className="px-2 text-lg font-semibold">Acme CRM</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="md:hidden sticky top-0 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

Key patterns:
- `isActive={pathname === item.url}` — exact match for top-level routes
- `isActive={pathname.startsWith(item.url)}` — prefix match for nested routes
- `SidebarRail` — thin hover target for collapsed state
- `SidebarTrigger` — mobile hamburger, hide on desktop with `md:hidden`
- Keyboard shortcut: `Cmd+B` toggles sidebar automatically

## Topbar Navigation Wiring

```tsx
// app/(app)/layout.tsx (topbar variant)
import {
  TopbarProvider, Topbar, TopbarLeft, TopbarCenter, TopbarRight,
  TopbarContent, TopbarMenu, TopbarMenuList, TopbarMenuItem,
  TopbarMenuLink, TopbarInset, TopbarTrigger,
} from "@/components/vui/topbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TopbarProvider>
      <Topbar variant="sticky">
        <TopbarLeft>
          <TopbarTrigger />
          <span className="font-semibold">Acme</span>
        </TopbarLeft>
        <TopbarCenter>
          <TopbarMenu>
            <TopbarMenuList>
              <TopbarMenuItem>
                <TopbarMenuLink href="/dashboard">Dashboard</TopbarMenuLink>
              </TopbarMenuItem>
              <TopbarMenuItem>
                <TopbarMenuLink href="/analytics">Analytics</TopbarMenuLink>
              </TopbarMenuItem>
            </TopbarMenuList>
          </TopbarMenu>
        </TopbarCenter>
        <TopbarRight>
          <TopbarContent>{/* Avatar, settings button */}</TopbarContent>
        </TopbarRight>
      </Topbar>
      <TopbarInset>{children}</TopbarInset>
    </TopbarProvider>
  )
}
```

Topbar variants: `sticky` (default scroll behavior), `fixed` (always visible), `floating` (centered with shadow).

## Page Stub Pattern

Each route gets a minimal page that can be fleshed out later:

```tsx
// app/(app)/dashboard/page.tsx
import { PageWrapper, PageContent, PageHeader, PageHeaderContent, PageHeaderTitle, PageHeaderDescription } from "@/components/vui/layout/page-layout"

export default function DashboardPage() {
  return (
    <PageWrapper variant="full">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Dashboard</PageHeaderTitle>
          <PageHeaderDescription>Overview of your account</PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        {/* Build out with cards, tables, charts */}
      </PageContent>
    </PageWrapper>
  )
}
```

## Critical Rules

1. **Import from `@/components/vui/`** — components are installed there by the shadcn CLI
2. **Use route groups** for layout scoping — `(app)` for nav pages, `(auth)` for login/signup
3. **Active state via `usePathname()`** — compare against nav item URLs
4. **Install before importing** — run `npx shadcn@latest add https://cn.vui.run/r/[name]` for each component
5. **Mobile-first** — always include `SidebarTrigger`/`TopbarTrigger` for mobile nav
6. **One provider per layout** — `SidebarProvider` or `TopbarProvider` wraps the layout, not individual pages

## App Templates

For complete working app shells with multiple pages, see [references/app-templates.md](references/app-templates.md).
