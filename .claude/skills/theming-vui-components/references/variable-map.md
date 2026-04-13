# CSS Variable Map

Complete map of VUI CN CSS variables organized by component. Each entry shows:
- **Token**: The Tailwind token name (used in `@theme inline`)
- **Override variable**: What you set in your theme class
- **Fallback**: What it defaults to if not set

## Base Tokens

These are the foundation. Most component tokens fall back to these.

| Override variable | Purpose | Default |
|---|---|---|
| `--radius` | Base border radius | `0.625rem` |
| `--background` | Page background | `oklch(1 0 0)` |
| `--foreground` | Default text color | `oklch(0.145 0 0)` |
| `--primary` | Primary brand color | `oklch(0.205 0 0)` |
| `--primary-foreground` | Text on primary | `oklch(0.985 0 0)` |
| `--secondary` | Secondary color | `oklch(0.97 0 0)` |
| `--secondary-foreground` | Text on secondary | `oklch(0.205 0 0)` |
| `--muted` | Muted backgrounds | `oklch(0.97 0 0)` |
| `--muted-foreground` | Muted text | `oklch(0.556 0 0)` |
| `--accent` | Accent backgrounds | `oklch(0.97 0 0)` |
| `--accent-foreground` | Accent text | `oklch(0.205 0 0)` |
| `--destructive` | Error/danger color | `oklch(0.577 0.245 27.325)` |
| `--border` | Default borders | `oklch(0.922 0 0)` |
| `--input` | Input borders | `oklch(0.922 0 0)` |
| `--ring` | Focus ring color | `oklch(0.708 0 0)` |
| `--card` | Card background | `oklch(1 0 0)` |
| `--card-foreground` | Card text | `oklch(0.145 0 0)` |
| `--popover` | Popover/menu bg | `oklch(1 0 0)` |
| `--popover-foreground` | Popover text | `oklch(0.145 0 0)` |

Derived radii (computed from `--radius`):
- `--radius-sm`: `calc(var(--radius) - 4px)`
- `--radius-md`: `calc(var(--radius) - 2px)`
- `--radius-lg`: `var(--radius)`
- `--radius-xl`: `calc(var(--radius) + 4px)`

---

## Button

| Override variable | Fallback chain | Token |
|---|---|---|
| `--button-radius` | → `--radius-md` | `--radius-button` |
| `--button-primary` | → `--primary` | `--color-button-primary` |
| `--button-primary-foreground` | → `--primary-foreground` | `--color-button-primary-foreground` |
| `--button-primary-border` | → `--border` | `--color-button-primary-border` |
| `--button-secondary` | → `--secondary` | `--color-button-secondary` |
| `--button-secondary-foreground` | → `--secondary-foreground` | `--color-button-secondary-foreground` |
| `--button-secondary-border` | → `--border` | `--color-button-secondary-border` |

## Card

| Override variable | Fallback chain | Token |
|---|---|---|
| `--card-radius` | → `--radius-xl` | `--radius-card` |
| `--card-shadow` | (none) | `--shadow-card` |
| `--card-border` | → `--border` | `--color-card-border` |

## Badge

| Override variable | Fallback chain | Token |
|---|---|---|
| `--badge-radius` | → `--radius-md` | `--radius-badge` |
| `--badge-default` | → `--primary` | `--color-badge-default` |
| `--badge-default-foreground` | → `--primary-foreground` | `--color-badge-default-foreground` |
| `--badge-secondary` | → `--secondary` | `--color-badge-secondary` |
| `--badge-secondary-foreground` | → `--secondary-foreground` | `--color-badge-secondary-foreground` |
| `--badge-destructive` | → `--destructive` | `--color-badge-destructive` |
| `--badge-outline` | → `--foreground` | `--color-badge-outline` |

## Input (shared by Input, Textarea, Select, InputOTP, InputGroup)

### Base input tokens
| Override variable | Fallback chain | Token |
|---|---|---|
| `--input-radius` | → `--radius-md` | `--radius-input` |
| `--input-border` | → `--input` | `--color-input-border` |
| `--input-background` | → `transparent` | `--color-input-background` |
| `--input-shadow` | → `--shadow-xs` | `--shadow-input` |

