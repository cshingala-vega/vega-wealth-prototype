# VUI Registry Component Index

Components are installed via the shadcn CLI and imported as `@/components/vui/[name]`.
Install missing components: `npx shadcn@latest add https://cn.vui.run/r/[name]`

## VUI-Only Components

These components are unique to VUI and not in upstream shadcn.

### Dot
**File:** `dot.tsx` | **CSS vars:** yes
**Variants:** variant: default, positive, negative, pending, neutral | shape: dot, rounded, square | size: default, sm, lg
```tsx
<Dot variant="positive" />
<Dot variant="negative" shape="square" size="sm" />
```

### Item
**File:** `item.tsx` | **CSS vars:** no
**Exports:** Item, ItemGroup, ItemSeparator, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader, ItemFooter
**Variants:** Item variant: default, outline, muted | Item size: default, sm | ItemMedia variant: default, icon, image
```tsx
<Item>
  <ItemMedia variant="icon"><UserIcon /></ItemMedia>
  <ItemContent>
    <ItemTitle>Amara Osei</ItemTitle>
    <ItemDescription>Product Manager</ItemDescription>
  </ItemContent>
  <ItemActions><Button variant="ghost" size="icon-sm"><MoreHorizontalIcon /></Button></ItemActions>
</Item>
```

### Empty
**File:** `empty.tsx` | **CSS vars:** no
**Exports:** Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent
**Variants:** EmptyMedia variant: default, icon
```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><InboxIcon /></EmptyMedia>
    <EmptyTitle>No messages</EmptyTitle>
    <EmptyDescription>New messages will appear here</EmptyDescription>
  </EmptyHeader>
  <EmptyContent><Button>Compose</Button></EmptyContent>
</Empty>
```

### Heading
**File:** `heading.tsx` | **CSS vars:** no
**Props:** as: h1-h6 (default h1) | size: sm, md, lg, xl
```tsx
<Heading as="h2" size="lg">Dashboard</Heading>
```

### ButtonGroup
**File:** `button-group.tsx` | **CSS vars:** yes
**Exports:** ButtonGroup, ButtonGroupText, ButtonGroupSeparator
**Variants:** orientation: horizontal, vertical
```tsx
<ButtonGroup>
  <Button variant="outline">Save</Button>
  <ButtonGroupSeparator />
  <Button variant="outline">Cancel</Button>
</ButtonGroup>
```

### Field
**File:** `field.tsx` | **CSS vars:** no
**Exports:** Field, FieldSet, FieldGroup, FieldLegend, FieldLabel, FieldTitle, FieldContent, FieldDescription, FieldSeparator, FieldError
**Variants:** Field orientation: vertical, horizontal, responsive | FieldLegend variant: legend, label
```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="name">Full name</FieldLabel>
    <Input id="name" />
    <FieldDescription>As it appears on your ID</FieldDescription>
  </Field>
</FieldGroup>
```

### ActionaryModal
**File:** `actionary-modal.tsx` | **CSS vars:** no
**Exports:** ActionaryModal, ActionaryModalTrigger, ActionaryModalPortal, ActionaryModalClose, ActionaryModalOverlay, ActionaryModalContent, ActionaryModalHeader, ActionaryModalFooter, ActionaryModalTitle, ActionaryModalDescription
```tsx
<ActionaryModal>
  <ActionaryModalTrigger asChild><Button variant="destructive">Delete</Button></ActionaryModalTrigger>
  <ActionaryModalContent>
    <ActionaryModalHeader>
      <ActionaryModalTitle>Delete project?</ActionaryModalTitle>
      <ActionaryModalDescription>This action cannot be undone.</ActionaryModalDescription>
    </ActionaryModalHeader>
    <ActionaryModalFooter>
      <ActionaryModalClose asChild><Button variant="outline">Cancel</Button></ActionaryModalClose>
      <Button variant="destructive">Delete</Button>
    </ActionaryModalFooter>
  </ActionaryModalContent>
</ActionaryModal>
```

### ScrollFade
**File:** `scroll-fade.tsx` | **CSS vars:** no
**Variants:** side: top, bottom, left, right | size: sm, default, lg
```tsx
<ScrollFade side="bottom" size="lg" />
```

### Kbd
**File:** `kbd.tsx` | **CSS vars:** no
**Exports:** Kbd, KbdGroup
```tsx
<KbdGroup><Kbd>Cmd</Kbd><Kbd>K</Kbd></KbdGroup>
```

### Reorderable
**File:** `reorderable/` (directory, 3 files) | **CSS vars:** yes
Drag-and-drop reorder utility components.

### EmailComposer
**File:** `email-composer/` (directory) | **CSS vars:** no
Multi-part email composition UI components.

---

## Layout Components

### PageLayout
**File:** `layout/page-layout.tsx` | **CSS vars:** yes
**Exports:** PageWrapper, PageContent, PageHeader, PageHeaderContent, PageHeaderTitle, PageHeaderDescription, PageHeaderActions, PageHeaderBack
**Variants:** PageWrapper/PageContent variant: full, focused (default, max-w-5xl), slim
```tsx
<PageWrapper variant="focused">
  <PageHeader>
    <PageHeaderContent>
      <PageHeaderTitle>Settings</PageHeaderTitle>
      <PageHeaderDescription>Manage your account preferences</PageHeaderDescription>
    </PageHeaderContent>
    <PageHeaderActions><Button>Save changes</Button></PageHeaderActions>
  </PageHeader>
  <PageContent>{/* page body */}</PageContent>
</PageWrapper>
```

