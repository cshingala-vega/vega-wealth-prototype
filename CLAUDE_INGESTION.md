# Ingestion Module — Claude Code Implementation Document

## Context

You are building a demo-ready prototype of an AI-powered trade reconciliation platform for Vega, a GP-facing operational platform for private markets wealth distribution. The prototype is built for a GP ops persona — a non-technical operations person who receives trade files from wealth distributors (iCapital, CAIS, UBS) and needs to normalise them into an internal order book before reconciling against Transfer Agent ledgers.

This document covers **Module 1: Distributor Ingestion Engine** only. Do not build anything outside this scope.

The guiding design principle is **zero setup cost** — a GP should be able to upload a file they received this morning and have it land correctly in their ledger within minutes, with no IT involvement. Every design decision should serve this principle.

---

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Component library:** VUI (`cn.vui.run`) — always prefer VUI components over raw HTML or standard shadcn. Install via `npx shadcn@latest add https://cn.vui.run/r/[name]`
- **Styling:** Tailwind v4 with CSS variable theming (see `app/globals.css`)
- **Database:** Neon PostgreSQL via Prisma (schema already migrated — do not modify the schema)
- **Language:** TypeScript throughout — no `any` types
- **Forms:** react-hook-form + zod for all form validation
- **Charts:** recharts for any data visualisation

## Existing files — do not modify unless explicitly instructed

- `app/layout.tsx`
- `app/(auth)/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(app)/layout.tsx`
- `lib/nav-config.ts` — nav items already configured. "Offerings", "Portfolio", "Documents" are placeholder nav items — do not scaffold their routes
- `app/globals.css`
- `prisma/schema.prisma`
- `CLAUDE.md`

---

## Database Schema — Relevant Models

The following Prisma models are relevant to this module. They are already in the schema — do not redefine them.

**Models to read and write:**
- `IngestionRun` — one record per uploaded file. Status transitions: `PENDING → MAPPING → REVIEW → COMMITTED`
- `WorkbenchOrder` — one record per normalised trade row, created on commit
- `Distributor` — reference data. GP selects from existing distributors or creates a new one
- `ColumnMappingTemplate` — flexible mapping templates per distributor. A distributor can have multiple templates

**Models to read only (for validation):**
- `Fund` — used to validate fund names in incoming files against known entities
- `Organization` — for `organizationId` scoping on all queries

**Auth context:** Use `organizationId` from the user's session on every database query. Every record must be scoped to the current organisation. Never query across organisations.

---

## Routes to Build

```
app/(app)/wealth/page.tsx                          → Wealth hub (update existing)
app/(app)/wealth/ingestion/page.tsx                → Ingestion history dashboard
app/(app)/wealth/ingestion/new/page.tsx            → Step 1: Upload
app/(app)/wealth/ingestion/[runId]/mapping/page.tsx → Step 2: Column mapping
app/(app)/wealth/ingestion/[runId]/review/page.tsx  → Step 3: Review & commit
app/(app)/wealth/ingestion/[runId]/summary/page.tsx → Step 4: Post-commit summary
app/(app)/wealth/ingestion/[runId]/page.tsx        → Read-only historical run detail
```

**Server actions** (in `app/(app)/wealth/ingestion/actions.ts`):
- `createIngestionRun` — creates `IngestionRun` record, parses file headers
- `saveColumnMapping` — saves `ColumnMappingTemplate`, updates run status to REVIEW
- `commitIngestionRun` — writes `WorkbenchOrder` records, updates run status to COMMITTED
- `createDistributor` — creates a new `Distributor` record inline

---

## Wealth Hub Page (`/wealth`)

Update the existing `app/(app)/wealth/page.tsx` to be a module hub. Do not rebuild it from scratch — add to it.

**Add two module cards:**
1. **Distributor Ingestion** — "Normalise trade files from any distributor into your internal order book." → links to `/wealth/ingestion`
2. **Trade Reconciliation** — "Compare your internal ledger against Transfer Agent exports to surface exceptions." → links to `/wealth/reconciliation` (this page does not exist yet — render the card as disabled/coming soon)

