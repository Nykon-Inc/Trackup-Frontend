
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
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { LayoutDashboard, Folder, Users, Settings, ChevronsUpDown, User, LogOut, DollarSign, ClipboardCheck, ClipboardList, Palmtree, ChevronRight, Activity, Clock } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import clsx from "clsx"
import { OrgSwitcher } from "./org-switcher"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAuthStore } from "@/stores/auth.store"
import Link from "next/link"

interface MenuItem {
    title: string
    url: string
    icon: any
    exact?: boolean
    items?: {
        title: string
        url: string
    }[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { activeOrgId, activeOrg } = useWorkspace()
    const { account } = useAuthStore()
    const router = useRouter()
    const { state } = useSidebar()
    const pathname = usePathname()
    const [profileOpen, setProfileOpen] = React.useState(false)
    const activeMenuItems = React.useMemo<MenuItem[]>(() => {
        const isMember = activeOrg?.role === "member"

        const items: MenuItem[] = [
            {
                title: "Dashboard",
                url: `/dashboard/${activeOrgId}`,
                icon: LayoutDashboard,
                exact: true,
            },
            {
                title: "Timesheets",
                url: `/dashboard/${activeOrgId}/timesheets`,
                icon: Clock,
                items: isMember ? [
                    {
                        title: "View & edit",
                        url: `/dashboard/${activeOrgId}/timesheets/view-edit`,
                    },
                    {
                        title: "Approvals",
                        url: `/dashboard/${activeOrgId}/timesheets/approvals`,
                    }
                ] : [
                    {
                        title: "Approvals",
                        url: `/dashboard/${activeOrgId}/timesheets/owner`,
                    }
                ],
            },
            ...(isMember ? [] : [{
                title: "Projects",
                url: `/dashboard/${activeOrgId}/projects`,
                icon: Folder,
                items: [],
            }]),
            ...(isMember ? [] : [{
                title: "Team Members",
                url: `/dashboard/${activeOrgId}/teams`,
                icon: Users,
                items: [],
            }]),
            {
                title: "Activity",
                url: `/dashboard/${activeOrgId}/activity`,
                icon: Activity,
                items: [
                    {
                        title: "Activity",
                        url: `/dashboard/${activeOrgId}/activity`,
                    },
                    {
                        title: "Screenshots",
                        url: `/dashboard/${activeOrgId}/screenshots`,
                    },
                    {
                        title: "Apps & URLs",
                        url: `/dashboard/${activeOrgId}/apps-urls`,
                    },
                ],
            },
            {
                title: "Insights",
                url: `/dashboard/${activeOrgId}/insights`,
                icon: ClipboardCheck,
            },
            {
                title: isMember ? "Earnings" : "Financials",
                url: `/dashboard/${activeOrgId}/${isMember ? "earnings" : "financials"}`,
                icon: DollarSign,
                items: isMember ? [
                    {
                        title: "Time Reports",
                        url: `/dashboard/${activeOrgId}/reports/time`,
                    },
                    {
                        title: "Activity Reports",
                        url: `/dashboard/${activeOrgId}/reports/activity`,
                    },
                ] : [
                    {
                        title: "Manage Payroll",
                        url: `/dashboard/${activeOrgId}/financials/payroll`,
                    },
                    {
                        title: "Create Payments",
                        url: `/dashboard/${activeOrgId}/financials/payments`,
                    },
                    {
                        title: "Past Payments",
                        url: `/dashboard/${activeOrgId}/financials/past-payments`,
                    },
                ],
            },
            {
                title: "Reports",
                url: `/dashboard/${activeOrgId}/reports`,
                icon: ClipboardList,
                items: isMember ? [
                    {
                        title: "Time & Activity",
                        url: `/dashboard/${activeOrgId}/reports/time`,
                    },
                    {
                        title: "Manual Time Edits",
                        url: `/dashboard/${activeOrgId}/reports/manual-edits`,
                    },
                ] : [
                    {
                        title: "Time & Activity Reports",
                        url: `/dashboard/${activeOrgId}/reports/time`,
                    },
                    {
                        title: "Audit Logs",
                        url: `/dashboard/${activeOrgId}/reports/audit`,
                    },
                    {
                        title: "Manual Time Edits",
                        url: `/dashboard/${activeOrgId}/reports/manual-edits`,
                    },
                ],
            },
            {
                title: "Paid Time Off",
                url: `/dashboard/${activeOrgId}/pto`,
                icon: Palmtree,
            },
        ]

        if (!isMember) {
            items.push({
                title: "Settings",
                url: `/dashboard/${activeOrgId}/settings`,
                icon: Settings,
            })
        }

        return items
    }, [activeOrgId, activeOrg?.role])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className={clsx("h-12 border-b flex items-start justify-center py-0")}>
                <OrgSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarMenu>
                        {activeMenuItems.map((item) => {
                            const isActive = item.exact
                                ? pathname === item.url
                                : pathname?.startsWith(item.url);

                            if (!item.items || item.items.length === 0) {
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
                            }

                            return (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    defaultOpen={isActive}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                size="sm"
                                                isActive={isActive}
                                                className="text-xs h-9 text-muted-foreground"
                                            >
                                                {item.icon && <item.icon className="h-3.5 w-3.5" />}
                                                <span>{item.title}</span>
                                                <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton className="text-xs" asChild isActive={pathname === subItem.url}>
                                                            <Link href={subItem.url} className="text-sm text-muted-foreground">
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
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