### Grid
**File:** `layout/grid.tsx` | **CSS vars:** yes
**Exports:** Grid, GridItem
**Variants:** Grid gap: sm, md, lg, xl
**Responsive:** 1 col mobile → 3 cols tablet → 5 cols desktop
```tsx
<Grid gap="md">
  <GridItem>Item 1</GridItem>
  <GridItem>Item 2</GridItem>
</Grid>
```

---

## Navigation Components

### Sidebar
**File:** `sidebar.tsx` (2 files) | **CSS vars:** yes
**Exports:** SidebarProvider, Sidebar, SidebarTrigger, SidebarRail, SidebarInset, SidebarInput, SidebarHeader, SidebarFooter, SidebarContent, SidebarSeparator, SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar
**Variants:** Sidebar: side (left/right), variant (sidebar/floating/inset), collapsible (offcanvas/icon/none) | SidebarMenuButton: variant (default/outline), size (default/sm/lg)
**Constants:** SIDEBAR_WIDTH=16rem, SIDEBAR_WIDTH_ICON=3rem, SIDEBAR_WIDTH_MOBILE=18rem
**Keyboard:** Cmd+B to toggle

### Topbar
**File:** `topbar.tsx` | **CSS vars:** yes
**Exports:** TopbarProvider, Topbar, TopbarTrigger, TopbarInset, TopbarLeft, TopbarCenter, TopbarRight, TopbarContent, TopbarSeparator, TopbarMenu, TopbarMenuList, TopbarMenuItem, TopbarMenuTrigger, TopbarMenuContent, TopbarMenuLink, TopbarMenuViewport, useTopbar
**Variants:** Topbar: variant (sticky/fixed/floating), collapsible (offcanvas/none)
**Constants:** TOPBAR_HEIGHT=3.5rem, TOPBAR_HEIGHT_MOBILE=4rem
**Keyboard:** Cmd+T to toggle

---

## Shadcn Components (VUI-themed)

All standard shadcn components are available with VUI CSS variable theming. Import from `@/components/vui/[name]`.

| Component | File | Key exports | CSS vars |
|---|---|---|---|
| Accordion | accordion.tsx | Accordion, AccordionItem, AccordionTrigger, AccordionContent | yes |
| Alert | alert.tsx | Alert, AlertTitle, AlertDescription | yes |
| AlertDialog | alert-dialog.tsx | AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel | yes |
| AspectRatio | aspect-ratio.tsx | AspectRatio | yes |
| Avatar | avatar.tsx | Avatar, AvatarImage, AvatarFallback | yes |
| Badge | badge.tsx | Badge, badgeVariants | yes |
| Breadcrumb | breadcrumb.tsx | Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis | yes |
| Button | button.tsx | Button, buttonVariants | yes |
| Calendar | calendar.tsx | Calendar | yes |
| Card | card.tsx | Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter | yes |
| Carousel | carousel.tsx | Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext | yes |
| Chart | chart.tsx | ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent | yes |
| Checkbox | checkbox.tsx | Checkbox | yes |
| Collapsible | collapsible.tsx | Collapsible, CollapsibleTrigger, CollapsibleContent | yes |
| Command | command.tsx | Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator | yes |
| ContextMenu | context-menu.tsx | ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup | yes |
| Dialog | dialog.tsx | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose | yes |
| Drawer | drawer.tsx | Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose | yes |
| DropdownMenu | dropdown-menu.tsx | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup | yes |
| Form | form.tsx | Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField | yes |
| HoverCard | hover-card.tsx | HoverCard, HoverCardTrigger, HoverCardContent | yes |
| Input | input.tsx | Input | yes |
| InputGroup | input-group.tsx | InputGroup, InputGroupInput, InputGroupTextarea, InputGroupAddon | yes |
| InputOTP | input-otp.tsx | InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator | yes |
| Label | label.tsx | Label | yes |
| Menubar | menubar.tsx | Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarGroup, MenubarShortcut | yes |
| NavigationMenu | navigation-menu.tsx | NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport | yes |
| NumberField | number-field.tsx | NumberField | yes |
| Pagination | pagination.tsx | Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis | yes |
| Popover | popover.tsx | Popover, PopoverTrigger, PopoverContent, PopoverAnchor | yes |
| Progress | progress.tsx | Progress | yes |
| RadioGroup | radio-group.tsx | RadioGroup, RadioGroupItem | yes |
| Resizable | resizable.tsx | ResizablePanelGroup, ResizablePanel, ResizableHandle | yes |
| ScrollArea | scroll-area.tsx | ScrollArea, ScrollBar | yes |
| Select | select.tsx | Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton | yes |
| Separator | separator.tsx | Separator | yes |
| Sheet | sheet.tsx | Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose | yes |
| Skeleton | skeleton.tsx | Skeleton | yes |
| Slider | slider.tsx | Slider | yes |
| Sonner | sonner.tsx | Toaster (+ toast() from sonner) | yes |
| Spinner | spinner.tsx | Spinner | yes |
| Switch | switch.tsx | Switch | yes |
| Table | table.tsx | Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption | yes |
| Tabs | tabs.tsx | Tabs, TabsList, TabsTrigger, TabsContent | yes |
| Textarea | textarea.tsx | Textarea | yes |
| Toggle | toggle.tsx | Toggle, toggleVariants | yes |
| ToggleGroup | toggle-group.tsx | ToggleGroup, ToggleGroupItem | yes |
| Tooltip | tooltip.tsx | Tooltip, TooltipTrigger, TooltipContent, TooltipProvider | yes |

---

## Utility Components

| Component | File | Purpose |
|---|---|---|
| CommandEnter | `utils/command-enter.tsx` | Keyboard shortcut for Cmd+Enter submission |
