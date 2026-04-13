# Page Recipes

Complete page templates for common prototype patterns. Each recipe is working TSX.

---

## 1. Settings Page

A tabbed settings page with form fields inside a focused layout.

```tsx
"use client"

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
	CardFooter,
} from "@/components/vui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/vui/tabs"
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldDescription,
} from "@/components/vui/field"
import { Input } from "@/components/vui/input"
import { Textarea } from "@/components/vui/textarea"
import { Switch } from "@/components/vui/switch"
import { Button } from "@/components/vui/button"
import { Separator } from "@/components/vui/separator"

export default function SettingsPage() {
	return (
		<PageWrapper variant="focused">
			<PageHeader>
				<PageHeaderContent>
					<PageHeaderTitle>Settings</PageHeaderTitle>
					<PageHeaderDescription>
						Manage your account and preferences
					</PageHeaderDescription>
				</PageHeaderContent>
			</PageHeader>
			<PageContent>
				<Tabs defaultValue="profile">
					<TabsList>
						<TabsTrigger value="profile">Profile</TabsTrigger>
						<TabsTrigger value="notifications">Notifications</TabsTrigger>
						<TabsTrigger value="billing">Billing</TabsTrigger>
					</TabsList>

					<TabsContent value="profile">
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>Update your personal details</CardDescription>
							</CardHeader>
							<CardContent>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="name">Full name</FieldLabel>
										<Input id="name" defaultValue="Amara Osei" />
									</Field>
									<Field>
										<FieldLabel htmlFor="email">Email</FieldLabel>
										<Input
											id="email"
											type="email"
											defaultValue="amara@example.com"
										/>
										<FieldDescription>
											Used for login and notifications
										</FieldDescription>
									</Field>
									<Field>
										<FieldLabel htmlFor="bio">Bio</FieldLabel>
										<Textarea id="bio" placeholder="Tell us about yourself" />
									</Field>
								</FieldGroup>
							</CardContent>
							<CardFooter className="flex justify-end gap-2">
								<Button variant="outline">Cancel</Button>
								<Button>Save changes</Button>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value="notifications">
						<Card>
							<CardHeader>
								<CardTitle>Notification Preferences</CardTitle>
								<CardDescription>
									Choose what you want to be notified about
								</CardDescription>
							</CardHeader>
							<CardContent>
								<FieldGroup>
									<Field orientation="horizontal">
										<FieldLabel htmlFor="email-notif">
											Email notifications
										</FieldLabel>
										<Switch id="email-notif" defaultChecked />
									</Field>
									<Separator />
									<Field orientation="horizontal">
										<FieldLabel htmlFor="marketing">
											Marketing emails
										</FieldLabel>
										<Switch id="marketing" />
									</Field>
									<Separator />
									<Field orientation="horizontal">
										<FieldLabel htmlFor="security">Security alerts</FieldLabel>
										<Switch id="security" defaultChecked />
									</Field>
								</FieldGroup>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</PageContent>
		</PageWrapper>
	)
}
```

---

## 2. Record List Page

A filterable list of items with status indicators and actions.

