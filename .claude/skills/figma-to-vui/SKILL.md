---
name: figma-to-vui
description: Converts Figma frames into VUI prototype code. Applies when the user pastes a Figma URL, mentions converting a design to code, or wants to build a prototype from a Figma frame. Extracts layout structure only – ignores theme colours, radii, and font sizes so the prototype inherits its brand from VUI CSS variables. Works with any Figma file regardless of layer naming.
user-invocable: true
---

# Figma to VUI

Convert Figma designs into VUI prototype code. The output is a **structural wireframe** – layout, component composition, and content – that inherits its visual brand from VUI's CSS variable theming system.

> **Why structure only?** VUI is designed for whitelabelling. The same prototype can serve multiple GPs, each with their own brand theme. Hardcoding colours from a Figma file defeats the purpose. Extract the *what*, not the *how it looks*.

## Workflow

### Step 1: Read the design

Call `get_design_context` with the Figma file key and node ID. This returns:
- A **screenshot** of the frame (use this for visual pattern recognition)
- **Reference code** (use as a structural hint, not as output)
- **Metadata** about the node hierarchy

If the user provides a Figma URL, extract the file key and node ID from it:
```
https://figma.com/design/:fileKey/:fileName?node-id=1-2
  → fileKey: :fileKey
  → nodeId: 1:2
```

Pass `clientFrameworks: "react"` and `clientLanguages: "typescript"` for the best reference code output.

### Step 2: Analyse the structure

Look at the screenshot and reference code. Identify:

1. **Page layout** – sidebar? topbar? both? what width variant?
2. **Content sections** – header, card grid, data table, form, list, empty state
3. **Component patterns** – map visual elements to VUI components (see reference)
4. **Content** – headings, labels, placeholder text, data values
5. **Interactions** – buttons, links, tabs, filters (infer from context)

### Step 3: Map to VUI components

Use the [visual pattern mapping reference](references/pattern-map.md) to translate what you see into VUI components. When multiple components could work, prefer the VUI-specific one (e.g. `Item` over a custom flex layout).

### Step 4: Install and compose

1. Use the `search_components` and `install_components` MCP tools to ensure all needed components are present
2. Compose the page following the `prototyping-with-vui` skill's composition patterns
3. Use the `scaffolding-vui-apps` skill if creating a new route or layout

## Critical rules

### What to extract from Figma

- **Layout structure** – sidebar vs topbar, content width, section arrangement
- **Component hierarchy** – which components are nested inside which
- **Content and labels** – headings, descriptions, button labels, column headers
- **Data patterns** – how many items in a list, what fields are shown, status types
- **Interaction hints** – what's clickable, what has hover states, what's a form

### What to ignore from Figma

- **Colours** – never hardcode hex/rgb/oklch values from the design. Use VUI component defaults and variant props (`variant="secondary"`, `variant="destructive"`)
- **Border radii** – never set explicit `rounded-*` classes. VUI components inherit radii from CSS variables
- **Font sizes** – use component defaults or Tailwind's semantic scale (`text-sm`, `text-lg`), not pixel values from Figma
- **Shadows** – use VUI's shadow tokens, not custom `shadow-[...]` values
- **Spacing** – use Tailwind's standard scale (`gap-4`, `p-6`) based on visual proportion, not exact pixel values
- **Opacity/transparency** – use variant props or Tailwind's semantic opacity, not exact percentages

### Translation rules

| Figma pattern | VUI approach |
|---------------|-------------|
| Blue primary button | `<Button>` (inherits theme primary) |
| Grey secondary button | `<Button variant="secondary">` |
| Red danger button | `<Button variant="destructive">` |
| Coloured status pill | `<Badge variant="secondary">` or `<Badge variant="outline">` + `<Dot variant="positive">` |
| Rounded avatar circle | `<Avatar>` (inherits theme radius) |
| Card with shadow | `<Card>` (inherits theme shadow and radius) |
| Input with specific border colour | `<Input>` (inherits theme input tokens) |
| Custom font sizes | Use component defaults or semantic Tailwind classes |

### Variant inference

When the Figma design uses different visual treatments (colours, weights, sizes) to distinguish elements, translate these into **variant props**, not styles:

- Different coloured badges → different `variant` values
- Different sized buttons → different `size` values
- Different weighted text → semantic HTML (`<h2>` vs `<p>`) or component parts (`CardTitle` vs `CardDescription`)
- Highlighted/active states → `isActive`, `data-state`, or `data-[state=selected]`

## Multi-frame designs

When the user provides multiple frames (e.g. a full page set):

1. Process each frame as a separate page/route
2. Identify shared navigation elements across frames (sidebar items, topbar links)
3. Build the layout shell once, then compose each page within it
4. Use the `scaffolding-vui-apps` skill to set up the route structure

## Working with Code Connect

If the Figma file has Code Connect mappings to VUI components, `get_design_context` will return VUI-specific reference code. In this case:

1. The reference code is a much stronger structural hint
2. Component names will already match VUI's registry
3. Still ignore any colour or radius values in the reference code
4. Focus on using the reference code's composition structure

Code Connect mappings can be set up once per Figma library using `add_code_connect_map` – this is a one-time effort that improves all future conversions.

## Example

**User says:** "Convert this Figma frame to a VUI prototype" + pastes URL

**You do:**

1. Extract file key and node ID from the URL
2. Call `get_design_context` with the file key and node ID
3. Look at the screenshot – see a sidebar layout with a data table, search bar, and filter badges
4. Map to VUI: Sidebar shell → Table + Input (search) + Badge (filters) → PageWrapper variant="full"
5. Check which components are installed, install any missing ones
6. Compose the page:

```tsx
"use client"

import { PageWrapper, PageContent, PageHeader, PageHeaderContent, PageHeaderTitle, PageHeaderDescription, PageHeaderActions } from "@/components/vui/page-layout"
import { Input } from "@/components/vui/input"
import { Badge } from "@/components/vui/badge"
import { Button } from "@/components/vui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/vui/table"
import { Dot } from "@/components/vui/dot"
import { SearchIcon, PlusIcon } from "lucide-react"

export default function ContactsPage() {
  return (
    <PageWrapper variant="full">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Contacts</PageHeaderTitle>
          <PageHeaderDescription>142 contacts</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button><PlusIcon /> Add contact</Button>
        </PageHeaderActions>
      </PageHeader>
      <PageContent>
        <div className="flex items-center gap-3 mb-4">
          <Input placeholder="Search contacts..." className="max-w-sm" />
          <Badge variant="secondary">Active</Badge>
          <Badge variant="outline">Pending</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Sarah Chen</TableCell>
              <TableCell>sarah.chen@lp-capital.com</TableCell>
              <TableCell><Dot variant="positive" /> Active</TableCell>
              <TableCell><Badge variant="secondary">LP</Badge></TableCell>
            </TableRow>
            {/* More rows with realistic data */}
          </TableBody>
        </Table>
      </PageContent>
    </PageWrapper>
  )
}
```

Note: no colours, no radii, no shadows hardcoded. The GP's theme CSS class handles all of that.

## References

- [references/pattern-map.md](references/pattern-map.md) – Visual pattern to VUI component mapping
- Use `prototyping-with-vui` skill for composition patterns and page recipes
- Use `theming-vui-components` skill if the user wants to apply a specific brand after conversion