### Textarea (three-tier: textarea → input → base)
| Override variable | Fallback chain | Token |
|---|---|---|
| `--textarea-radius` | → `--input-radius` → `--radius-md` | `--radius-textarea` |
| `--textarea-border` | → `--input-border` → `--input` | `--color-textarea-border` |
| `--textarea-background` | → `--input-background` → `transparent` | `--color-textarea-background` |
| `--textarea-shadow` | → `--input-shadow` → `--shadow-xs` | `--shadow-textarea` |

### Select (three-tier: select → input → base)
| Override variable | Fallback chain | Token |
|---|---|---|
| `--select-radius` | → `--input-radius` → `--radius-md` | `--radius-select` |
| `--select-border` | → `--input-border` → `--input` | `--color-select-border` |
| `--select-background` | → `--input-background` → `transparent` | `--color-select-background` |
| `--select-shadow` | → `--input-shadow` → `--shadow-xs` | `--shadow-select` |
| `--select-content-radius` | → `--radius-md` | `--radius-select-content` |
| `--select-content` | → `--popover` | `--color-select-content` |
| `--select-content-foreground` | → `--popover-foreground` | `--color-select-content-foreground` |
| `--select-item-focus` | → `--accent` | `--color-select-item-focus` |
| `--select-item-focus-foreground` | → `--accent-foreground` | `--color-select-item-focus-foreground` |

### InputOTP (three-tier: input-otp → input → base)
| Override variable | Fallback chain | Token |
|---|---|---|
| `--input-otp-radius` | → `--input-radius` → `--radius-md` | `--radius-input-otp` |
| `--input-otp-border` | → `--input-border` → `--input` | `--color-input-otp-border` |
| `--input-otp-background` | → `--input-background` → `transparent` | `--color-input-otp-background` |
| `--input-otp-shadow` | → `--input-shadow` → `--shadow-xs` | `--shadow-input-otp` |

### InputGroup (three-tier: input-group → input → base)
| Override variable | Fallback chain | Token |
|---|---|---|
| `--input-group-radius` | → `--input-radius` → `--radius-md` | `--radius-input-group` |
| `--input-group-border` | → `--input-border` → `--input` | `--color-input-group-border` |
| `--input-group-background` | → `--input-background` → `transparent` | `--color-input-group-background` |
| `--input-group-shadow` | → `--input-shadow` → `--shadow-xs` | `--shadow-input-group` |

## Number Field

| Override variable | Fallback chain | Token |
|---|---|---|
| `--number-field-radius` | → `--radius-md` | `--radius-number-field` |
| `--number-field` | → `--background` | `--color-number-field` |
| `--number-field-border` | → `--input` | `--color-number-field-border` |

## Checkbox (three-tier: checkbox → form-control → base)

| Override variable | Fallback chain | Token |
|---|---|---|
| `--checkbox-radius` | → `--form-control-radius` → `4px` | `--radius-checkbox` |
| `--checkbox-border` | → `--input` | `--color-checkbox-border` |
| `--checkbox-background` | → `transparent` | `--color-checkbox-background` |
| `--checkbox-checked` | → `--primary` | `--color-checkbox-checked` |
| `--checkbox-checked-foreground` | → `--primary-foreground` | `--color-checkbox-checked-foreground` |
| `--checkbox-checked-border` | → `--primary` | `--color-checkbox-checked-border` |
| `--checkbox-shadow` | → `--shadow-xs` | `--shadow-checkbox` |

## Switch

| Override variable | Fallback chain | Token |
|---|---|---|
| `--switch-radius` | → `9999px` | `--radius-switch` |
| `--switch-thumb-radius` | → `9999px` | `--radius-switch-thumb` |
| `--switch-checked` | → `--primary` | `--color-switch-checked` |
| `--switch-unchecked` | → `--input` | `--color-switch-unchecked` |
| `--switch-thumb` | → `--background` | `--color-switch-thumb` |
| `--switch-border` | → `transparent` | `--color-switch-border` |
| `--switch-shadow` | → `--shadow-xs` | `--shadow-switch` |

