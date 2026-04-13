---
name: prototyping-with-vui
description: Builds page prototypes using VUI CN whitelabel components. Applies when creating pages, screens, layouts, dashboards, settings views, lists, or any UI prototype using VUI, cn.vui.run, or the registry/vui components. Guides component selection, layout composition, and realistic data rendering for product managers.
user-invocable: true
---

# Prototyping with VUI

Build complete page prototypes using VUI CN's whitelabel component registry. VUI extends shadcn/ui with layout components, theming via CSS variables, and composition patterns for multi-tenant apps.

> The `shadcn` skill handles general shadcn patterns (forms, icons, styling). This skill covers VUI-specific composition and components.

## Quick Start

1. **Pick a layout shell** — Sidebar or Topbar (or both)
2. **Add page structure** — PageWrapper + PageHeader + content
3. **Compose content** — Cards, Items, Tables, Empty states
4. **Use realistic data** — Real names, plausible amounts, mixed statuses

## Layout Shells

### Sidebar Layout
```tsx
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from "@/components/vui/sidebar"

<SidebarProvider>
  <Sidebar>
    <SidebarHeader>{/* Logo / app name */}</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive><HomeIcon /> Dashboard</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    {/* Page content goes here */}
  </SidebarInset>
</SidebarProvider>
```

### Topbar Layout
```tsx
import { TopbarProvider, Topbar, TopbarInset, TopbarLeft, TopbarRight, TopbarContent } from "@/components/vui/topbar"

<TopbarProvider>
  <Topbar variant="sticky">
    <TopbarLeft><span className="font-semibold">App Name</span></TopbarLeft>
    <TopbarRight>
      <TopbarContent>{/* Nav items, avatar */}</TopbarContent>
    </TopbarRight>
  </Topbar>
  <TopbarInset>
    {/* Page content goes here */}
  </TopbarInset>
</TopbarProvider>
```

### Page Structure (inside any shell)
```tsx
import { PageWrapper, PageContent, PageHeader, PageHeaderContent, PageHeaderTitle, PageHeaderDescription, PageHeaderActions } from "@/components/vui/layout/page-layout"

<PageWrapper variant="focused">
  <PageHeader>
    <PageHeaderContent>
      <PageHeaderTitle>Page Title</PageHeaderTitle>
      <PageHeaderDescription>Brief description</PageHeaderDescription>
    </PageHeaderContent>
    <PageHeaderActions>
      <Button>Primary Action</Button>
    </PageHeaderActions>
  </PageHeader>
  <PageContent>
    {/* Cards, tables, items, etc. */}
  </PageContent>
</PageWrapper>
```

**PageWrapper variants:**
- `"focused"` (default) — max-width 5xl, centered
- `"full"` — full width
- `"slim"` — narrow, for forms/settings

## Component Selection Guide

| Need | Component | Key parts |
|------|-----------|-----------|
| List of records | `Item` | ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions |
| Status indicator | `Dot` | variant: positive / negative / pending / neutral |
| Confirmation flow | `ActionaryModal` | ActionaryModalContent, Header, Footer, Title, Description |
| Empty state | `Empty` | EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription |
| Form layout | `Field` | FieldGroup, FieldLabel, FieldDescription, FieldError |
| Top navigation | `Topbar` | TopbarLeft, TopbarRight, TopbarContent, TopbarMenu |
| Page chrome | `PageLayout` | PageWrapper, PageHeader, PageHeaderTitle, PageHeaderActions |
| Grouped buttons | `ButtonGroup` | ButtonGroupSeparator, ButtonGroupText |
| Section heading | `Heading` | as="h1"-"h6", size: sm / md / lg / xl |
| Content grid | `Grid` | GridItem, gap: sm / md / lg / xl |
| Scroll hint | `ScrollFade` | side: top / bottom / left / right |
| Keyboard hint | `Kbd` | KbdGroup for key combos |

For standard shadcn components (Card, Table, Dialog, Tabs, etc.), import from `@/components/vui/` — they include CSS variable theming.

