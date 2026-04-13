# App Templates

Complete app shell templates with navigation, routing, and page stubs. Each template is working TSX.

---

## Table of Contents

1. [Sidebar App (CRM-style)](#1-sidebar-app-crm-style)
2. [Topbar App (Marketing SaaS)](#2-topbar-app-marketing-saas)
3. [Combined Sidebar + Topbar](#3-combined-sidebar--topbar)

---

## 1. Sidebar App (CRM-style)

A sidebar-navigated app with dashboard, contacts list, and settings pages.

### Directory Structure

```
app/
├── layout.tsx
├── globals.css
├── (app)/
│   ├── layout.tsx          # Sidebar + SidebarInset
│   ├── dashboard/
│   │   └── page.tsx
│   ├── contacts/
│   │   ├── page.tsx        # Contact list
│   │   └── [id]/
│   │       └── page.tsx    # Contact detail
│   └── settings/
│       └── page.tsx
└── (auth)/
    ├── layout.tsx          # Centered card layout
    └── login/
        └── page.tsx
```

### Nav Config

```tsx
// lib/nav-config.ts
import { LayoutDashboardIcon, UsersIcon, SettingsIcon, InboxIcon, BarChart3Icon } from "lucide-react"

export const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
      { title: "Analytics", url: "/analytics", icon: BarChart3Icon },
    ],
  },
  {
    label: "Manage",
    items: [
      { title: "Contacts", url: "/contacts", icon: UsersIcon },
      { title: "Inbox", url: "/inbox", icon: InboxIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", url: "/settings", icon: SettingsIcon },
    ],
  },
]
```

### App Layout (Sidebar)

```tsx
// app/(app)/layout.tsx
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
	SidebarProvider,
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarInset,
	SidebarHeader,
	SidebarFooter,
	SidebarTrigger,
	SidebarRail,
} from "@/components/vui/sidebar"
import { Avatar, AvatarFallback } from "@/components/vui/avatar"
import { navGroups } from "@/lib/nav-config"

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()

	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader>
					<div className="flex items-center gap-2 px-2 py-1">
						<div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
							A
						</div>
						<span className="text-lg font-semibold">Acme CRM</span>
					</div>
				</SidebarHeader>
				<SidebarContent>
					{navGroups.map((group) => (
						<SidebarGroup key={group.label}>
							<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{group.items.map((item) => (
										<SidebarMenuItem key={item.url}>
											<SidebarMenuButton
												asChild
												isActive={pathname.startsWith(item.url)}
											>
												<Link href={item.url}>
													<item.icon />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					))}
				</SidebarContent>
				<SidebarFooter>
					<div className="flex items-center gap-2 px-2 py-1">
						<Avatar className="size-7">
							<AvatarFallback className="text-xs">AO</AvatarFallback>
						</Avatar>
						<div className="flex flex-col text-sm">
							<span className="font-medium">Amara Osei</span>
							<span className="text-xs text-muted-foreground">
								amara@example.com
							</span>
						</div>
					</div>
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>
			<SidebarInset>
				<header className="md:hidden sticky top-0 flex h-14 items-center gap-2 border-b bg-background px-4">
					<SidebarTrigger />
				</header>
				<main className="flex-1">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
```

### Dashboard Page

```tsx
// app/(app)/dashboard/page.tsx
import {
	PageWrapper,
	PageContent,
	PageHeader,
	PageHeaderContent,
	PageHeaderTitle,
	PageHeaderDescription,
	PageHeaderActions,
} from "@/components/vui/layout/page-layout"
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/vui/card"
import { Button } from "@/components/vui/button"
import { Badge } from "@/components/vui/badge"

const stats = [
	{ title: "Total Contacts", value: "2,847", change: "+124 this month" },
	{ title: "Open Deals", value: "$384,200", change: "18 active" },
	{ title: "Tasks Due", value: "12", change: "3 overdue" },
]

export default function DashboardPage() {
	return (
		<PageWrapper variant="full">
			<PageHeader>
				<PageHeaderContent>
					<PageHeaderTitle>Dashboard</PageHeaderTitle>
					<PageHeaderDescription>
						Welcome back, Amara
					</PageHeaderDescription>
				</PageHeaderContent>
				<PageHeaderActions>
					<Button variant="outline">Export</Button>
					<Button>Add contact</Button>
				</PageHeaderActions>
			</PageHeader>
			<PageContent>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{stats.map((s) => (
						<Card key={s.title}>
							<CardHeader>
								<CardDescription>{s.title}</CardDescription>
								<CardTitle className="text-3xl">{s.value}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">{s.change}</p>
							</CardContent>
						</Card>
					))}
				</div>
			</PageContent>
		</PageWrapper>
	)
}
```

### Auth Layout + Login Page

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
			{children}
		</div>
	)
}
```

```tsx
// app/(auth)/login/page.tsx
"use client"

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/vui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/vui/field"
import { Input } from "@/components/vui/input"
import { Button } from "@/components/vui/button"
import Link from "next/link"

export default function LoginPage() {
	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>Sign in</CardTitle>
				<CardDescription>
					Enter your credentials to access your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<Input id="email" type="email" placeholder="amara@example.com" />
					</Field>
					<Field>
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<Input id="password" type="password" />
					</Field>
				</FieldGroup>
			</CardContent>
			<CardFooter className="flex flex-col gap-2">
				<Button className="w-full">Sign in</Button>
				<p className="text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link href="/signup" className="underline">
						Sign up
					</Link>
				</p>
			</CardFooter>
		</Card>
	)
}
```

---

## 2. Topbar App (Marketing SaaS)

A topbar-navigated app for a marketing analytics platform.

### Directory Structure

```
app/
├── layout.tsx
├── globals.css
├── (app)/
│   ├── layout.tsx          # Topbar + TopbarInset
│   ├── overview/
│   │   └── page.tsx
│   ├── campaigns/
│   │   └── page.tsx
│   └── audience/
│       └── page.tsx
```

### App Layout (Topbar)

```tsx
// app/(app)/layout.tsx
import {
	TopbarProvider,
	Topbar,
	TopbarLeft,
	TopbarCenter,
	TopbarRight,
	TopbarContent,
	TopbarMenu,
	TopbarMenuList,
	TopbarMenuItem,
	TopbarMenuLink,
	TopbarInset,
	TopbarTrigger,
} from "@/components/vui/topbar"
import { Avatar, AvatarFallback } from "@/components/vui/avatar"
import { Button } from "@/components/vui/button"

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<TopbarProvider>
			<Topbar variant="sticky">
				<TopbarLeft>
					<TopbarTrigger />
					<span className="text-lg font-semibold">LaunchPad</span>
				</TopbarLeft>
				<TopbarCenter>
					<TopbarMenu>
						<TopbarMenuList>
							<TopbarMenuItem>
								<TopbarMenuLink href="/overview">Overview</TopbarMenuLink>
							</TopbarMenuItem>
							<TopbarMenuItem>
								<TopbarMenuLink href="/campaigns">Campaigns</TopbarMenuLink>
							</TopbarMenuItem>
							<TopbarMenuItem>
								<TopbarMenuLink href="/audience">Audience</TopbarMenuLink>
							</TopbarMenuItem>
						</TopbarMenuList>
					</TopbarMenu>
				</TopbarCenter>
				<TopbarRight>
					<TopbarContent>
						<Button variant="ghost" size="sm">
							Feedback
						</Button>
						<Avatar className="size-8">
							<AvatarFallback>KT</AvatarFallback>
						</Avatar>
					</TopbarContent>
				</TopbarRight>
			</Topbar>
			<TopbarInset>
				<main className="flex-1 p-6">{children}</main>
			</TopbarInset>
		</TopbarProvider>
	)
}
```

### Overview Page

```tsx
// app/(app)/overview/page.tsx
import {
	PageWrapper,
	PageContent,
	PageHeader,
	PageHeaderContent,
	PageHeaderTitle,
	PageHeaderActions,
} from "@/components/vui/layout/page-layout"
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/vui/card"
import { Button } from "@/components/vui/button"