---

## Step 0 — Ingestion History Dashboard (`/wealth/ingestion`)

### Layout
- Page header: "Ingestion" with a "+ New Ingestion" primary button top right
- Three summary stat cards:
  - Runs this month (count)
  - Total rows ingested (sum across all committed runs)
  - Average AI quality score (average `aiQualityScore` across committed runs, shown as "—" if none yet)

### History table
Columns: Date/Time | Distributor | Close Cycle | File Name | Rows Processed | Rows Added | Rows Flagged | AI Quality Score | Status | Uploaded By

**AI Quality Score rendering:**
- 80–100: green badge
- 60–79: amber badge
- <60: red badge
- null: "—"

Each row is clickable → navigates to `/wealth/ingestion/[runId]`

**Empty state:** "No ingestion runs yet. Upload your first distributor file to get started." with a "+ New Ingestion" button.

### Data fetching
Server component. Query `IngestionRun` records for current `organizationId` ordered by `createdAt DESC`.

---

## Step 1 — Upload (`/wealth/ingestion/new`)

### Step indicator
Render a 4-step progress indicator at the top: Upload → Column Mapping → Review → Summary. Step 1 is active.

### Form fields
1. **Distributor** (required): Combobox/select. Options from `Distributor` records for current org. Include "+ Add new distributor" option that opens an inline modal with a single "Name" field. On create: calls `createDistributor` server action, adds new distributor to the select options, selects it automatically.

2. **Close Cycle** (required): Date picker. On distributor selection, pre-fill with the most recent `closeCycle` value from that distributor's `IngestionRun` history if one exists.

3. **File upload zone**: Drag-and-drop or click-to-browse. Accept `.xlsx` and `.csv` only. Multiple files allowed.

### Per-file upload card (rendered after each file is parsed)
- File name
- Detected row count
- Detected column names as pill tags (max 8 shown, "+N more" if exceeded)
- Remove button

### Saved mappings notice
After a distributor is selected: check if `ColumnMappingTemplate` records exist for that distributor. If yes, show an info banner: *"Saved mapping templates found for [Distributor]. These will be available in the next step."*

### Re-ingestion warning
Before navigating to the mapping step: query for existing `IngestionRun` records with the same `distributorId` and `closeCycle`. If found, show a confirmation modal: *"An ingestion run for [Distributor] — [Close Cycle] already exists ([X] rows committed on [date]). Starting a new run will not affect the existing data. Continue?"* Two buttons: "Continue" and "Cancel".

### On submit
- Call `createIngestionRun` server action for each uploaded file
- Server action: parse file headers (column names only, not full data), create `IngestionRun` record with `status: PENDING`, return `runId`
- Navigate to `/wealth/ingestion/[runId]/mapping` for the first run. If multiple files, handle them sequentially (complete mapping for file 1, then file 2, etc.)

### Validation
- No file uploaded: disable "Continue" button
- Unsupported file format: inline error on upload zone — "Only .xlsx and .csv files are supported."
- Empty file: inline error — "This file appears to be empty. Please check and re-upload."

---

## Step 2 — Column Mapping (`/wealth/ingestion/[runId]/mapping`)

### Step indicator
Step 2 active.

### Layout
Two-column layout:
- **Left (60%):** Mapping table
- **Right (40%):** Live data preview

### Mapping table

**Required Mappings section** (must all be resolved before proceeding):
| Vega Schema Field | Source Column Dropdown | Confidence |
|---|---|---|
| Transaction ID / Reference | — | — |
| Amount | — | — |
| Transaction Type | — | — |
| Order Date / Effective Date | — | — |

**Optional Mappings section:**
| Vega Schema Field | Source Column Dropdown |
|---|---|
| Fund Name | — |
| Share Class | — |
| Investor Name | — |
| Status / Stage | — |
| Currency | — |

**Dropdown options** for each row: all detected column names from the uploaded file, plus "— Not mapped —" for optional fields.

### AI mapping suggestions
On page load: call the AI mapping API route (`/api/ai/suggest-mappings`) with the detected column headers. The API uses Claude to suggest the best match for each schema field and returns a confidence level (HIGH / MEDIUM / LOW) for each suggestion.

