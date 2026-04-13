# Visual pattern to VUI component mapping

Use this reference when analysing a Figma screenshot. Match what you **see** to the VUI component, not what the Figma layers are named.

---

## Layout patterns

| What you see | VUI component | Notes |
|-------------|---------------|-------|
| Left sidebar with nav links | `Sidebar` + `SidebarMenu` | Use `SidebarProvider` + `SidebarInset` for the shell |
| Top horizontal nav bar | `Topbar` + `TopbarContent` | Use `TopbarProvider` + `TopbarInset` for the shell |
| Sidebar + topbar together | Nest `Topbar` inside `SidebarInset` | Sidebar is the outer shell |
| Centred narrow content area | `PageWrapper variant="slim"` | Good for settings, forms, auth pages |
| Full-width content area | `PageWrapper variant="full"` | Good for dashboards, data-heavy pages |
| Medium-width centred content | `PageWrapper variant="focused"` | Good for detail views, lists |
| Page title + description + button | `PageHeader` + `PageHeaderActions` | Always wrap content in `PageHeaderContent` |

## Navigation patterns

| What you see | VUI component | Notes |
|-------------|---------------|-------|
| Vertical list of nav items with icons | `SidebarMenu` + `SidebarMenuButton` | Set `isActive` on the current item |
| Grouped nav sections with labels | `SidebarGroup` + `SidebarGroupLabel` | One group per section |
| Horizontal tab strip | `Tabs` + `TabsList` + `TabsTrigger` | Wrap tab content in `TabsContent` |
| Breadcrumb trail (Home > Section > Page) | `Breadcrumb` + `BreadcrumbList` | Use `BreadcrumbSeparator` between items |
| Horizontal link row in top bar | `TopbarContent` with buttons/links | Use `variant="ghost"` for nav-style links |

## Data display patterns

| What you see | VUI component | Notes |
|-------------|---------------|-------|
| Table with column headers | `Table` + `TableHeader` + `TableBody` | Wrap in `Card` if it has a border/shadow |
| List of items with avatar + text + action | `Item` + `ItemMedia` + `ItemContent` + `ItemActions` | Wrap group in `ItemGroup` |
| List of items with icon + text | `Item` + `ItemMedia variant="icon"` + `ItemContent` | Use lucide icons |
| Grid of cards with stats | `div.grid` + `Card` | Use `grid-cols-1 md:grid-cols-3` for responsive |
| Single stat number with label | `Card` + `CardHeader` + `CardContent` | Title as label, large number in content |
| Key-value pairs (label: value rows) | `dl` or `Field` (read-only) | For settings/detail views |

## Content patterns

| What you see | VUI component | Notes |
|-------------|---------------|-------|
| Card with title, description, and content | `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` | Always use the full compound pattern |
| Card with action buttons at bottom | Add `CardFooter` | Typically contains `Button` elements |
| Empty state with icon and message | `Empty` + `EmptyMedia` + `EmptyTitle` + `EmptyDescription` | Centre within `PageContent` |
| Section heading within a page | `Heading` component or semantic `h2`/`h3` | Use `Heading` for consistent sizing |
| Separator line between sections | `Separator` | Works horizontal or vertical |

## Form patterns

| What you see | VUI component | Notes |
|-------------|---------------|-------|
| Text input with label above | `Field` + `FieldLabel` + `Input` | Wrap related fields in `FieldGroup` |
| Text input with helper text below | `Field` + `FieldLabel` + `Input` + `FieldDescription` | Description goes after input |
| Multi-line text area | `Field` + `FieldLabel` + `Textarea` | Same Field wrapper pattern |
| Dropdown / select | `Field` + `FieldLabel` + `Select` | Use `SelectTrigger` + `SelectContent` + `SelectItem` |
| Toggle switch with label | `Field` + `FieldLabel` + `Switch` | Good for boolean settings |
| Checkbox with text | `Field` + `Checkbox` + `FieldLabel` | Label follows checkbox |
| Search input with icon | `Input` with lucide `SearchIcon` | Place icon in a flex wrapper or use `InputGroup` |
| Group of radio options | `RadioGroup` + `RadioGroupItem` | Wrap each in `Field` for labels |
| Date picker field | `Field` + `DatePicker` or `Calendar` in a `Popover` | Uses `Button` as trigger |

## Status and feedback patterns

| What you see | VUI component | Notes |
|-------------|---------------|-------|
| Small coloured dot next to text | `Dot` | `variant`: positive (green), negative (red), pending (yellow), neutral (grey) |
| Coloured pill / tag | `Badge` | `variant`: default, secondary, outline, destructive |
| Coloured pill with dot inside | `Badge` + `Dot` inline | Common for status indicators |
| Toast / notification popup | `sonner` (Toaster) | Trigger with `toast()` function |
| Confirmation dialog over overlay | `AlertDialog` | Use for destructive confirmations |
| Modal with form content | `Dialog` | Use for creation/edit flows |
| Inline alert / warning banner | `Alert` + `AlertTitle` + `AlertDescription` | Use with lucide icon |

## Interactive patterns

| What you see | VUI component | Notes |
|-------------|---------------|-------|
| Primary action button (filled) | `Button` | Default variant |
| Secondary action button (lighter) | `Button variant="secondary"` | |
| Ghost/subtle button | `Button variant="ghost"` | Good for toolbar actions |
| Text-only link button | `Button variant="link"` | |
| Destructive / red button | `Button variant="destructive"` | |
| Icon-only button | `Button variant="ghost" size="icon"` | Wrap lucide icon inside |
| Row of action buttons | `ButtonGroup` | Groups buttons with proper border handling |
| Three-dot menu | `DropdownMenu` + `Button variant="ghost" size="icon"` | `MoreHorizontalIcon` as trigger |
| Right-click context menu | `ContextMenu` | Wraps the target element |
| Tooltip on hover | `Tooltip` + `TooltipTrigger` + `TooltipContent` | Wrap around the target element |

## Avatar and identity patterns

| What you see | VUI component | Notes |
|-------------|---------------|-------|
| Circular photo / initials | `Avatar` + `AvatarImage` + `AvatarFallback` | Fallback shows initials |
| Avatar with status dot | `Avatar` + position a `Dot` absolutely | Use relative positioning on wrapper |
| User row (avatar + name + email) | `Item` + `ItemMedia` (Avatar) + `ItemContent` (Title + Description) | |

## Composition patterns

| What you see | VUI component | Notes |
|-------------|---------------|-------|
| Card containing a list of items | `Card` + `CardContent className="p-0"` + `ItemGroup` | Remove padding so items fill the card |
| Table inside a card | `Card` + `CardContent className="p-0"` + `Table` | Remove padding for full-width table |
| Tabs containing different content sections | `Tabs` + `TabsContent` wrapping each section | Each tab can contain cards, tables, forms |
| Sidebar with logo at top, nav in middle, user at bottom | `SidebarHeader` + `SidebarContent` + `SidebarFooter` | Footer typically has avatar + name |
| Stats row above a main content area | `div.grid` for stats + `Card` or `Table` below | Use `gap-4` between sections |
| Search + filter row above data | `div.flex.items-center.gap-3` | Input + Badge(s) or Select |

---

## When you're unsure

If a visual element doesn't clearly match a VUI component:

1. **Check the registry** – use `search_components` MCP tool to find candidates
2. **Prefer composition** – build from smaller VUI primitives rather than custom HTML
3. **Use semantic HTML** – a simple `<div>` with Tailwind classes is fine for layout wrappers
4. **Don't force it** – if something is genuinely custom (a chart, a map, a canvas), note it as a placeholder and move on
