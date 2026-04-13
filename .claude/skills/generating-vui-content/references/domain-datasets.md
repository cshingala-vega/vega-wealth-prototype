# Domain Datasets

Ready-to-use datasets for VUI prototypes. Copy the type definition and data array directly into your project.

All VUI components are imported from `@/components/vui/`.

---

## 1. CRM Contacts

```tsx
type Contact = {
  id: string
  name: string
  email: string
  company: string
  role: string
  status: "active" | "inactive" | "lead"
  phone: string
  lastContacted: Date
  dealValue: number
}

const contactStatusMap: Record<Contact["status"], "positive" | "negative" | "neutral"> = {
  active: "positive",
  inactive: "neutral",
  lead: "pending",
}

const contacts: Contact[] = [
  {
    id: "con-001",
    name: "Amara Osei",
    email: "amara.osei@example.com",
    company: "Verdant Systems",
    role: "VP of Engineering",
    status: "active",
    phone: "+1 (415) 555-0142",
    lastContacted: subDays(new Date(), 1),
    dealValue: 48000,
  },
  {
    id: "con-002",
    name: "Kai Tanaka",
    email: "kai.tanaka@example.com",
    company: "Neonwave Labs",
    role: "Head of Product",
    status: "active",
    phone: "+1 (628) 555-0198",
    lastContacted: subDays(new Date(), 3),
    dealValue: 125000,
  },
  {
    id: "con-003",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    company: "Cirrus Analytics",
    role: "CTO",
    status: "lead",
    phone: "+44 20 7946 0321",
    lastContacted: subDays(new Date(), 7),
    dealValue: 72000,
  },
  {
    id: "con-004",
    name: "Lucas Moreno",
    email: "lucas.moreno@example.com",
    company: "Terraforge Inc",
    role: "Director of Operations",
    status: "active",
    phone: "+1 (312) 555-0267",
    lastContacted: subHours(new Date(), 4),
    dealValue: 34500,
  },
  {
    id: "con-005",
    name: "Fatima Al-Rashid",
    email: "fatima.alrashid@example.com",
    company: "Lumen Health",
    role: "CEO",
    status: "active",
    phone: "+971 4 555 8834",
    lastContacted: subDays(new Date(), 14),
    dealValue: 210000,
  },
  {
    id: "con-006",
    name: "Ingrid Bergström",
    email: "ingrid.bergstrom@example.com",
    company: "Polaris Consulting",
    role: "Managing Partner",
    status: "inactive",
    phone: "+46 8 555 1920",
    lastContacted: subDays(new Date(), 45),
    dealValue: 0,
  },
  {
    id: "con-007",
    name: "Oluwaseun Adeyemi",
    email: "seun.adeyemi@example.com",
    company: "Kova Fintech",
    role: "VP of Sales",
    status: "lead",
    phone: "+234 1 555 7821",
    lastContacted: subDays(new Date(), 2),
    dealValue: 89000,
  },
  {
    id: "con-008",
    name: "Sofia Chen",
    email: "sofia.chen@example.com",
    company: "Arclight Media",
    role: "Creative Director",
    status: "active",
    phone: "+1 (213) 555-0384",
    lastContacted: subDays(new Date(), 5),
    dealValue: 18500,
  },
  {
    id: "con-009",
    name: "Rhys Blackwood",
    email: "rhys.blackwood@example.com",
    company: "Stonebridge Capital",
    role: "Investment Director",
    status: "inactive",
    phone: "+44 20 7946 0558",
    lastContacted: subDays(new Date(), 60),
    dealValue: 0,
  },
  {
    id: "con-010",
    name: "Mei-Ling Wu",
    email: "meiling.wu@example.com",
    company: "Helix Robotics",
    role: "Head of Partnerships",
    status: "lead",
    phone: "+65 6555 4210",
    lastContacted: subDays(new Date(), 1),
    dealValue: 156000,
  },
]
```

Usage with VUI Dot:

```tsx
import { Dot } from "@/components/vui/dot"

{contacts.map((c) => (
  <Dot key={c.id} variant={contactStatusMap[c.status]}>
    {c.status}
  </Dot>
))}
```

---

## 2. E-commerce Orders

