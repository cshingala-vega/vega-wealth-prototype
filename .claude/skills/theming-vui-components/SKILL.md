---
name: theming-vui-components
description: Creates and applies brand themes for VUI CN whitelabel components using CSS variable overrides. Applies when theming, branding, changing colors, adjusting radii or shadows, creating theme variants, whitelabeling, or working with CSS variables in globals.css. Covers the fallback chain system, theme class creation, and per-component token overrides.
user-invocable: true
---

# Theming VUI Components

VUI CN uses a **CSS variable fallback chain** for whitelabel theming. Each component has its own tokens that fall back to shared base tokens, so you only override what you need.

## How the Fallback Chain Works

Variables are defined in `app/globals.css` under `@theme inline`. The pattern:

```
--color-[component]-[property]: var(--[component]-[property], var(--[base-property]));
```

**Two-tier example (most components):**
```css
--color-button-primary: var(--button-primary, var(--primary));
/* Override --button-primary to change just buttons. If unset, uses --primary. */
```

**Three-tier example (input family):**
```css
--radius-textarea: var(--textarea-radius, var(--input-radius, var(--radius-md)));
/* Override --textarea-radius for just textareas, --input-radius for all text inputs, or --radius-md for everything. */
```

Components sharing a fallback tier:
- **Input group** (all fall back to `--input-*`): Input, Textarea, Select, InputOTP, InputGroup
- **Form controls** (fall back to `--form-control-*`): Checkbox
- **Popover family** (fall back to `--popover`): Command, DropdownMenu, HoverCard, ContextMenu, NavigationMenu, Menubar

## Creating a Theme

1. Add a CSS class in `app/globals.css` (after the `@theme inline` block)
2. Set only the variables you want to override
3. Apply the class to `<body>` in `app/layout.tsx`

```css
.brand-name {
  /* Base tokens — change everything at once */
  --primary: oklch(0.52 0.1 172.79);
  --primary-foreground: oklch(0.985 0 0);
  --radius: 0.5rem;

  /* Component tokens — customize individual components */
  --button-primary: oklch(0.52 0.1 172.79);
  --button-radius: 8px;
  --card-radius: 4px;

  /* Everything else falls back to defaults */
}
```

```tsx
// app/layout.tsx
<body className="brand-name">
```

## Override Levels

| Level | What to set | Effect |
|-------|-------------|--------|
| **Base** | `--primary`, `--background`, `--foreground`, `--border`, `--radius`, `--accent`, `--muted` | Changes all components that fall back to these |
| **Category** | `--input-radius`, `--form-control-radius` | Changes a family of related components |
| **Component** | `--button-primary`, `--card-radius`, `--checkbox-checked` | Changes one specific component |

**Never set** the Tailwind token directly (e.g., `--color-button-primary`). Always set the underlying variable (`--button-primary`) and let the `@theme inline` chain resolve it.

## Color Format

Always use `oklch(lightness chroma hue)`:

| Example | Color |
|---------|-------|
| `oklch(0.52 0.1 172.79)` | Teal |
| `oklch(0.4634 0.3055 264.19)` | Blue (Spoke primary) |
| `oklch(0.577 0.245 27.325)` | Red (destructive) |
| `oklch(0.205 0 0)` | Near-black |
| `oklch(0.985 0 0)` | Near-white |
| `oklch(0.922 0 0)` | Light gray (borders) |

For transparency: `oklch(0 0 0 / 50%)` or `oklch(var(--border) / 50%)`

## Common Tasks

### Change brand primary color
Set `--primary`, `--primary-foreground`, and optionally `--button-primary`:
```css
.my-brand {
  --primary: oklch(0.52 0.1 172.79);
  --primary-foreground: oklch(0.985 0 0);
  --button-primary: oklch(0.52 0.1 172.79);
  --button-primary-foreground: oklch(0.985 0 0);
}
```

### Round all corners
Set `--radius` to a high value. Component radii fall back to it:
```css
.rounded-brand { --radius: 1rem; }
```

### Sharp, corporate look
```css
.sharp-brand {
  --radius: 2px;
  --button-radius: 0px;
  --card-radius: 2px;
}
```

### Customize one component without affecting others
Find the component in the variable map reference and override only its tokens:
```css
.my-brand {
  --checkbox-checked: oklch(0.6 0.15 145); /* Green checkboxes */
  --checkbox-checked-foreground: oklch(0.985 0 0);
  --checkbox-checked-border: oklch(0.6 0.15 145);
}
```

### Dark mode
Override variables inside `.dark` nested within your theme class:
```css
.my-brand {
  --primary: oklch(0.52 0.1 172.79);
}
.dark .my-brand, .my-brand.dark {
  --primary: oklch(0.7 0.1 172.79);
}
```

## CLI shortcuts

Use `vui-run variables` to quickly look up which CSS variables a component supports:

```bash
vui-run variables button    # shows --button-primary, --button-radius, etc.
vui-run variables --all     # lists every component with theme variables
```

## References

- [references/variable-map.md](references/variable-map.md) — Complete CSS variable map by component with fallback chains
- [references/theme-examples.md](references/theme-examples.md) — Complete theme class definitions with annotations
