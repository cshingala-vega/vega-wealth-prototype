# VUI Component API Quick Reference

API reference for VUI-specific components. For standard shadcn components, use `npx shadcn@latest docs <component>`.

---

## Item

**Import:** `@/components/vui/item`
**Exports:** Item, ItemGroup, ItemSeparator, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader, ItemFooter

| Prop    | Component | Values                              |
| ------- | --------- | ----------------------------------- |
| variant | Item      | `"default"`, `"outline"`, `"muted"` |
| size    | Item      | `"default"`, `"sm"`                 |
| asChild | Item      | boolean                             |
| variant | ItemMedia | `"default"`, `"icon"`, `"image"`    |

**Composition:**

```tsx
<ItemGroup>
	<Item variant="outline">
		<ItemMedia variant="icon">
			<UserIcon />
		</ItemMedia>
		<ItemContent>
			<ItemTitle>Title text</ItemTitle>
			<ItemDescription>Supporting text</ItemDescription>
		</ItemContent>
		<ItemActions>
			<Button variant="ghost" size="icon-sm">
				<MoreHorizontalIcon />
			</Button>
		</ItemActions>
	</Item>
	<ItemSeparator />
</ItemGroup>
```

---

## Dot

**Import:** `@/components/vui/dot`
**Exports:** Dot, dotVariants

| Prop    | Values                                                            |
| ------- | ----------------------------------------------------------------- |
| variant | `"default"`, `"positive"`, `"negative"`, `"pending"`, `"neutral"` |
| shape   | `"dot"` (round), `"rounded"`, `"square"`                          |
| size    | `"default"` (size-4), `"sm"` (size-3), `"lg"` (size-5)            |

```tsx
<Dot variant="positive" />          {/* Green dot */}
<Dot variant="negative" shape="square" size="sm" />
```

---

## PageLayout

**Import:** `@/components/vui/layout/page-layout`
**Exports:** PageWrapper, PageContent, PageHeader, PageHeaderContent, PageHeaderTitle, PageHeaderDescription, PageHeaderActions, PageHeaderBack

| Prop    | Component                | Values                                               |
| ------- | ------------------------ | ---------------------------------------------------- |
| variant | PageWrapper, PageContent | `"full"`, `"focused"` (default, max-w-5xl), `"slim"` |
| asChild | PageWrapper, PageContent | boolean                                              |

**Composition:**

```tsx
<PageWrapper variant="focused">
	<PageHeader>
		<PageHeaderBack />
		<PageHeaderContent>
			<PageHeaderTitle>Settings</PageHeaderTitle>
			<PageHeaderDescription>Manage preferences</PageHeaderDescription>
		</PageHeaderContent>
		<PageHeaderActions>
			<Button>Save</Button>
		</PageHeaderActions>
	</PageHeader>
	<PageContent>{/* Body content */}</PageContent>
</PageWrapper>
```

---

## Empty

**Import:** `@/components/vui/empty`
**Exports:** Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent

| Prop    | Component  | Values                |
| ------- | ---------- | --------------------- |
| variant | EmptyMedia | `"default"`, `"icon"` |

**Composition:**

```tsx
<Empty>
	<EmptyHeader>
		<EmptyMedia variant="icon">
			<PackageIcon />
		</EmptyMedia>
		<EmptyTitle>No items</EmptyTitle>
		<EmptyDescription>Items will appear here once created</EmptyDescription>
	</EmptyHeader>
	<EmptyContent>
		<Button>Create item</Button>
	</EmptyContent>
</Empty>
```

---

## Field

**Import:** `@/components/vui/field`
**Exports:** Field, FieldSet, FieldGroup, FieldLegend, FieldLabel, FieldTitle, FieldContent, FieldDescription, FieldSeparator, FieldError

| Prop        | Component   | Values                                                 |
| ----------- | ----------- | ------------------------------------------------------ |
| orientation | Field       | `"vertical"` (default), `"horizontal"`, `"responsive"` |
| variant     | FieldLegend | `"legend"`, `"label"`                                  |
| errors      | FieldError  | `string[]` (auto-deduplicates)                         |

**Composition:**

```tsx
<FieldGroup>
	<Field orientation="vertical">
		<FieldLabel htmlFor="email">Email</FieldLabel>
		<Input id="email" type="email" />
		<FieldDescription>We'll never share your email</FieldDescription>
	</Field>
	<FieldSeparator />
	<Field orientation="horizontal">
		<FieldLabel htmlFor="notify">Notifications</FieldLabel>
		<Switch id="notify" />
	</Field>
</FieldGroup>
```

**Error display:**

```tsx
<Field data-invalid>
	<FieldLabel htmlFor="email">Email</FieldLabel>
	<Input id="email" aria-invalid />
	<FieldError errors={["Email is required", "Email is required"]} />{" "}
	{/* Deduplicates */}
</Field>
```

---

## ActionaryModal

**Import:** `@/components/vui/actionary-modal`
**Exports:** ActionaryModal, ActionaryModalTrigger, ActionaryModalPortal, ActionaryModalClose, ActionaryModalOverlay, ActionaryModalContent, ActionaryModalHeader, ActionaryModalFooter, ActionaryModalTitle, ActionaryModalDescription

| Prop            | Component             | Values                 |
| --------------- | --------------------- | ---------------------- |
| showCloseButton | ActionaryModalContent | boolean (default true) |

**Composition:**