Pre-populate dropdowns with AI suggestions. Render confidence badges:
- HIGH: green dot
- MEDIUM: amber dot  
- LOW: red dot + field is visually highlighted to draw attention

If AI is unavailable: show a subtle banner "AI suggestions unavailable — please map columns manually." Dropdowns remain functional with no pre-selection.

### Saved mapping templates
If templates exist for this distributor: show a "Load template" dropdown above the mapping table listing all available templates (show `isDefault` template pre-selected). Loading a template overwrites current dropdown selections. User can still manually override any field.

**Template name field** at bottom of mapping table:
- Checkbox: "Save as template" (checked by default)
- Text input: template name, pre-filled as "[Distributor] — [Month Year]"
- User can rename

### Live preview (right panel)
Shows the first 10 data rows of the uploaded file with the currently selected column mappings applied as headers. Updates in real-time as the user adjusts mappings. Header row uses Vega schema field names, not source column names.

### On submit
1. Call `saveColumnMapping` server action
2. If "Save as template" is checked: create or update `ColumnMappingTemplate` — set `isDefault: true`, update `lastUsedAt`
3. Update `IngestionRun.status` to `REVIEW`
4. Navigate to `/wealth/ingestion/[runId]/review`

### Validation
- Any required field unmapped: disable "Run Ingestion" button, show inline error on the unmapped row
- Duplicate mapping (same source column mapped to two schema fields): show inline warning — "This column is already mapped to [Field]."

---

## Step 3 — Review & Commit (`/wealth/ingestion/[runId]/review`)

### Step indicator
Step 3 active.

### AI pre-flight panel
Rendered at the top, collapsible. Contains:

**AI Quality Score card:**
- Large score number (0–100)
- Colour: green (80–100), amber (60–79), red (<60)
- Benchmark comparison: *"[X]/100 — [above/below/in line with] your average for [Distributor] ([Y]/100)"*. Show "First run for this distributor" if no prior runs exist.
- One-line plain-English explanation generated by AI (e.g. *"3 rows have missing share class values"*)

**Flag summary row:** pill counts for each flag type present:
- 🟡 Potential NIGO ([X])
- 🔵 Possible Duplicate ([X])
- 🔴 Fund Not Recognised ([X])
- ⚠️ Missing Required Field ([X])

**How AI quality score is computed (server-side logic):**
Start at 100. Deduct:
- 5 points per `MISSING_REQUIRED` flag
- 3 points per `FUND_NOT_RECOGNISED` flag
- 2 points per `POSSIBLE_DUPLICATE` flag
- 4 points per `POTENTIAL_NIGO` flag
Minimum score: 0. Store result in `IngestionRun.aiQualityScore`.

**How POTENTIAL_NIGO is detected (server-side logic):**
A row is flagged as `POTENTIAL_NIGO` if two or more of the following are true:
- `investorName` is null or empty
- `shareClass` is null or empty
- `fundName` does not match any known `Fund` alias
- `transactionType` value is not cleanly "Subscription" or "Redemption"

### Trades table
Columns: # | ✓ | Transaction ID | Type | Amount | Effective Date | Fund | Share Class | Investor | Flags

- Each row has a checkbox (checked by default). Unchecking excludes the row from commit.
- "Select all / Deselect all" toggle above table
- Flagged rows have an amber left border and a flag icon in the Flags column. Hovering the flag icon shows a tooltip with the flag type and reason.
- Pagination: show 50 rows per page

### Commit summary bar (sticky at bottom)
- Rows to be committed: [X] (updates live as checkboxes are toggled)
- Rows excluded: [X]
- Rows flagged: [X]
- "Commit to Order Book" primary button
- "Back" secondary button → `/wealth/ingestion/[runId]/mapping`

### Commit confirmation modal
If any `MISSING_REQUIRED` flagged rows are included in the commit selection: show a confirmation modal before committing:
*"[X] rows with missing required fields are included. These may cause issues during reconciliation. Are you sure you want to commit them?"*
Two buttons: "Commit anyway" and "Review flagged rows"

