# Theme Examples

Complete theme class definitions you can use as starting points.

## Spoke Theme (Blue Primary, Sharp Corners)

The built-in Spoke theme uses a vibrant blue primary with small radii for a clean, corporate look.

```css
.spoke {
  /* Base tokens */
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.4634 0.3055 264.19);       /* Vibrant blue */
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);

  /* Button — sharp corners, blue primary */
  --button-radius: 4px;
  --button-primary: oklch(0.4634 0.3055 264.19);
  --button-primary-foreground: oklch(1 0 0);
  --button-primary-border: oklch(0.4634 0.3055 264.19);
  --button-secondary: oklch(0.97 0 0);
  --button-secondary-foreground: oklch(0.145 0 0);
  --button-secondary-border: oklch(0.4634 0.3055 264.19);

  /* Card — sharp corners */
  --card-radius: 4px;
  --card-border: oklch(0.922 0 0);

  /* Accordion */
  --accordion-radius: 4px;

  /* Badge */
  --badge-radius: 4px;
  --badge-default: oklch(0.205 0 0);
  --badge-default-foreground: oklch(0.985 0 0);
  --badge-secondary: oklch(0.97 0 0);
  --badge-secondary-foreground: oklch(0.205 0 0);

  /* Input family — shared variables cascade to Textarea, Select, InputOTP, InputGroup */
  --input-radius: 6px;
  --input-border: oklch(0.922 0 0);
  --input-background: transparent;
  --input-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  /* Checkbox */
  --checkbox-border: oklch(0.922 0 0);
  --checkbox-checked: oklch(0.205 0 0);
  --checkbox-checked-foreground: oklch(0.985 0 0);
  --checkbox-checked-border: oklch(0.205 0 0);

  /* Dot — matches spoke primary */
  --dot-primary: oklch(0.4634 0.3055 264.19);
  --dot-positive: oklch(0.6 0.15 145);
  --dot-negative: oklch(0.577 0.245 27.325);
  --dot-pending: oklch(0.75 0.15 85);
  --dot-neutral: oklch(0.556 0 0);

  /* Grid */
  --grid-gap: 12px;
  --grid-item-aspect: 4/3;
  --grid-item-radius: 4px;
  --grid-item-padding: 8px;
}
```

**Key decisions:**
- Sharp 4px radii on most components
- Blue primary carried through to buttons, dots, sidebar
- Input family uses shared vars — Textarea, Select, InputOTP all inherit `--input-*` values
- Many components (Dialog, Popover, Drawer, etc.) use defaults — no overrides needed

## Apollo Theme (Teal Primary, Rounded)

A teal-accented theme with larger radii, suitable for consumer-facing apps.

```css
.apollo {
  /* Base tokens */
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.52 0.1 172.79);             /* Teal */
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0.0042 236.5);         /* Slight blue tint */
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);

  /* Button — rounded, teal primary */
  --button-radius: 8px;
  --button-primary: oklch(0.52 0.1 172.79);
  --button-primary-foreground: oklch(0.985 0 0);
  --button-secondary: oklch(0.97 0.0042 236.5);
  --button-secondary-foreground: oklch(0.205 0 0);

  /* Sidebar */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}
```

**Key decisions:**
- Teal primary gives a distinctive, modern feel
- 8px button radius is softer than Spoke's 4px
- Secondary has a subtle blue tint
- Fewer component-level overrides — relies more on base token fallbacks

## Minimal Override Theme

Demonstrates the power of the fallback chain — just 4 variables to rebrand:

```css
.minimal-brand {
  --primary: oklch(0.55 0.2 330);              /* Purple */
  --primary-foreground: oklch(0.985 0 0);
  --radius: 0.75rem;                            /* Slightly rounder */
  --button-primary: oklch(0.55 0.2 330);       /* Match primary */
}
```

Everything else (cards, inputs, badges, checkboxes, etc.) automatically falls back to these base values.
