import { PrismaClient, IngestionStatus } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import bcrypt from "bcryptjs"
import "dotenv/config"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const INVESTORS = [
  "James Harrington",
  "Sarah Mitchell",
  "Robert Chen",
  "Elena Vasquez",
  "Michael Thompson",
  "Catherine Liu",
  "David Park",
  "Rachel Goldstein",
  "Andrew Williams",
  "Priya Sharma",
  "Thomas Berg",
  "Laura Santos",
  "Christopher Kim",
  "Amelia Johnson",
  "Daniel Foster",
  "Sophie Nakamura",
  "William Clarke",
  "Isabella Reyes",
  "Benjamin Walsh",
  "Natasha Ivanova",
]

type FundInfo = { name: string; classes: string[] }

const FUND_INFO: FundInfo[] = [
  { name: "Real Estate Income Trust", classes: ["Class A", "Class B"] },
  { name: "Infrastructure Fund", classes: ["Class A"] },
  { name: "Private Credit Fund", classes: ["Class A"] },
]

const FLAG_TYPES = ["POTENTIAL_NIGO", "POSSIBLE_DUPLICATE", "FUND_NOT_RECOGNISED", "MISSING_REQUIRED"] as const
type FlagType = (typeof FLAG_TYPES)[number]

interface AiFlag {
  type: FlagType
  reason: string
}