### On commit
1. Call `commitIngestionRun` server action
2. Server action:
   - Create `WorkbenchOrder` records for all checked rows, attaching `aiFlags` JSON to each flagged row
   - Update `IngestionRun`: set `status: COMMITTED`, set `committedAt`, update `rowsIngested`, `rowsExcluded`, `rowsFlagged`, `aiQualityScore`, `aiSummary`
   - Generate `aiSummary` via Claude API call — 2–3 sentence plain-English summary of the run
3. Navigate to `/wealth/ingestion/[runId]/summary`

### Validation
- All rows unchecked: disable "Commit" button, show inline message — "No rows selected. Select at least one row to commit."

---

## Step 4 — Summary (`/wealth/ingestion/[runId]/summary`)

### Step indicator
All 4 steps marked complete.

### Layout
- Success header with checkmark icon: "Ingestion Complete"
- **Run detail card:**
  - Distributor | Close Cycle | File name | Committed at | Committed by | Mapping template used
- **Stats row (4 cards):** Rows Processed | Rows Added | Rows Excluded | Rows Flagged
- **AI Quality Score** with benchmark comparison (same rendering as review step)
- **AI Ingestion Narrative:** styled callout block with Claude-generated 2–3 sentence summary stored in `IngestionRun.aiSummary`
- **Flagged rows table** (collapsible, closed by default): shows flagged rows only, with flag type and reason columns
- **Action buttons:**
  - "Start Reconciliation" (primary) → `/wealth/reconciliation/new` (disabled/greyed out — reconciliation module not yet built. Show tooltip: "Coming soon")
  - "Back to Ingestion" (secondary) → `/wealth/ingestion`
- **Export to .xlsx** button: exports full ingestion log

---

## Read-Only Run Detail (`/wealth/ingestion/[runId]`)

Same layout as the Summary page. Add a "Read-only — this run was committed on [date]" banner at the top. No action buttons except "Back to Ingestion" and "Export".

---

## AI API Routes

### `POST /api/ai/suggest-mappings`

**Request:**
```typescript
{ columns: string[] } // detected column names from uploaded file
```

**Response:**
```typescript
{
  mappings: {
    field: string        // Vega schema field name
    suggestion: string   // suggested source column name, or null
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  }[]
}
```

**Claude prompt:**
```
You are an AI assistant helping a financial operations team map columns from a trade file to a standard schema. 

The standard schema fields are:
- transactionId (Transaction ID / Reference number)
- amount (Trade amount / value)
- transactionType (Subscription or Redemption)
- effectiveDate (Order date / effective date / settlement date)
- fundName (Fund name)
- shareClass (Share class)
- investorName (Investor name)
- status (Trade status / stage)
- currency (Currency code)

The uploaded file has these column names: {{columns}}

For each schema field, suggest the best matching column name from the list and rate your confidence as HIGH (clear match), MEDIUM (likely match), or LOW (uncertain). If no column is a reasonable match, return null for that field.

Respond only with a JSON array matching this structure:
[{ "field": "transactionId", "suggestion": "column_name_or_null", "confidence": "HIGH|MEDIUM|LOW" }]
```

### `POST /api/ai/generate-summary`

**Request:**
```typescript
{
  distributorName: string
  closeCycle: string
  rowsIngested: number
  rowsExcluded: number
  rowsFlagged: number
  aiQualityScore: number
  flagBreakdown: { type: string; count: number }[]
}
```

**Response:**
```typescript
{ summary: string }
```

**Claude prompt:**
```
You are writing a brief operational summary for a GP operations team after a trade file ingestion run.

Run details:
- Distributor: {{distributorName}}
- Close cycle: {{closeCycle}}
- Rows ingested: {{rowsIngested}}
- Rows excluded: {{rowsExcluded}}
- Rows flagged: {{rowsFlagged}}
- AI quality score: {{aiQualityScore}}/100
- Flag breakdown: {{flagBreakdown}}

Write 2–3 sentences in plain English summarising what happened in this ingestion run. Be factual and specific. Do not use jargon. Do not include greetings or sign-offs. Focus on what the ops person needs to know.
```

