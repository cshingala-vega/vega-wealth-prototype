# CLAUDE.md

This file guides Claude Code when working on this prototype.

## Project overview

VUI-based Next.js 15 prototype built with `create-vui-prototype`.

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
```

## Architecture

- **Components:** Installed from https://cn.vui.run registry via shadcn CLI
- **Routing:** Next.js App Router with route groups ((app), (auth))
- **Navigation:** Sidebar (configurable in lib/nav-config.ts)
- **Theming:** Tailwind v4 + CSS variable fallbacks (app/globals.css)

## Key files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with theme and Toaster |
| `app/(app)/layout.tsx` | Sidebar navigation wrapper |
| `app/(auth)/layout.tsx` | Centred card layout for auth pages |
| `lib/nav-config.ts` | Navigation items (customise here) |
| `components.json` | shadcn config pointing to cn.vui.run registry |
| `.claude/skills/` | 8 distributed VUI skills |

## Adding components

```bash
npx shadcn@latest add https://cn.vui.run/r/[name]
```

Components install to `@/components/vui/`. Standard shadcn components install to `@/components/ui/`.

## Skills

The following skills are available in `.claude/skills/`:

- **prototyping-with-vui** — Page composition with VUI components
- **theming-vui-components** — CSS variable theming and brand customisation
- **scaffolding-vui-apps** — Multi-page app scaffolding with navigation
- **rendering-vui-demos** — Component demos and variant previews
- **generating-vui-content** — Realistic mock data generation
- **visualizing-vui-data** — Charts and dashboards with recharts
- **wiring-vui-forms** — Forms with react-hook-form and zod
- **shadcn** — Foundational shadcn/ui patterns

## Full registry

Browse all components at https://cn.vui.run