```tsx
type OrderItem = {
  name: string
  qty: number
  price: number
}

type Order = {
  id: string
  customer: string
  email: string
  items: OrderItem[]
  total: number
  status: "completed" | "processing" | "shipped" | "cancelled" | "refunded"
  date: Date
  paymentMethod: string
}

const orderStatusMap: Record<Order["status"], "positive" | "negative" | "pending" | "neutral"> = {
  completed: "positive",
  shipped: "positive",
  processing: "pending",
  cancelled: "negative",
  refunded: "negative",
}

const orders: Order[] = [
  {
    id: "ORD-1041",
    customer: "Nadia Volkov",
    email: "nadia.volkov@example.com",
    items: [
      { name: "Wireless Charging Pad — Slate", qty: 1, price: 39.99 },
      { name: "USB-C Cable (2m)", qty: 2, price: 12.99 },
    ],
    total: 65.97,
    status: "completed",
    date: subHours(new Date(), 3),
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "ORD-1042",
    customer: "Arjun Patel",
    email: "arjun.patel@example.com",
    items: [
      { name: "Ergonomic Desk Chair — Midnight", qty: 1, price: 549.00 },
    ],
    total: 549.00,
    status: "processing",
    date: subHours(new Date(), 1),
    paymentMethod: "Mastercard •••• 8371",
  },
  {
    id: "ORD-1043",
    customer: "Camille Dubois",
    email: "camille.dubois@example.com",
    items: [
      { name: "Ceramic Pour-Over Set", qty: 1, price: 64.00 },
      { name: "Single-Origin Beans (340g)", qty: 3, price: 18.50 },
    ],
    total: 119.50,
    status: "shipped",
    date: subDays(new Date(), 1),
    paymentMethod: "Apple Pay",
  },
  {
    id: "ORD-1044",
    customer: "Tomás Herrera",
    email: "tomas.herrera@example.com",
    items: [
      { name: "Mechanical Keyboard — Cherry MX Brown", qty: 1, price: 159.00 },
      { name: "Wrist Rest — Walnut", qty: 1, price: 34.00 },
    ],
    total: 193.00,
    status: "completed",
    date: subDays(new Date(), 2),
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-1045",
    customer: "Amara Osei",
    email: "amara.osei@example.com",
    items: [
      { name: "Noise-Cancelling Headphones — Pearl", qty: 1, price: 349.00 },
    ],
    total: 349.00,
    status: "processing",
    date: subHours(new Date(), 6),
    paymentMethod: "Visa •••• 9104",
  },
  {
    id: "ORD-1046",
    customer: "Hiroshi Nakamura",
    email: "hiroshi.nakamura@example.com",
    items: [
      { name: "Laptop Stand — Aluminum", qty: 1, price: 79.00 },
      { name: "Monitor Light Bar", qty: 1, price: 54.00 },
      { name: "Desk Mat — Charcoal (90x40)", qty: 1, price: 29.00 },
    ],
    total: 162.00,
    status: "completed",
    date: subDays(new Date(), 3),
    paymentMethod: "Mastercard •••• 5520",
  },
  {
    id: "ORD-1047",
    customer: "Sofia Chen",
    email: "sofia.chen@example.com",
    items: [
      { name: "Smart Thermostat — White", qty: 1, price: 219.00 },
    ],
    total: 219.00,
    status: "cancelled",
    date: subDays(new Date(), 4),
    paymentMethod: "Visa •••• 3387",
  },
  {
    id: "ORD-1048",
    customer: "Priya Sharma",
    email: "priya.sharma@example.com",
    items: [
      { name: "Portable SSD 1TB", qty: 2, price: 89.99 },
    ],
    total: 179.98,
    status: "shipped",
    date: subDays(new Date(), 2),
    paymentMethod: "Google Pay",
  },
  {
    id: "ORD-1049",
    customer: "Lucas Moreno",
    email: "lucas.moreno@example.com",
    items: [
      { name: "Standing Desk Converter", qty: 1, price: 299.00 },
    ],
    total: 299.00,
    status: "refunded",
    date: subDays(new Date(), 8),
    paymentMethod: "Amex •••• 1002",
  },
  {
    id: "ORD-1050",
    customer: "Kai Tanaka",
    email: "kai.tanaka@example.com",
    items: [
      { name: "Webcam — 4K Pro", qty: 1, price: 199.00 },
      { name: "Ring Light (12\")", qty: 1, price: 44.00 },
    ],
    total: 243.00,
    status: "completed",
    date: subDays(new Date(), 1),
    paymentMethod: "Visa •••• 6615",
  },
]
```