```tsx
"use client"

import {
	PageWrapper,
	PageContent,
	PageHeader,
	PageHeaderContent,
	PageHeaderTitle,
	PageHeaderDescription,
	PageHeaderActions,
} from "@/components/vui/layout/page-layout"
import { Card, CardContent } from "@/components/vui/card"
import {
	Item,
	ItemGroup,
	ItemSeparator,
	ItemMedia,
	ItemContent,
	ItemTitle,
	ItemDescription,
	ItemActions,
} from "@/components/vui/item"
import { Dot } from "@/components/vui/dot"
import { Badge } from "@/components/vui/badge"
import { Button } from "@/components/vui/button"
import { Input } from "@/components/vui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/vui/avatar"
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/vui/dropdown-menu"
import { MoreHorizontalIcon, SearchIcon, PlusIcon } from "lucide-react"

const members = [
	{
		name: "Amara Osei",
		email: "amara@example.com",
		role: "Admin",
		status: "positive" as const,
		initials: "AO",
	},
	{
		name: "Kai Tanaka",
		email: "kai@example.com",
		role: "Editor",
		status: "positive" as const,
		initials: "KT",
	},
	{
		name: "Priya Sharma",
		email: "priya@example.com",
		role: "Viewer",
		status: "pending" as const,
		initials: "PS",
	},
	{
		name: "Lucas Moreno",
		email: "lucas@example.com",
		role: "Editor",
		status: "neutral" as const,
		initials: "LM",
	},
]

export default function TeamPage() {
	return (
		<PageWrapper variant="focused">
			<PageHeader>
				<PageHeaderContent>
					<PageHeaderTitle>Team Members</PageHeaderTitle>
					<PageHeaderDescription>
						{members.length} members
					</PageHeaderDescription>
				</PageHeaderContent>
				<PageHeaderActions>
					<Button>
						<PlusIcon data-icon="inline-start" /> Invite member
					</Button>
				</PageHeaderActions>
			</PageHeader>
			<PageContent>
				<div className="flex flex-col gap-4">
					<Input placeholder="Search members..." />
					<Card>
						<CardContent className="p-0">
							<ItemGroup>
								{members.map((m, i) => (
									<div key={m.email}>
										{i > 0 && <ItemSeparator />}
										<Item>
											<ItemMedia variant="icon">
												<Avatar>
													<AvatarFallback>{m.initials}</AvatarFallback>
												</Avatar>
											</ItemMedia>
											<ItemContent>
												<ItemTitle>{m.name}</ItemTitle>
												<ItemDescription>{m.email}</ItemDescription>
											</ItemContent>
											<ItemActions>
												<Dot variant={m.status} />
												<Badge variant="secondary">{m.role}</Badge>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon-sm">
															<MoreHorizontalIcon />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem>Edit role</DropdownMenuItem>
														<DropdownMenuItem>Remove</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</ItemActions>
										</Item>
									</div>
								))}
							</ItemGroup>
						</CardContent>
					</Card>
				</div>
			</PageContent>
		</PageWrapper>
	)
}
```

---

## 3. Dashboard with Stats

A full-width dashboard with stat cards and a data table.

```tsx
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
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/vui/card"
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/vui/table"
import { Badge } from "@/components/vui/badge"
import { Button } from "@/components/vui/button"
import { Dot } from "@/components/vui/dot"

const stats = [
	{
		title: "Revenue",
		value: "$24,580",
		change: "+12.5%",
		desc: "vs last month",
	},
	{ title: "Orders", value: "1,247", change: "+8.2%", desc: "vs last month" },
	{
		title: "Customers",
		value: "3,891",
		change: "+23.1%",
		desc: "vs last month",
	},
]

const orders = [
	{
		id: "ORD-7291",
		customer: "Amara Osei",
		amount: "$142.00",
		status: "Completed",
	},
	{
		id: "ORD-7290",
		customer: "Kai Tanaka",
		amount: "$89.50",
		status: "Processing",
	},
	{
		id: "ORD-7289",
		customer: "Priya Sharma",
		amount: "$234.00",
		status: "Completed",
	},
	{
		id: "ORD-7288",
		customer: "Lucas Moreno",
		amount: "$67.25",
		status: "Cancelled",
	},
]

export default function DashboardPage() {
	return (
		<PageWrapper>
			<PageHeader>
				<PageHeaderContent>
					<PageHeaderTitle>Dashboard</PageHeaderTitle>
				</PageHeaderContent>
				<PageHeaderActions>
					<Button variant="outline">Export</Button>
				</PageHeaderActions>
			</PageHeader>
			<PageContent>
				<div className="flex flex-col gap-6">
					{/* Stat cards */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{stats.map((s) => (
							<Card key={s.title}>
								<CardHeader>
									<CardTitle>{s.title}</CardTitle>
									<CardDescription>{s.desc}</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-3xl font-bold">{s.value}</p>
								</CardContent>
								<CardFooter>
									<Badge variant="secondary">{s.change}</Badge>
								</CardFooter>
							</Card>
						))}
					</div>

					{/* Recent orders */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Orders</CardTitle>
							<CardDescription>Latest transactions</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Order</TableHead>
										<TableHead>Customer</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{orders.map((o) => (
										<TableRow key={o.id}>
											<TableCell className="font-medium">{o.id}</TableCell>
											<TableCell>{o.customer}</TableCell>
											<TableCell>{o.amount}</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Dot
														variant={
															o.status === "Completed"
																? "positive"
																: o.status === "Processing"
																	? "pending"
																	: "negative"
														}
													/>
													{o.status}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</PageContent>
		</PageWrapper>
	)
}
```