```tsx
<ActionaryModal>
	<ActionaryModalTrigger asChild>
		<Button variant="destructive">Delete account</Button>
	</ActionaryModalTrigger>
	<ActionaryModalContent>
		<ActionaryModalHeader>
			<ActionaryModalTitle>Are you sure?</ActionaryModalTitle>
			<ActionaryModalDescription>
				This will permanently delete your account and all data.
			</ActionaryModalDescription>
		</ActionaryModalHeader>
		<ActionaryModalFooter>
			<ActionaryModalClose asChild>
				<Button variant="outline">Cancel</Button>
			</ActionaryModalClose>
			<Button variant="destructive">Delete</Button>
		</ActionaryModalFooter>
	</ActionaryModalContent>
</ActionaryModal>
```

---

## Topbar

**Import:** `@/components/vui/topbar`
**Exports:** TopbarProvider, Topbar, TopbarTrigger, TopbarInset, TopbarLeft, TopbarCenter, TopbarRight, TopbarContent, TopbarSeparator, TopbarMenu, TopbarMenuList, TopbarMenuItem, TopbarMenuTrigger, TopbarMenuContent, TopbarMenuLink, TopbarMenuViewport, useTopbar

| Prop        | Component      | Values                              |
| ----------- | -------------- | ----------------------------------- |
| variant     | Topbar         | `"sticky"`, `"fixed"`, `"floating"` |
| collapsible | Topbar         | `"offcanvas"`, `"none"`             |
| defaultOpen | TopbarProvider | boolean                             |

**Constants:** `TOPBAR_HEIGHT = "3.5rem"`, `TOPBAR_HEIGHT_MOBILE = "4rem"`
**Keyboard:** Cmd+T toggles

**Composition:**

```tsx
<TopbarProvider>
	<Topbar variant="sticky">
		<TopbarLeft>
			<TopbarTrigger />
			<span className="font-semibold">Brand</span>
		</TopbarLeft>
		<TopbarCenter>
			<TopbarMenu>
				<TopbarMenuList>
					<TopbarMenuItem>
						<TopbarMenuLink href="/dashboard">Dashboard</TopbarMenuLink>
					</TopbarMenuItem>
				</TopbarMenuList>
			</TopbarMenu>
		</TopbarCenter>
		<TopbarRight>
			<TopbarContent>
				<Avatar>
					<AvatarFallback>KT</AvatarFallback>
				</Avatar>
			</TopbarContent>
		</TopbarRight>
	</Topbar>
	<TopbarInset>{/* Page content */}</TopbarInset>
</TopbarProvider>
```

---

## Sidebar

**Import:** `@/components/vui/sidebar`
**Key exports:** SidebarProvider, Sidebar, SidebarTrigger, SidebarRail, SidebarInset, SidebarHeader, SidebarFooter, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar

| Prop        | Component         | Values                               |
| ----------- | ----------------- | ------------------------------------ |
| side        | Sidebar           | `"left"`, `"right"`                  |
| variant     | Sidebar           | `"sidebar"`, `"floating"`, `"inset"` |
| collapsible | Sidebar           | `"offcanvas"`, `"icon"`, `"none"`    |
| variant     | SidebarMenuButton | `"default"`, `"outline"`             |
| size        | SidebarMenuButton | `"default"`, `"sm"`, `"lg"`          |
| isActive    | SidebarMenuButton | boolean                              |
| tooltip     | SidebarMenuButton | string or TooltipContent props       |

**Constants:** `SIDEBAR_WIDTH = "16rem"`, `SIDEBAR_WIDTH_ICON = "3rem"`, `SIDEBAR_WIDTH_MOBILE = "18rem"`
**Keyboard:** Cmd+B toggles

---

## Heading

**Import:** `@/components/vui/heading`
**Default export:** Heading

| Prop | Values                                                      |
| ---- | ----------------------------------------------------------- |
| as   | `"h1"` (default), `"h2"`, `"h3"`, `"h4"`, `"h5"`, `"h6"`    |
| size | `"sm"`, `"md"`, `"lg"`, `"xl"` (overrides semantic default) |

```tsx
<Heading as="h2" size="lg">
	Section Title
</Heading>
```

---

## ButtonGroup

**Import:** `@/components/vui/button-group`
**Exports:** ButtonGroup, ButtonGroupText, ButtonGroupSeparator, buttonGroupVariants

| Prop        | Component   | Values                                 |
| ----------- | ----------- | -------------------------------------- |
| orientation | ButtonGroup | `"horizontal"` (default), `"vertical"` |

```tsx
<ButtonGroup>
	<Button variant="outline">Edit</Button>
	<ButtonGroupSeparator />
	<Button variant="outline">Delete</Button>
</ButtonGroup>
```

---

## Grid

**Import:** `@/components/vui/layout/grid`
**Exports:** Grid, GridItem

| Prop | Component | Values                         |
| ---- | --------- | ------------------------------ |
| gap  | Grid      | `"sm"`, `"md"`, `"lg"`, `"xl"` |

Responsive: 1 col → 3 cols (md) → 5 cols (lg)

```tsx
<Grid gap="md">
	<GridItem>Content</GridItem>
	<GridItem>Content</GridItem>
</Grid>
```

---

## ScrollFade

**Import:** `@/components/vui/scroll-fade`
**Exports:** ScrollFade, scrollFadeVariants

| Prop | Values                                   |
| ---- | ---------------------------------------- |
| side | `"top"`, `"bottom"`, `"left"`, `"right"` |
| size | `"sm"`, `"default"`, `"lg"`              |

```tsx
<div className="relative overflow-auto">
	<ScrollFade side="bottom" />
	{/* Scrollable content */}
</div>
```

---

## Kbd

**Import:** `@/components/vui/kbd`
**Exports:** Kbd, KbdGroup

```tsx
<KbdGroup>
	<Kbd>Cmd</Kbd>
	<Kbd>K</Kbd>
</KbdGroup>
```