---

## Seed Data

Seed the database with the following to make the demo compelling. Create a seed script at `prisma/seed.ts`.

**Organisation:** `{ name: "Celestial Capital", slug: "celestial" }`

**User:** `{ email: "ops@celestial.com", name: "Alfonso Bauza", passwordHash: [bcrypt hash of "demo1234"] }`

**Funds:**
```
Real Estate Income Trust — aliases: ["REIT", "Real Estate Income Trust", "RE Income Trust"] — Class A, Class B
Infrastructure Fund — aliases: ["Infra Fund", "Infrastructure Fund"] — Class A
Private Credit Fund — aliases: ["PCF", "Private Credit", "Private Credit Fund"] — Class A
```

**Distributors:** iCapital, CAIS, UBS Wealth Management

**Mapping templates:**

iCapital template:
```json
{
  "transaction_id": "transactionId",
  "trade_type": "transactionType",
  "trade_amount": "amount",
  "effective_date": "effectiveDate",
  "fund_name": "fundName",
  "share_class": "shareClass",
  "investor_name": "investorName",
  "status": "status",
  "currency": "currency"
}
```

CAIS template:
```json
{
  "TxnRef": "transactionId",
  "Type": "transactionType",
  "Amount": "amount",
  "SettlementDate": "effectiveDate",
  "Fund": "fundName",
  "Class": "shareClass",
  "Client": "investorName",
  "Stage": "status",
  "CCY": "currency"
}
```

**Historical ingestion runs (3):**

Run 1 — iCapital, Jan 31 2026, 52 rows, 49 committed, 3 flagged, AI quality score: 92, status: COMMITTED
Run 2 — CAIS, Jan 31 2026, 38 rows, 35 committed, 5 flagged, AI quality score: 74, status: COMMITTED
Run 3 — UBS Wealth Management, Dec 31 2025, 21 rows, 14 committed, 7 flagged (high flag count), AI quality score: 51, status: COMMITTED

**WorkbenchOrder records:** Generate realistic mock data for each committed run. Include a mix of:
- Clean subscriptions (no flags)
- Clean redemptions (no flags)
- Rows with `FUND_NOT_RECOGNISED` flag
- Rows with `POTENTIAL_NIGO` flag
- One `POSSIBLE_DUPLICATE` row per run

Use realistic investor names, amounts ($25,000–$500,000), and fund/share class combinations from the seeded funds.

---

## Component Notes

- Use VUI's data table component for all tables
- Use VUI's step indicator component for the multi-step flow
- Use VUI's badge component for status and quality score badges
- Use VUI's combobox for the distributor selector (supports search + inline creation)
- Use VUI's file upload component for the drag-and-drop zone
- Use VUI's collapsible for the AI pre-flight panel and flagged rows section
- All monetary amounts should be formatted as USD with comma separators (e.g. $125,000)
- All dates should be formatted as "DD MMM YYYY" (e.g. 31 Jan 2026)
- Maintain consistent Vega dark theme throughout — reference `app/globals.css` for CSS variables

---

## Definition of Done

The ingestion module is complete when:
- [ ] A user can log in and navigate to `/wealth/ingestion`
- [ ] Historical runs are visible in the history table with correct colour-coded quality scores
- [ ] A user can start a new ingestion, upload a `.csv` or `.xlsx` file, and see detected columns
- [ ] AI column mapping suggestions are returned and pre-populate the mapping dropdowns with confidence badges
- [ ] A user can save a mapping template and have it load on the next run for the same distributor
- [ ] The review step shows the AI pre-flight panel with quality score and flag breakdown
- [ ] A user can exclude individual rows and commit the rest
- [ ] Committed `WorkbenchOrder` records appear in the database
- [ ] The summary page shows the AI-generated narrative
- [ ] All seeded historical data renders correctly
- [ ] The re-ingestion warning appears when a run for the same distributor + close cycle already exists
- [ ] The "Start Reconciliation" button is disabled with a "Coming soon" tooltip