---

## 4. Empty State Page

A page that shows when no data exists yet.

```tsx
import {
	PageWrapper,
	PageContent,
	PageHeader,
	PageHeaderContent,
	PageHeaderTitle,
} from "@/components/vui/layout/page-layout"
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/vui/empty"
import { Button } from "@/components/vui/button"
import { FolderOpenIcon, PlusIcon } from "lucide-react"

export default function ProjectsEmptyPage() {
	return (
		<PageWrapper variant="focused">
			<PageHeader>
				<PageHeaderContent>
					<PageHeaderTitle>Projects</PageHeaderTitle>
				</PageHeaderContent>
			</PageHeader>
			<PageContent>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<FolderOpenIcon className="size-10 text-muted-foreground" />
						</EmptyMedia>
						<EmptyTitle>No projects yet</EmptyTitle>
						<EmptyDescription>
							Create your first project to start organizing your work
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button>
							<PlusIcon data-icon="inline-start" /> Create project
						</Button>
					</EmptyContent>
				</Empty>
			</PageContent>
		</PageWrapper>
	)
}
```

---

## 5. Detail Page with Back Navigation

A detail/edit page for a single record.

```tsx
"use client"

import {
	PageWrapper,
	PageContent,
	PageHeader,
	PageHeaderContent,
	PageHeaderTitle,
	PageHeaderDescription,
	PageHeaderBack,
	PageHeaderActions,
} from "@/components/vui/layout/page-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/vui/card"
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldDescription,
} from "@/components/vui/field"
import { Input } from "@/components/vui/input"
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/vui/select"
import { Button } from "@/components/vui/button"
import {
	ButtonGroup,
	ButtonGroupSeparator,
} from "@/components/vui/button-group"
import { Badge } from "@/components/vui/badge"
import {
	ActionaryModal,
	ActionaryModalTrigger,
	ActionaryModalContent,
	ActionaryModalHeader,
	ActionaryModalFooter,
	ActionaryModalTitle,
	ActionaryModalDescription,
	ActionaryModalClose,
} from "@/components/vui/actionary-modal"

export default function MemberDetailPage() {
	return (
		<PageWrapper variant="slim">
			<PageHeader>
				<PageHeaderBack />
				<PageHeaderContent>
					<PageHeaderTitle>Amara Osei</PageHeaderTitle>
					<PageHeaderDescription>Member since Jan 2025</PageHeaderDescription>
				</PageHeaderContent>
				<PageHeaderActions>
					<Badge variant="secondary">Admin</Badge>
				</PageHeaderActions>
			</PageHeader>
			<PageContent>
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Personal Information</CardTitle>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="name">Full name</FieldLabel>
									<Input id="name" defaultValue="Amara Osei" />
								</Field>
								<Field>
									<FieldLabel htmlFor="email">Email</FieldLabel>
									<Input
										id="email"
										type="email"
										defaultValue="amara@example.com"
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="role">Role</FieldLabel>
									<Select defaultValue="admin">
										<SelectTrigger id="role">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="editor">Editor</SelectItem>
											<SelectItem value="viewer">Viewer</SelectItem>
										</SelectContent>
									</Select>
									<FieldDescription>
										Determines what this member can access
									</FieldDescription>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					<div className="flex justify-between">
						<ActionaryModal>
							<ActionaryModalTrigger asChild>
								<Button variant="destructive">Remove member</Button>
							</ActionaryModalTrigger>
							<ActionaryModalContent>
								<ActionaryModalHeader>
									<ActionaryModalTitle>Remove Amara Osei?</ActionaryModalTitle>
									<ActionaryModalDescription>
										They will lose access to all projects immediately.
									</ActionaryModalDescription>
								</ActionaryModalHeader>
								<ActionaryModalFooter>
									<ActionaryModalClose asChild>
										<Button variant="outline">Cancel</Button>
									</ActionaryModalClose>
									<Button variant="destructive">Remove</Button>
								</ActionaryModalFooter>
							</ActionaryModalContent>
						</ActionaryModal>

						<ButtonGroup>
							<Button variant="outline">Cancel</Button>
							<Button>Save changes</Button>
						</ButtonGroup>
					</div>
				</div>
			</PageContent>
		</PageWrapper>
	)
}
```
