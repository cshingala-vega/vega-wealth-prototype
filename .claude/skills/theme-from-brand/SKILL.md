---
name: theme-from-brand
description: Extracts a VUI theme from a brand source – a website URL, brand guidelines PDF, or screenshot. Applies when the user wants to create a theme from an existing brand, extract colours from a website, reverse-engineer a brand's visual style, or generate a VUI theme class from brand assets. Uses browser tools to read CSS from live sites. Covers colours, radii, and shadows only – not typography.
user-invocable: true
---

# Theme from brand

Extract colours, radii, and shadows from a brand source and generate a VUI theme class. The source can be a live website, a brand guidelines PDF, a screenshot, or even a plain description with hex values.

> This skill produces the theme. For applying and customising it further, use the `theming-vui-components` skill.

## Workflow

### Step 1: Identify the source

| Source type | How to read it |
|---|---|
| Website URL | Navigate to the URL with browser tools. Read the page's computed CSS. Take a screenshot for visual reference. |
| Screenshot / image | Analyse the image visually. Identify dominant colours, UI patterns, border styles. |
| Brand guidelines PDF | Read the document. Look for colour palettes, spacing rules, border styles. |
| Hex/RGB values in chat | Use directly – no extraction needed. |

### Step 2: Extract brand tokens

Read the source and extract the following. Not all will be present – extract what you can find. **Do not extract or set typographic variables** (font families, font sizes, line heights) – VUI theming covers colours, radii, and shadows only.

**Colours (priority order):**

| Token | What to look for |
|---|---|
| Primary | Main brand colour – hero buttons, active nav items, links, logo accent |
| Primary foreground | Text colour on primary backgrounds – usually white or near-black |
| Background | Page/body background |
| Foreground | Main body text colour |
| Secondary | Secondary buttons, tags, subtle backgrounds |
| Accent | Hover states, highlights, focus rings |
| Muted | Disabled states, placeholder text backgrounds |
| Border | Default border colour – cards, inputs, dividers |
| Destructive | Error/delete colour (if visible) |

**Shape:**

| Token | What to look for |
|---|---|
| Radius | Button border-radius – this sets the overall feel (sharp vs rounded) |
| Card radius | Card/container border-radius if different from buttons |
| Input radius | Input field border-radius if different from buttons |

**Effects:**

| Token | What to look for |
|---|---|
| Shadows | Card shadows, dropdown shadows – note if the brand is flat (no shadows) or elevated |

### Step 3: Read CSS from a live site

When the source is a website, use the browser tools to extract computed styles:

1. **Navigate** to the URL
2. **Take a screenshot** for visual reference
3. **Run JavaScript** to extract key styles:

```javascript
// Extract from common brand elements
const body = getComputedStyle(document.body);
const primaryBtn = document.querySelector('a[class*="primary"], button[class*="primary"], .btn-primary, [data-variant="primary"]');
const card = document.querySelector('.card, [class*="card"], article');
const input = document.querySelector('input, .input');

const extract = {
  body: {
    background: body.backgroundColor,
    color: body.color,
  },
  button: primaryBtn ? (() => {
    const s = getComputedStyle(primaryBtn);
    return { background: s.backgroundColor, color: s.color, borderRadius: s.borderRadius };
  })() : null,
  card: card ? (() => {
    const s = getComputedStyle(card);
    return { background: s.backgroundColor, borderRadius: s.borderRadius, boxShadow: s.boxShadow, borderColor: s.borderColor };
  })() : null,
  input: input ? (() => {
    const s = getComputedStyle(input);
    return { borderRadius: s.borderRadius, borderColor: s.borderColor, background: s.backgroundColor };
  })() : null,
};

JSON.stringify(extract, null, 2);
```

4. **Also check** CSS custom properties on `:root` or `body` – many modern sites define their palette as variables:

```javascript
const root = getComputedStyle(document.documentElement);
const vars = {};
for (const sheet of document.styleSheets) {
  try {
    for (const rule of sheet.cssRules) {
      if (rule.selectorText === ':root' || rule.selectorText === 'body') {
        for (const prop of rule.style) {
          if (prop.startsWith('--') && (prop.includes('color') || prop.includes('primary') || prop.includes('brand') || prop.includes('bg') || prop.includes('radius'))) {
            vars[prop] = rule.style.getPropertyValue(prop).trim();
          }
        }
      }
    }
  } catch(e) {}
}
JSON.stringify(vars, null, 2);
```

If the site blocks stylesheets (CORS), fall back to the screenshot and visually estimate colours.

### Step 4: Generate the VUI theme

Map the extracted values to VUI theme variables. Use the colour values as-is – hex, rgb, hsl, oklch all work.

```css
.brand-name {
  /* Base tokens */
  --primary: <extracted primary>;
  --primary-foreground: <extracted primary foreground>;
  --background: <extracted background>;
  --foreground: <extracted foreground>;
  --border: <extracted border>;
  --radius: <extracted radius>;

  /* Component tokens (only if notably different from base) */
  --button-primary: <extracted primary>;
  --button-radius: <extracted button radius>;
  --card-radius: <extracted card radius>;
  --card-border: <extracted card border>;

  /* Sidebar (if the site has a dark nav) */
  --sidebar: <extracted nav background>;
  --sidebar-foreground: <extracted nav text>;
}
```

**Rules:**

- Use the **extracted values directly** – don't convert between colour formats unless asked
- Only include **variables that differ** from the defaults. If the card radius matches the global radius, don't set `--card-radius`
- Name the class after the brand in **kebab-case** (e.g., `.meridian-capital`, `.apollo-global`)
- If you can't determine a foreground colour, choose white or near-black based on the primary's lightness
- If shadows are absent on the site, set `--shadow-card: none` and `--shadow-sm: none` for a flat look
- If the brand is very rounded (>12px), set `--radius` and let components inherit. If it's sharp (0–4px), also explicitly set `--button-radius` and `--card-radius` to make the intent clear

### Step 5: Apply the theme

Add the class to `app/globals.css` (after the `@theme inline` block) and apply it to `<body>` in `app/layout.tsx`:

```tsx
<body className="brand-name">
```

### Step 6: Review and refine

After applying, check the prototype visually and adjust:

- Does the primary button look right against the background?
- Is the text readable on primary-coloured surfaces?
- Do cards and inputs feel consistent with the brand's style?
- Does the sidebar match the brand's navigation if they have one?

If the user provides feedback ("the buttons should be darker", "too rounded"), adjust the specific variables.

## Multiple sources

If the user provides multiple references (e.g., "use the colours from their website but the radii from this screenshot"), merge them:

1. Extract from each source separately
2. Use colours from the first source, shapes from the second
3. Note any conflicts and ask the user which to prefer

## Example

**User says:** "Extract a theme from meridian.com"

1. Navigate to meridian.com, take a screenshot
2. Run JS to extract: primary button is `#1a365d`, background is `#ffffff`, text is `#1a202c`, cards have `2px` radius and subtle shadows, buttons have `2px` radius
3. Generate:

```css
.meridian {
  --primary: #1a365d;
  --primary-foreground: #ffffff;
  --background: #ffffff;
  --foreground: #1a202c;
  --border: #e2e8f0;
  --radius: 2px;
  --button-primary: #1a365d;
  --button-radius: 2px;
}
```

4. Apply to layout, review in browser
