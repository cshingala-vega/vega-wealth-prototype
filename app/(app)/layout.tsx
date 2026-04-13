"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/vui/dropdown-menu"
import { navItems } from "@/lib/nav-config"

// TODO: Replace with your organizations
const organizations = [
  { id: "acme-corp", name: "Acme Corporation", initial: "A" },
  { id: "acme-trust", name: "Acme Family Trust", initial: "A" },
] as const

function LpAppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentOrgId, setCurrentOrgId] = useState<string>(organizations[0].id)
  const currentOrg =
    organizations.find((o) => o.id === currentOrgId) ?? organizations[0]

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-2">
        <SidebarMenu className="flex flex-row items-center gap-2">
          <SidebarMenuItem className="flex-1">
            <SidebarMenuButton className="px-2 hover:bg-transparent" size="lg">
              {/* TODO: Replace with your logo */}
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded text-sm font-bold shadow-sm">
                A
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Acme</span>
                <span className="text-muted-foreground text-xs">
                  Investor Portal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="border px-2">
              <SearchIcon className="size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pb-0">
          <SidebarGroupContent className="px-1.5">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="border border-border bg-background shadow-xs hover:bg-background data-[state=open]:bg-background cursor-pointer rounded">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[10px]! font-semibold">
                          {currentOrg.initial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate text-left text-xs font-medium">
                        {currentOrg.name}
                      </span>
                      <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="rounded!">
                    <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                      Switch organization
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={currentOrgId}
                      onValueChange={setCurrentOrgId}
                    >
                      {organizations.map((org) => (
                        <DropdownMenuRadioItem key={org.id} value={org.id}>
                          {org.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      asChild
                      className="data-[active=true]:bg-foreground/5 data-[active=true]:[&_svg]:text-foreground rounded"
                    >
                      <Link href={item.url}>
                        <item.icon className="text-muted-foreground size-3.5!" />
                        <span className="text-[14px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="cursor-pointer">
                  <Avatar className="size-6">
                    {/* TODO: Replace with user initials */}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      AO
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    {/* TODO: Replace with user name */}
                    <span className="font-medium text-sm">Amara Osei</span>
                  </div>
                  <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <UserIcon />
                  Account settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/login")}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LpAppSidebar />
      <SidebarInset>
        <header className="md:hidden sticky top-0 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