Usage with VUI Dot:

```tsx
import { Dot } from "@/components/vui/dot"

{orders.map((o) => (
  <Dot key={o.id} variant={orderStatusMap[o.status]}>
    {o.status}
  </Dot>
))}
```

---

## 3. Project Management Tasks

```tsx
type Task = {
  id: string
  title: string
  description: string
  assignee: string
  priority: "critical" | "high" | "medium" | "low"
  status: "todo" | "in-progress" | "review" | "done" | "blocked"
  dueDate: Date
  tags: string[]
  estimatedHours: number
}

const taskStatusMap: Record<Task["status"], "positive" | "negative" | "pending" | "neutral"> = {
  done: "positive",
  "in-progress": "pending",
  review: "pending",
  todo: "neutral",
  blocked: "negative",
}

const taskPriorityMap: Record<Task["priority"], "default" | "destructive" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
}

const tasks: Task[] = [
  {
    id: "task-001",
    title: "Migrate auth service to OAuth 2.1",
    description: "Replace legacy session-based auth with OAuth 2.1 + PKCE flow across all client apps.",
    assignee: "Kai Tanaka",
    priority: "critical",
    status: "in-progress",
    dueDate: addDays(new Date(), 5),
    tags: ["backend", "security"],
    estimatedHours: 24,
  },
  {
    id: "task-002",
    title: "Design system color token audit",
    description: "Review all color tokens for WCAG AA contrast compliance and update failing pairs.",
    assignee: "Sofia Chen",
    priority: "high",
    status: "review",
    dueDate: addDays(new Date(), 2),
    tags: ["design", "accessibility"],
    estimatedHours: 8,
  },
  {
    id: "task-003",
    title: "Add pagination to /api/transactions",
    description: "Implement cursor-based pagination to handle accounts with 10k+ transactions.",
    assignee: "Arjun Patel",
    priority: "high",
    status: "done",
    dueDate: subDays(new Date(), 1),
    tags: ["backend", "api"],
    estimatedHours: 6,
  },
  {
    id: "task-004",
    title: "Write onboarding email sequence",
    description: "Draft 5-email welcome series for new trial signups with CTA to upgrade.",
    assignee: "Camille Dubois",
    priority: "medium",
    status: "in-progress",
    dueDate: addDays(new Date(), 7),
    tags: ["marketing", "copy"],
    estimatedHours: 12,
  },
  {
    id: "task-005",
    title: "Fix timezone bug in scheduling widget",
    description: "Appointments created in PST display incorrectly for users in UTC+5:30 and above.",
    assignee: "Lucas Moreno",
    priority: "critical",
    status: "blocked",
    dueDate: subDays(new Date(), 2),
    tags: ["frontend", "bug"],
    estimatedHours: 4,
  },
  {
    id: "task-006",
    title: "Set up E2E tests for checkout flow",
    description: "Add Playwright tests covering guest checkout, discount codes, and failed payments.",
    assignee: "Priya Sharma",
    priority: "medium",
    status: "todo",
    dueDate: addDays(new Date(), 10),
    tags: ["testing", "frontend"],
    estimatedHours: 16,
  },
  {
    id: "task-007",
    title: "Implement file upload size validation",
    description: "Enforce 25MB limit on client and server; show clear error messaging for oversized files.",
    assignee: "Oluwaseun Adeyemi",
    priority: "medium",
    status: "done",
    dueDate: subDays(new Date(), 3),
    tags: ["backend", "validation"],
    estimatedHours: 3,
  },
  {
    id: "task-008",
    title: "Localize settings page for ja-JP",
    description: "Translate all settings labels and help text to Japanese; handle layout shifts for longer strings.",
    assignee: "Hiroshi Nakamura",
    priority: "low",
    status: "todo",
    dueDate: addDays(new Date(), 14),
    tags: ["i18n", "frontend"],
    estimatedHours: 10,
  },
  {
    id: "task-009",
    title: "Reduce bundle size of dashboard page",
    description: "Audit imports on /dashboard — current chunk is 420kB, target is under 200kB.",
    assignee: "Amara Osei",
    priority: "high",
    status: "in-progress",
    dueDate: addDays(new Date(), 3),
    tags: ["performance", "frontend"],
    estimatedHours: 8,
  },
  {
    id: "task-010",
    title: "Draft Q2 product roadmap",
    description: "Compile feature requests, usage data, and sales feedback into a prioritized roadmap deck.",
    assignee: "Fatima Al-Rashid",
    priority: "low",
    status: "todo",
    dueDate: addDays(new Date(), 21),
    tags: ["product", "strategy"],
    estimatedHours: 6,
  },
]
```