## Composition Patterns

### Record List Page
```tsx
<PageWrapper variant="focused">
  <PageHeader>
    <PageHeaderContent>
      <PageHeaderTitle>Team Members</PageHeaderTitle>
      <PageHeaderDescription>12 members</PageHeaderDescription>
    </PageHeaderContent>
    <PageHeaderActions><Button>Invite</Button></PageHeaderActions>
  </PageHeader>
  <PageContent>
    <Card>
      <CardContent className="p-0">
        <ItemGroup>
          <Item>
            <ItemMedia variant="icon"><Avatar><AvatarImage src="..." /><AvatarFallback>AO</AvatarFallback></Avatar></ItemMedia>
            <ItemContent>
              <ItemTitle>Amara Osei</ItemTitle>
              <ItemDescription>amara@example.com</ItemDescription>
            </ItemContent>
            <ItemActions><Dot variant="positive" /><Badge variant="secondary">Admin</Badge></ItemActions>
          </Item>
          <ItemSeparator />
          {/* More items... */}
        </ItemGroup>
      </CardContent>
    </Card>
  </PageContent>
</PageWrapper>
```

### Dashboard with Stats
```tsx
<PageWrapper variant="full">
  <PageHeader>
    <PageHeaderContent><PageHeaderTitle>Dashboard</PageHeaderTitle></PageHeaderContent>
  </PageHeader>
  <PageContent>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle>Revenue</CardTitle><CardDescription>This month</CardDescription></CardHeader>
        <CardContent><p className="text-3xl font-bold">$24,580</p></CardContent>
        <CardFooter><p className="text-sm text-muted-foreground">+12.5% from last month</p></CardFooter>
      </Card>
      {/* More stat cards */}
    </div>
  </PageContent>
</PageWrapper>
```

### Empty State
```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><InboxIcon className="size-10 text-muted-foreground" /></EmptyMedia>
    <EmptyTitle>No projects yet</EmptyTitle>
    <EmptyDescription>Create your first project to get started</EmptyDescription>
  </EmptyHeader>
  <EmptyContent><Button>Create project</Button></EmptyContent>
</Empty>
```

## Critical Rules

1. **Always import from `@/components/vui/`** — never `@/components/ui/`. Registry components include VUI theming.
2. **Use VUI color tokens** — `bg-button-primary`, `bg-topbar`, `text-card-foreground`. Not raw Tailwind colors.
3. **Use full compound composition** — Card needs CardHeader + CardTitle + CardContent. Item needs ItemContent + ItemTitle. Don't skip parts.
4. **Add `"use client"`** at the top of any file using useState, useEffect, event handlers, or hooks like useSidebar/useTopbar.
5. **Realistic mock data** — Real names, plausible dates/amounts, mixed statuses. Never lorem ipsum.
6. **Layout imports** — PageLayout components import from `@/components/vui/layout/page-layout`. Grid from `@/components/vui/layout/grid`.

## References

- [references/page-recipes.md](references/page-recipes.md) — Complete page templates for common patterns
- [references/component-apis.md](references/component-apis.md) — VUI-specific component API quick reference

## VUI CLI

The project includes `vui-run`, a CLI for working with the registry. Use it via `npx vui-run` or directly if installed globally.

| Command | What it does |
|---|---|
| `vui-run add <name>` | Install a component (e.g. `vui-run add card`) |
| `vui-run add --category forms` | Install all components in a category |
| `vui-run add` | Open the interactive component picker |
| `vui-run variables <name>` | Show theme override CSS variables for a component |
| `vui-run variables --all` | List all components with theme variables |
| `vui-run docs <name>` | View component docs in the terminal |
| `vui-run docs --list` | List all available components |
| `vui-run browse <name>` | Open component docs in the browser |

Prefer `vui-run add` over raw `npx shadcn@latest add` — it resolves from the VUI registry, shows theme override hints after install, and handles dependency resolution.

For theming: use the `theming-vui-components` skill.
For single component demos: use the `rendering-vui-demos` skill.