## Radio Group

| Override variable | Fallback chain | Token |
|---|---|---|
| `--radio-radius` | → `9999px` | `--radius-radio` |
| `--radio-border` | → `--input` | `--color-radio-border` |
| `--radio-background` | → `transparent` | `--color-radio-background` |
| `--radio-indicator` | → `--primary` | `--color-radio-indicator` |
| `--radio-shadow` | → `--shadow-xs` | `--shadow-radio` |

## Label

| Override variable | Fallback chain | Token |
|---|---|---|
| `--label-foreground` | → `--foreground` | `--color-label-foreground` |

## Accordion

| Override variable | Fallback chain | Token |
|---|---|---|
| `--accordion-radius` | → `--radius-md` | `--radius-accordion` |

## Alert

| Override variable | Fallback chain | Token |
|---|---|---|
| `--alert-radius` | → `--radius-lg` | `--radius-alert` |
| `--alert-default` | → `--card` | `--color-alert-default` |
| `--alert-default-foreground` | → `--card-foreground` | `--color-alert-default-foreground` |
| `--alert-destructive` | → `--card` | `--color-alert-destructive` |
| `--alert-destructive-foreground` | → `--destructive` | `--color-alert-destructive-foreground` |

## Separator

| Override variable | Fallback chain | Token |
|---|---|---|
| `--separator` | → `--border` | `--color-separator` |

## Slider

| Override variable | Fallback chain | Token |
|---|---|---|
| `--slider-track` | → `--muted` | `--color-slider-track` |
| `--slider-track-radius` | → `9999px` | `--radius-slider-track` |
| `--slider-range` | → `--primary` | `--color-slider-range` |
| `--slider-thumb-radius` | → `9999px` | `--radius-slider-thumb` |
| `--slider-thumb-border` | → `--primary` | `--color-slider-thumb-border` |
| `--slider-thumb` | → `--background` | `--color-slider-thumb` |
| `--slider-thumb-shadow` | → `--shadow-xs` | `--shadow-slider-thumb` |

## Progress

| Override variable | Fallback chain | Token |
|---|---|---|
| `--progress-container` | → `--primary` | `--color-progress-container` |
| `--progress-radius` | → `9999px` | `--radius-progress` |
| `--progress-indicator` | → `--primary` | `--color-progress-indicator` |

## Skeleton

| Override variable | Fallback chain | Token |
|---|---|---|
| `--skeleton` | → `--accent` | `--color-skeleton` |
| `--skeleton-radius` | → `--radius-md` | `--radius-skeleton` |

## Sidebar

| Override variable | Fallback chain | Token |
|---|---|---|
| `--sidebar` | → `--background` | `--color-sidebar` |
| `--sidebar-foreground` | → `--foreground` | `--color-sidebar-foreground` |
| `--sidebar-primary` | → `--primary` | `--color-sidebar-primary` |
| `--sidebar-primary-foreground` | → `--primary-foreground` | `--color-sidebar-primary-foreground` |
| `--sidebar-accent` | → `--accent` | `--color-sidebar-accent` |
| `--sidebar-accent-foreground` | → `--accent-foreground` | `--color-sidebar-accent-foreground` |
| `--sidebar-border` | → `--border` | `--color-sidebar-border` |
| `--sidebar-ring` | → `--ring` | `--color-sidebar-ring` |

## Topbar

| Override variable | Fallback chain | Token |
|---|---|---|
| `--topbar` | → `--background` | `--color-topbar` |
| `--topbar-foreground` | → `--foreground` | `--color-topbar-foreground` |
| `--topbar-accent` | → `--accent` | `--color-topbar-accent` |
| `--topbar-accent-foreground` | → `--accent-foreground` | `--color-topbar-accent-foreground` |
| `--topbar-border` | → `--border` | `--color-topbar-border` |
| `--topbar-ring` | → `--ring` | `--color-topbar-ring` |