Usage with VUI Dot and Badge:

```tsx
import { Dot } from "@/components/vui/dot"
import { Badge } from "@/components/vui/badge"

{tasks.map((t) => (
  <div key={t.id} className="flex items-center gap-2">
    <Badge variant={taskPriorityMap[t.priority]}>{t.priority}</Badge>
    <span>{t.title}</span>
    <Dot variant={taskStatusMap[t.status]}>{t.status}</Dot>
  </div>
))}
```

---

## 4. HR Employees

```tsx
type Employee = {
  id: string
  name: string
  email: string
  department: string
  role: string
  startDate: Date
  salary: number
  status: "active" | "on-leave" | "terminated"
  manager: string
  location: string
}

const employeeStatusMap: Record<Employee["status"], "positive" | "negative" | "pending"> = {
  active: "positive",
  "on-leave": "pending",
  terminated: "negative",
}

const employees: Employee[] = [
  {
    id: "emp-001",
    name: "Amara Osei",
    email: "amara.osei@example.com",
    department: "Engineering",
    role: "Senior Frontend Engineer",
    startDate: new Date("2023-03-15"),
    salary: 145000,
    status: "active",
    manager: "Kai Tanaka",
    location: "San Francisco, CA",
  },
  {
    id: "emp-002",
    name: "Kai Tanaka",
    email: "kai.tanaka@example.com",
    department: "Engineering",
    role: "Engineering Manager",
    startDate: new Date("2021-09-01"),
    salary: 178000,
    status: "active",
    manager: "Fatima Al-Rashid",
    location: "San Francisco, CA",
  },
  {
    id: "emp-003",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    department: "Engineering",
    role: "Backend Engineer",
    startDate: new Date("2024-01-08"),
    salary: 132000,
    status: "active",
    manager: "Kai Tanaka",
    location: "London, UK",
  },
  {
    id: "emp-004",
    name: "Camille Dubois",
    email: "camille.dubois@example.com",
    department: "Design",
    role: "Senior Product Designer",
    startDate: new Date("2022-06-20"),
    salary: 138000,
    status: "on-leave",
    manager: "Sofia Chen",
    location: "Paris, France",
  },
  {
    id: "emp-005",
    name: "Sofia Chen",
    email: "sofia.chen@example.com",
    department: "Design",
    role: "Design Lead",
    startDate: new Date("2021-02-14"),
    salary: 162000,
    status: "active",
    manager: "Fatima Al-Rashid",
    location: "New York, NY",
  },
  {
    id: "emp-006",
    name: "Tomás Herrera",
    email: "tomas.herrera@example.com",
    department: "Sales",
    role: "Account Executive",
    startDate: new Date("2024-07-01"),
    salary: 95000,
    status: "active",
    manager: "Oluwaseun Adeyemi",
    location: "Mexico City, Mexico",
  },
  {
    id: "emp-007",
    name: "Oluwaseun Adeyemi",
    email: "seun.adeyemi@example.com",
    department: "Sales",
    role: "Sales Director",
    startDate: new Date("2022-01-10"),
    salary: 155000,
    status: "active",
    manager: "Fatima Al-Rashid",
    location: "Lagos, Nigeria",
  },
  {
    id: "emp-008",
    name: "Nadia Volkov",
    email: "nadia.volkov@example.com",
    department: "Marketing",
    role: "Content Strategist",
    startDate: new Date("2023-11-06"),
    salary: 108000,
    status: "active",
    manager: "Rhys Blackwood",
    location: "Berlin, Germany",
  },
  {
    id: "emp-009",
    name: "Rhys Blackwood",
    email: "rhys.blackwood@example.com",
    department: "Marketing",
    role: "VP of Marketing",
    startDate: new Date("2020-08-17"),
    salary: 185000,
    status: "active",
    manager: "Fatima Al-Rashid",
    location: "London, UK",
  },
  {
    id: "emp-010",
    name: "Hiroshi Nakamura",
    email: "hiroshi.nakamura@example.com",
    department: "Engineering",
    role: "DevOps Engineer",
    startDate: new Date("2023-04-22"),
    salary: 140000,
    status: "terminated",
    manager: "Kai Tanaka",
    location: "Tokyo, Japan",
  },
]
```