interface OrderSpec {
  transactionId: string
  transactionType: string
  amount: number
  effectiveDate: Date
  fundName: string | null
  shareClass: string | null
  investorName: string | null
  status: string
  currency: string
  aiFlags: AiFlag[] | null
  isExcluded: boolean
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pickFrom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

function randomAmount(rand: () => number): number {
  const buckets = [25000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 500000]
  return pickFrom(buckets, rand)
}

function generateOrders(
  count: number,
  excluded: number,
  flagSpecs: { type: FlagType; reason: string }[],
  effectiveDate: Date,
  seed: number,
): OrderSpec[] {
  const rand = seededRandom(seed)
  const orders: OrderSpec[] = []
  const txPrefix = `TXN-${seed}-`

  for (let i = 0; i < count; i++) {
    const fund = pickFrom(FUND_INFO, rand)
    const shareClass = pickFrom(fund.classes, rand)
    const investor = pickFrom(INVESTORS, rand)
    const type = rand() > 0.35 ? "Subscription" : "Redemption"
    const amount = randomAmount(rand)
    const flagIndex = i < flagSpecs.length ? i : -1
    const flags = flagIndex >= 0 ? [flagSpecs[flagIndex]] : null
    const isExcluded = i >= count - excluded

    // For FUND_NOT_RECOGNISED, use an unrecognised fund name
    const fundName =
      flags && flags[0].type === "FUND_NOT_RECOGNISED"
        ? "Horizon Real Assets Fund"
        : fund.name

    // For MISSING_REQUIRED, clear the investor name
    const finalInvestor =
      flags && flags[0].type === "MISSING_REQUIRED" ? null : investor

    orders.push({
      transactionId: `${txPrefix}${String(i + 1).padStart(4, "0")}`,
      transactionType: type,
      amount,
      effectiveDate,
      fundName,
      shareClass,
      investorName: finalInvestor,
      status: isExcluded ? "Pending" : "Committed",
      currency: "USD",
      aiFlags: flags,
      isExcluded,
    })
  }

  return orders
}

async function main() {
  console.log("Seeding database...")

  // ─── Organisation ──────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: "celestial" },
    update: {},
    create: {
      name: "Celestial Capital",
      slug: "celestial",
    },
  })
  console.log("  ✓ Organisation:", org.name)

  // ─── User ──────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("demo1234", 10)
  const user = await prisma.user.upsert({
    where: { email: "ops@celestial.com" },
    update: {},
    create: {
      email: "ops@celestial.com",
      name: "Alfonso Bauza",
      passwordHash,
      memberships: {
        create: {
          organizationId: org.id,
          role: "OWNER",
        },
      },
    },
  })
  console.log("  ✓ User:", user.email)

  // ─── Funds ─────────────────────────────────────────────────────────────────
  const fundDefs = [
    {
      name: "Real Estate Income Trust",
      aliases: ["REIT", "Real Estate Income Trust", "RE Income Trust"],
      shareClasses: ["Class A", "Class B"],
    },
    {
      name: "Infrastructure Fund",
      aliases: ["Infra Fund", "Infrastructure Fund"],
      shareClasses: ["Class A"],
    },
    {
      name: "Private Credit Fund",
      aliases: ["PCF", "Private Credit", "Private Credit Fund"],
      shareClasses: ["Class A"],
    },
  ]

  const funds = []
  for (const f of fundDefs) {
    const fund = await prisma.fund.upsert({
      where: { id: `fund-${f.name.toLowerCase().replace(/\s/g, "-")}` },
      update: {},
      create: {
        id: `fund-${f.name.toLowerCase().replace(/\s/g, "-")}`,
        name: f.name,
        aliases: f.aliases,
        shareClasses: f.shareClasses,
        organizationId: org.id,
      },
    })
    funds.push(fund)
  }
  console.log("  ✓ Funds:", funds.length)

  // ─── Distributors ──────────────────────────────────────────────────────────
  const distributorDefs = [
    { id: "dist-icapital", name: "iCapital" },
    { id: "dist-cais", name: "CAIS" },
    { id: "dist-ubs", name: "UBS Wealth Management" },
  ]

  const distributors: Record<string, string> = {}
  for (const d of distributorDefs) {
    const dist = await prisma.distributor.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        name: d.name,
        organizationId: org.id,
      },
    })
    distributors[d.name] = dist.id
  }
  console.log("  ✓ Distributors:", Object.keys(distributors).length)

  // ─── Mapping Templates ─────────────────────────────────────────────────────
  await prisma.columnMappingTemplate.upsert({
    where: { id: "tpl-icapital-default" },
    update: {},
    create: {
      id: "tpl-icapital-default",
      name: "iCapital — Default",
      distributorId: distributors["iCapital"],
      organizationId: org.id,
      isDefault: true,
      lastUsedAt: new Date("2026-01-31"),
      mappingJson: {
        transaction_id: "transactionId",
        trade_type: "transactionType",
        trade_amount: "amount",
        effective_date: "effectiveDate",
        fund_name: "fundName",
        share_class: "shareClass",
        investor_name: "investorName",
        status: "status",
        currency: "currency",
      },
    },
  })

  await prisma.columnMappingTemplate.upsert({
    where: { id: "tpl-cais-default" },
    update: {},
    create: {
      id: "tpl-cais-default",
      name: "CAIS — Default",
      distributorId: distributors["CAIS"],
      organizationId: org.id,
      isDefault: true,
      lastUsedAt: new Date("2026-01-31"),
      mappingJson: {
        TxnRef: "transactionId",
        Type: "transactionType",
        Amount: "amount",
        SettlementDate: "effectiveDate",
        Fund: "fundName",
        Class: "shareClass",
        Client: "investorName",
        Stage: "status",
        CCY: "currency",
      },
    },
  })
  console.log("  ✓ Mapping templates: 2")

  // ─── Ingestion Runs ────────────────────────────────────────────────────────

  // Run 1 — iCapital, Jan 31 2026, score 92
  // 1 MISSING_REQUIRED + 1 FUND_NOT_RECOGNISED = 100 - 5 - 3 = 92
  const run1Flags: { type: FlagType; reason: string }[] = [
    { type: "MISSING_REQUIRED", reason: "Investor name is missing" },
    { type: "FUND_NOT_RECOGNISED", reason: "Fund 'Horizon Real Assets Fund' not in registry" },
    { type: "POSSIBLE_DUPLICATE", reason: "Possible duplicate of TXN-1-0001" },
  ]
  const run1Orders = generateOrders(49, 3, run1Flags, new Date("2026-01-31"), 1)

  const run1 = await prisma.ingestionRun.upsert({
    where: { id: "run-icapital-jan26" },
    update: {},
    create: {
      id: "run-icapital-jan26",
      distributorId: distributors["iCapital"],
      organizationId: org.id,
      userId: user.id,
      closeCycle: new Date("2026-01-31"),
      fileName: "iCapital_Trades_Jan2026.xlsx",
      detectedColumns: [
        "transaction_id",
        "trade_type",
        "trade_amount",
        "effective_date",
        "fund_name",
        "share_class",
        "investor_name",
        "status",
        "currency",
      ],
      status: IngestionStatus.COMMITTED,
      rowsProcessed: 52,
      rowsIngested: 49,
      rowsExcluded: 3,
      rowsFlagged: 3,
      aiQualityScore: 92,
      aiSummary:
        "49 of 52 iCapital trades were successfully committed to the order book. One row was flagged for a missing investor name and one for an unrecognised fund name; three rows were excluded by the operator prior to commit.",
      templateId: "tpl-icapital-default",
      committedAt: new Date("2026-01-31T14:23:00Z"),
    },
  })

  for (const o of run1Orders) {
    await prisma.workbenchOrder.create({
      data: {
        runId: run1.id,
        organizationId: org.id,
        transactionId: o.transactionId,
        transactionType: o.transactionType,
        amount: o.amount,
        effectiveDate: o.effectiveDate,
        fundName: o.fundName,
        shareClass: o.shareClass,
        investorName: o.investorName,
        status: o.status,
        currency: o.currency,
        aiFlags: o.aiFlags ? JSON.parse(JSON.stringify(o.aiFlags)) : undefined,
        isExcluded: o.isExcluded,
      },
    })
  }
  console.log("  ✓ Run 1 (iCapital Jan 2026):", run1Orders.length, "orders")

  // Run 2 — CAIS, Jan 31 2026, score 74
  // 3 MISSING_REQUIRED + 3 FUND_NOT_RECOGNISED + 1 POSSIBLE_DUPLICATE = -15-9-2 = 74
  const run2Flags: { type: FlagType; reason: string }[] = [
    { type: "MISSING_REQUIRED", reason: "Investor name is missing" },
    { type: "MISSING_REQUIRED", reason: "Share class is missing" },
    { type: "MISSING_REQUIRED", reason: "Transaction type value is unrecognised" },
    { type: "FUND_NOT_RECOGNISED", reason: "Fund 'Horizon Real Assets Fund' not in registry" },
    { type: "FUND_NOT_RECOGNISED", reason: "Fund 'Alpha Private Equity' not in registry" },
    { type: "POSSIBLE_DUPLICATE", reason: "Possible duplicate of TXN-2-0001" },
  ]
  const run2Orders = generateOrders(35, 3, run2Flags, new Date("2026-01-31"), 2)

  const run2 = await prisma.ingestionRun.upsert({
    where: { id: "run-cais-jan26" },
    update: {},
    create: {
      id: "run-cais-jan26",
      distributorId: distributors["CAIS"],
      organizationId: org.id,
      userId: user.id,
      closeCycle: new Date("2026-01-31"),
      fileName: "CAIS_OrderFile_Jan2026.csv",
      detectedColumns: [
        "TxnRef",
        "Type",
        "Amount",
        "SettlementDate",
        "Fund",
        "Class",
        "Client",
        "Stage",
        "CCY",
      ],
      status: IngestionStatus.COMMITTED,
      rowsProcessed: 38,
      rowsIngested: 35,
      rowsExcluded: 3,
      rowsFlagged: 5,
      aiQualityScore: 74,
      aiSummary:
        "35 of 38 CAIS trades were committed. 5 rows were flagged — 3 for missing required fields and 2 for unrecognised fund names. The data quality score of 74 is below the average for this distributor.",
      templateId: "tpl-cais-default",
      committedAt: new Date("2026-01-31T16:05:00Z"),
    },
  })

  for (const o of run2Orders) {
    await prisma.workbenchOrder.create({
      data: {
        runId: run2.id,
        organizationId: org.id,
        transactionId: o.transactionId,
        transactionType: o.transactionType,
        amount: o.amount,
        effectiveDate: o.effectiveDate,
        fundName: o.fundName,
        shareClass: o.shareClass,
        investorName: o.investorName,
        status: o.status,
        currency: o.currency,
        aiFlags: o.aiFlags ? JSON.parse(JSON.stringify(o.aiFlags)) : undefined,
        isExcluded: o.isExcluded,
      },
    })
  }
  console.log("  ✓ Run 2 (CAIS Jan 2026):", run2Orders.length, "orders")

  // Run 3 — UBS Wealth Management, Dec 31 2025, score 51 (high flag count)
  // 9 MISSING_REQUIRED + 1 POTENTIAL_NIGO = -45-4 = 51
  const run3Flags: { type: FlagType; reason: string }[] = [
    { type: "POTENTIAL_NIGO", reason: "Missing share class and unrecognised transaction type" },
    { type: "MISSING_REQUIRED", reason: "Transaction ID is missing" },
    { type: "MISSING_REQUIRED", reason: "Investor name is missing" },
    { type: "MISSING_REQUIRED", reason: "Amount is zero" },
    { type: "MISSING_REQUIRED", reason: "Effective date is missing" },
    { type: "FUND_NOT_RECOGNISED", reason: "Fund 'UBS Growth Partners' not in registry" },
    { type: "POSSIBLE_DUPLICATE", reason: "Possible duplicate of TXN-3-0001" },
  ]
  const run3Orders = generateOrders(14, 7, run3Flags, new Date("2025-12-31"), 3)

  const run3 = await prisma.ingestionRun.upsert({
    where: { id: "run-ubs-dec25" },
    update: {},
    create: {
      id: "run-ubs-dec25",
      distributorId: distributors["UBS Wealth Management"],
      organizationId: org.id,
      userId: user.id,
      closeCycle: new Date("2025-12-31"),
      fileName: "UBS_WM_TradeFile_Dec2025.xlsx",
      detectedColumns: [
        "Reference",
        "TradeType",
        "TradeValue",
        "TradeDate",
        "FundName",
        "Class",
        "InvestorName",
        "TradeStatus",
        "Ccy",
      ],
      status: IngestionStatus.COMMITTED,
      rowsProcessed: 21,
      rowsIngested: 14,
      rowsExcluded: 7,
      rowsFlagged: 7,
      aiQualityScore: 51,
      aiSummary:
        "Only 14 of 21 UBS Wealth Management trades could be committed — 7 rows were excluded due to data quality issues. The AI quality score of 51 is significantly below average, driven by missing required fields across multiple rows and an unrecognised fund name.",
      committedAt: new Date("2025-12-31T11:42:00Z"),
    },
  })

  for (const o of run3Orders) {
    await prisma.workbenchOrder.create({
      data: {
        runId: run3.id,
        organizationId: org.id,
        transactionId: o.transactionId,
        transactionType: o.transactionType,
        amount: o.amount,
        effectiveDate: o.effectiveDate,
        fundName: o.fundName,
        shareClass: o.shareClass,
        investorName: o.investorName,
        status: o.status,
        currency: o.currency,
        aiFlags: o.aiFlags ? JSON.parse(JSON.stringify(o.aiFlags)) : undefined,
        isExcluded: o.isExcluded,
      },
    })
  }
  console.log("  ✓ Run 3 (UBS Dec 2025):", run3Orders.length, "orders")

  console.log("\nSeed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