## Command

| Override variable | Fallback chain | Token |
|---|---|---|
| `--command-radius` | → `--radius-md` | `--radius-command` |
| `--command` | → `--popover` | `--color-command` |
| `--command-foreground` | → `--popover-foreground` | `--color-command-foreground` |
| `--command-border` | → `--border` | `--color-command-border` |
| `--command-separator` | → `--border` | `--color-command-separator` |
| `--command-item-selected` | → `--accent` | `--color-command-item-selected` |
| `--command-item-selected-foreground` | → `--accent-foreground` | `--color-command-item-selected-foreground` |

## Table

| Override variable | Fallback chain | Token |
|---|---|---|
| `--table-border` | → `--border` | `--color-table-border` |
| `--table-row-hover` | → `--muted` / 50% | `--color-table-row-hover` |
| `--table-row-selected` | → `--muted` | `--color-table-row-selected` |
| `--table-footer` | → `--muted` / 50% | `--color-table-footer` |
| `--table-head-foreground` | → `--foreground` | `--color-table-head-foreground` |
| `--table-caption` | → `--muted-foreground` | `--color-table-caption` |

## Dialog

| Override variable | Fallback chain | Token |
|---|---|---|
| `--dialog-overlay` | → `oklch(0 0 0 / 0.5)` | `--color-dialog-overlay` |
| `--dialog-content` | → `--background` | `--color-dialog-content` |
| `--dialog-border` | → `--border` | `--color-dialog-border` |
| `--dialog-radius` | → `--radius-md` | `--radius-dialog` |
| `--dialog-shadow` | → `--shadow-lg` | `--shadow-dialog` |

## Alert Dialog

| Override variable | Fallback chain | Token |
|---|---|---|
| `--alert-dialog-overlay` | → `oklch(0 0 0 / 0.5)` | `--color-alert-dialog-overlay` |
| `--alert-dialog-content` | → `--background` | `--color-alert-dialog-content` |
| `--alert-dialog-border` | → `--border` | `--color-alert-dialog-border` |
| `--alert-dialog-radius` | → `--radius-lg` | `--radius-alert-dialog` |
| `--alert-dialog-shadow` | → `--shadow-lg` | `--shadow-alert-dialog` |

## Popover

| Override variable | Fallback chain | Token |
|---|---|---|
| `--popover-content` | → `--popover` | `--color-popover-content` |
| `--popover-content-foreground` | → `--popover-foreground` | `--color-popover-content-foreground` |
| `--popover-border` | → `--border` | `--color-popover-border` |
| `--popover-radius` | → `--radius-md` | `--radius-popover` |
| `--popover-shadow` | → `--shadow-md` | `--shadow-popover` |

## Tooltip

| Override variable | Fallback chain | Token |
|---|---|---|
| `--tooltip` | → `--foreground` | `--color-tooltip` |
| `--tooltip-foreground` | → `--background` | `--color-tooltip-foreground` |
| `--tooltip-radius` | → `--radius-md` | `--radius-tooltip` |

## Dropdown Menu

| Override variable | Fallback chain | Token |
|---|---|---|
| `--dropdown-menu-content` | → `--popover` | `--color-dropdown-menu-content` |
| `--dropdown-menu-content-foreground` | → `--popover-foreground` | `--color-dropdown-menu-content-foreground` |
| `--dropdown-menu-border` | → `--border` | `--color-dropdown-menu-border` |
| `--dropdown-menu-radius` | → `--radius-md` | `--radius-dropdown-menu` |
| `--dropdown-menu-shadow` | → `--shadow-md` | `--shadow-dropdown-menu` |

## Hover Card

| Override variable | Fallback chain | Token |
|---|---|---|
| `--hover-card-content` | → `--popover` | `--color-hover-card-content` |
| `--hover-card-content-foreground` | → `--popover-foreground` | `--color-hover-card-content-foreground` |
| `--hover-card-border` | → `--border` | `--color-hover-card-border` |
| `--hover-card-radius` | → `--radius-md` | `--radius-hover-card` |
| `--hover-card-shadow` | → `--shadow-md` | `--shadow-hover-card` |