Usage with VUI Dot:

```tsx
import { Dot } from "@/components/vui/dot"

{employees.map((e) => (
  <Dot key={e.id} variant={employeeStatusMap[e.status]}>
    {e.status}
  </Dot>
))}
```

---

## 5. SaaS Metrics / Billing

```tsx
type Account = {
  id: string
  company: string
  plan: "free" | "starter" | "pro" | "enterprise"
  mrr: number
  users: number
  status: "active" | "churned" | "trial"
  signupDate: Date
  lastActive: Date
}

type MonthlyMetric = {
  month: string
  revenue: number
  newCustomers: number
  churn: number
  nps: number
}

const accountStatusMap: Record<Account["status"], "positive" | "negative" | "pending"> = {
  active: "positive",
  trial: "pending",
  churned: "negative",
}

const planBadgeMap: Record<Account["plan"], "default" | "destructive" | "secondary" | "outline"> = {
  enterprise: "default",
  pro: "secondary",
  starter: "outline",
  free: "outline",
}

const accounts: Account[] = [
  {
    id: "acc-001",
    company: "Verdant Systems",
    plan: "enterprise",
    mrr: 4800,
    users: 124,
    status: "active",
    signupDate: new Date("2024-02-10"),
    lastActive: subHours(new Date(), 1),
  },
  {
    id: "acc-002",
    company: "Neonwave Labs",
    plan: "pro",
    mrr: 299,
    users: 18,
    status: "active",
    signupDate: new Date("2024-09-15"),
    lastActive: subHours(new Date(), 3),
  },
  {
    id: "acc-003",
    company: "Cirrus Analytics",
    plan: "pro",
    mrr: 299,
    users: 32,
    status: "active",
    signupDate: new Date("2025-01-05"),
    lastActive: subDays(new Date(), 1),
  },
  {
    id: "acc-004",
    company: "Terraforge Inc",
    plan: "starter",
    mrr: 49,
    users: 5,
    status: "active",
    signupDate: new Date("2025-08-22"),
    lastActive: subDays(new Date(), 2),
  },
  {
    id: "acc-005",
    company: "Lumen Health",
    plan: "enterprise",
    mrr: 12000,
    users: 340,
    status: "active",
    signupDate: new Date("2023-11-01"),
    lastActive: subHours(new Date(), 6),
  },
  {
    id: "acc-006",
    company: "Polaris Consulting",
    plan: "pro",
    mrr: 0,
    users: 8,
    status: "churned",
    signupDate: new Date("2024-06-18"),
    lastActive: subDays(new Date(), 45),
  },
  {
    id: "acc-007",
    company: "Kova Fintech",
    plan: "starter",
    mrr: 49,
    users: 3,
    status: "trial",
    signupDate: subDays(new Date(), 7),
    lastActive: subHours(new Date(), 12),
  },
  {
    id: "acc-008",
    company: "Arclight Media",
    plan: "free",
    mrr: 0,
    users: 2,
    status: "active",
    signupDate: subDays(new Date(), 14),
    lastActive: subDays(new Date(), 3),
  },
]

const monthlyMetrics: MonthlyMetric[] = [
  { month: "2025-10", revenue: 42300, newCustomers: 28, churn: 3, nps: 62 },
  { month: "2025-11", revenue: 44100, newCustomers: 34, churn: 5, nps: 58 },
  { month: "2025-12", revenue: 46800, newCustomers: 31, churn: 2, nps: 65 },
  { month: "2026-01", revenue: 49200, newCustomers: 41, churn: 4, nps: 67 },
  { month: "2026-02", revenue: 51400, newCustomers: 38, churn: 3, nps: 71 },
  { month: "2026-03", revenue: 53100, newCustomers: 45, churn: 2, nps: 73 },
]
```

Usage with VUI Dot and Badge:

```tsx
import { Dot } from "@/components/vui/dot"
import { Badge } from "@/components/vui/badge"

{accounts.map((a) => (
  <div key={a.id} className="flex items-center gap-2">
    <span>{a.company}</span>
    <Badge variant={planBadgeMap[a.plan]}>{a.plan}</Badge>
    <Dot variant={accountStatusMap[a.status]}>{a.status}</Dot>
    <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a.mrr)}/mo</span>
  </div>
))}
```