export default function OverviewPage() {
	return (
		<PageWrapper variant="focused">
			<PageHeader>
				<PageHeaderContent>
					<PageHeaderTitle>Campaign Overview</PageHeaderTitle>
				</PageHeaderContent>
				<PageHeaderActions>
					<Button>New campaign</Button>
				</PageHeaderActions>
			</PageHeader>
			<PageContent>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Active Campaigns</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-4xl font-bold">7</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Total Reach</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-4xl font-bold">124.5K</p>
						</CardContent>
					</Card>
				</div>
			</PageContent>
		</PageWrapper>
	)
}
```

---

## 3. Combined Sidebar + Topbar

For complex dashboards needing both navigation levels. The topbar handles global nav (workspace switching, user menu), the sidebar handles section-specific navigation.

### Directory Structure

```
app/
├── layout.tsx
├── globals.css
├── (app)/
│   ├── layout.tsx          # TopbarProvider + SidebarProvider
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── team/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
```

### Combined Layout

```tsx
// app/(app)/layout.tsx
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
	TopbarProvider,
	Topbar,
	TopbarLeft,
	TopbarRight,
	TopbarContent,
	TopbarInset,
} from "@/components/vui/topbar"
import {
	SidebarProvider,
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarInset,
	SidebarTrigger,
	SidebarRail,
} from "@/components/vui/sidebar"
import { Avatar, AvatarFallback } from "@/components/vui/avatar"
import {
	FolderIcon,
	UsersIcon,
	SettingsIcon,
} from "lucide-react"

const sidebarItems = [
	{ title: "Projects", url: "/projects", icon: FolderIcon },
	{ title: "Team", url: "/team", icon: UsersIcon },
	{ title: "Settings", url: "/settings", icon: SettingsIcon },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()

	return (
		<TopbarProvider>
			<Topbar variant="sticky">
				<TopbarLeft>
					<SidebarTrigger className="md:hidden" />
					<span className="text-lg font-semibold">Workspace</span>
				</TopbarLeft>
				<TopbarRight>
					<TopbarContent>
						<Avatar className="size-8">
							<AvatarFallback>PS</AvatarFallback>
						</Avatar>
					</TopbarContent>
				</TopbarRight>
			</Topbar>
			<TopbarInset>
				<SidebarProvider>
					<Sidebar>
						<SidebarContent>
							<SidebarGroup>
								<SidebarGroupLabel>Workspace</SidebarGroupLabel>
								<SidebarGroupContent>
									<SidebarMenu>
										{sidebarItems.map((item) => (
											<SidebarMenuItem key={item.url}>
												<SidebarMenuButton
													asChild
													isActive={pathname.startsWith(item.url)}
												>
													<Link href={item.url}>
														<item.icon />
														<span>{item.title}</span>
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>
						</SidebarContent>
						<SidebarRail />
					</Sidebar>
					<SidebarInset>
						<main className="flex-1 p-6">{children}</main>
					</SidebarInset>
				</SidebarProvider>
			</TopbarInset>
		</TopbarProvider>
	)
}
```

The key to combining them: `TopbarProvider` wraps the outer shell, `SidebarProvider` is nested inside `TopbarInset`. The topbar handles global concerns (branding, user avatar), while the sidebar handles section navigation.