## Context Menu

| Override variable | Fallback chain | Token |
|---|---|---|
| `--context-menu-content` | → `--popover` | `--color-context-menu-content` |
| `--context-menu-content-foreground` | → `--popover-foreground` | `--color-context-menu-content-foreground` |
| `--context-menu-border` | → `--border` | `--color-context-menu-border` |
| `--context-menu-radius` | → `--radius-md` | `--radius-context-menu` |
| `--context-menu-shadow` | → `--shadow-md` | `--shadow-context-menu` |

## Sheet

| Override variable | Fallback chain | Token |
|---|---|---|
| `--sheet-overlay` | → `oklch(0 0 0 / 0.5)` | `--color-sheet-overlay` |
| `--sheet-content` | → `--background` | `--color-sheet-content` |
| `--sheet-border` | → `--border` | `--color-sheet-border` |
| `--sheet-shadow` | → `--shadow-lg` | `--shadow-sheet` |

## Drawer

| Override variable | Fallback chain | Token |
|---|---|---|
| `--drawer-overlay` | → `oklch(0 0 0 / 0.5)` | `--color-drawer-overlay` |
| `--drawer-content` | → `--background` | `--color-drawer-content` |
| `--drawer-border` | → `--border` | `--color-drawer-border` |
| `--drawer-radius` | → `--radius-lg` | `--radius-drawer` |
| `--drawer-shadow` | → `--shadow-lg` | `--shadow-drawer` |

## Tabs

| Override variable | Fallback chain | Token |
|---|---|---|
| `--tabs-list` | → `--muted` | `--color-tabs-list` |
| `--tabs-list-foreground` | → `--muted-foreground` | `--color-tabs-list-foreground` |
| `--tabs-list-radius` | → `--radius-lg` | `--radius-tabs-list` |
| `--tabs-trigger-active` | → `--background` | `--color-tabs-trigger-active` |
| `--tabs-trigger-active-foreground` | → `--foreground` | `--color-tabs-trigger-active-foreground` |
| `--tabs-trigger-active-border` | → `--input` | `--color-tabs-trigger-active-border` |
| `--tabs-trigger-radius` | → `--radius-md` | `--radius-tabs-trigger` |
| `--tabs-trigger-shadow` | → `--shadow-sm` | `--shadow-tabs-trigger` |

## Navigation Menu

| Override variable | Fallback chain | Token |
|---|---|---|
| `--navigation-menu-trigger` | → `--background` | `--color-navigation-menu-trigger` |
| `--navigation-menu-trigger-radius` | → `--radius-md` | `--radius-navigation-menu-trigger` |
| `--navigation-menu-viewport` | → `--popover` | `--color-navigation-menu-viewport` |
| `--navigation-menu-viewport-foreground` | → `--popover-foreground` | `--color-navigation-menu-viewport-foreground` |
| `--navigation-menu-border` | → `--border` | `--color-navigation-menu-border` |
| `--navigation-menu-viewport-radius` | → `--radius-md` | `--radius-navigation-menu-viewport` |
| `--navigation-menu-shadow` | → `--shadow-md` | `--shadow-navigation-menu` |

## Menubar

| Override variable | Fallback chain | Token |
|---|---|---|
| `--menubar` | → `--background` | `--color-menubar` |
| `--menubar-border` | → `--border` | `--color-menubar-border` |
| `--menubar-radius` | → `--radius-md` | `--radius-menubar` |
| `--menubar-shadow` | → `--shadow-xs` | `--shadow-menubar` |
| `--menubar-content` | → `--popover` | `--color-menubar-content` |
| `--menubar-content-foreground` | → `--popover-foreground` | `--color-menubar-content-foreground` |
| `--menubar-content-border` | → `--border` | `--color-menubar-content-border` |
| `--menubar-content-radius` | → `--radius-md` | `--radius-menubar-content` |
| `--menubar-content-shadow` | → `--shadow-md` | `--shadow-menubar-content` |

