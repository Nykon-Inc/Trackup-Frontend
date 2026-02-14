
"use client"

import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroupLabel,
    useSidebar,
} from "@/components/ui/sidebar"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { LayoutDashboard, Folder, Users, Settings, ChevronsUpDown, User, LogOut, DollarSign, ClipboardCheck, ClipboardList } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import clsx from "clsx"
import { OrgSwitcher } from "./org-switcher"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAuthStore } from "@/stores/auth.store"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { activeOrgId } = useWorkspace()
    const { account } = useAuthStore()
    const router = useRouter()
    const { state } = useSidebar()
    const pathname = usePathname()
    const [profileOpen, setProfileOpen] = React.useState(false)

    const menuItems = [
        {
            title: "Dashboard",
            url: `/dashboard/${activeOrgId}`,
            icon: LayoutDashboard,
            exact: true,
        },
        {
            title: "Projects",
            url: `/dashboard/${activeOrgId}/projects`,
            icon: Folder,
        },
        {
            title: "Teams",
            url: `/dashboard/${activeOrgId}/teams`,
            icon: Users,
        },
        {
            title: "Insights",
            url: `/dashboard/${activeOrgId}/insights`,
            icon: ClipboardCheck,
        },
        {
            title: "Earnings",
            url: `/dashboard/${activeOrgId}/earnings`,
            icon: DollarSign,
        },
        {
            title: "Reports",
            url: `/dashboard/${activeOrgId}/reports`,
            icon: ClipboardList,
        },
        {
            title: "Settings",
            url: `/dashboard/${activeOrgId}/settings`,
            icon: Settings,
        },
    ]

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className={clsx("h-12 border-b flex items-start justify-center py-0")}>
                <OrgSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarMenu>
                        {menuItems.map((item) => {
                            const isActive = item.exact
                                ? pathname === item.url
                                : pathname?.startsWith(item.url);

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        tooltip={item.title}
                                        size="sm"
                                        className="text-xs h-8 font-medium"
                                    >
                                        <Link href={item.url} className="text-sm text-muted-foreground h-9">
                                            <item.icon className="h-3.5 w-3.5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12 focus-visible:ring-0"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src="" alt={account?.name} />
                                        <AvatarFallback className="rounded-lg">{account?.name?.slice(0, 2)?.toUpperCase() || "CN"}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{account?.name || "User"}</span>
                                        <span className="truncate text-xs">{account?.email || "user@example.com"}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side={state === "collapsed" ? "right" : "top"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src="" alt={account?.name} />
                                            <AvatarFallback className="rounded-lg">{account?.name?.slice(0, 2)?.toUpperCase() || "CN"}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{account?.name || "User"}</span>
                                            <span className="truncate text-xs">{account?.email || "user@example.com"}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/${activeOrgId}/profile`}>
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </Link>
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