## Breadcrumb

| Override variable | Fallback chain | Token |
|---|---|---|
| `--breadcrumb-list` | → `--muted-foreground` | `--color-breadcrumb-list` |
| `--breadcrumb-link` | → `--muted-foreground` | `--color-breadcrumb-link` |
| `--breadcrumb-link-hover` | → `--foreground` | `--color-breadcrumb-link-hover` |
| `--breadcrumb-page` | → `--foreground` | `--color-breadcrumb-page` |
| `--breadcrumb-separator` | → `--muted-foreground` | `--color-breadcrumb-separator` |

## Avatar

| Override variable | Fallback chain | Token |
|---|---|---|
| `--avatar-radius` | → `9999px` | `--radius-avatar` |
| `--avatar-fallback` | → `--muted` | `--color-avatar-fallback` |

## Toggle

| Override variable | Fallback chain | Token |
|---|---|---|
| `--toggle` | → `transparent` | `--color-toggle` |
| `--toggle-border` | → `--input` | `--color-toggle-border` |
| `--toggle-radius` | → `--radius-md` | `--radius-toggle` |
| `--toggle-shadow` | → `--shadow-xs` | `--shadow-toggle` |

## Toggle Group

| Override variable | Fallback chain | Token |
|---|---|---|
| `--toggle-group-radius` | → `--radius-md` | `--radius-toggle-group` |
| `--toggle-group-shadow` | → `--shadow-xs` | `--shadow-toggle-group` |

## Scroll Area

| Override variable | Fallback chain | Token |
|---|---|---|
| `--scroll-area-thumb` | → `--border` | `--color-scroll-area-thumb` |

## Spinner

| Override variable | Fallback chain | Token |
|---|---|---|
| `--spinner` | → `--foreground` | `--color-spinner` |

## Toaster (Sonner)

| Override variable | Fallback chain | Token |
|---|---|---|
| `--toaster` | → `--popover` | `--color-toaster` |
| `--toaster-foreground` | → `--popover-foreground` | `--color-toaster-foreground` |
| `--toaster-border` | → `--border` | `--color-toaster-border` |
| `--toaster-radius` | → `--radius` | `--radius-toaster` |

## Resizable

| Override variable | Fallback chain | Token |
|---|---|---|
| `--resizable-handle` | → `--border` | `--color-resizable-handle` |
| `--resizable-handle-ring` | → `--ring` | `--color-resizable-handle-ring` |
| `--resizable-handle-border` | → `--border` | `--color-resizable-handle-border` |

## Reorderable

| Override variable | Fallback chain | Token |
|---|---|---|
| `--reorderable-separator` | → `--primary` | `--color-reorderable-separator` |

## Chart

| Override variable | Fallback chain | Token |
|---|---|---|
| `--chart-tooltip` | → `--background` | `--color-chart-tooltip` |
| `--chart-tooltip-border` | → `--border` / 50% | `--color-chart-tooltip-border` |
| `--chart-1` through `--chart-5` | (direct) | `--color-chart-1` through `--color-chart-5` |

## Grid

| Override variable | Fallback chain | Token |
|---|---|---|
| `--grid-gap` | → `4px` | `--spacing-grid-gap` |
| `--grid-item-radius` | → `--card-radius` → `8px` | `--radius-grid-item` |
| `--grid-item-aspect` | → `1/1` | `--aspect-grid-item` |
| `--grid-item-padding` | → `4px` | `--spacing-grid-item-padding` |

## Dot

| Override variable | Fallback chain | Token |
|---|---|---|
| `--dot-primary` | → `--primary` | `--color-dot-primary` |
| `--dot-positive` | → `oklch(0.6 0.15 145)` | `--color-dot-positive` |
| `--dot-negative` | → `oklch(0.577 0.245 27.325)` | `--color-dot-negative` |
| `--dot-pending` | → `oklch(0.7 0.15 85)` | `--color-dot-pending` |
| `--dot-neutral` | → `--muted-foreground` | `--color-dot-neutral` |
