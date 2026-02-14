
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
import { LayoutDashboard, Folder, ChevronsUpDown, LogOut, User, Building2, ShieldCheck, History, Activity, Flag, ScrollText, BookOpen, LifeBuoy, Users } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Logo } from "../ui/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/auth.store"

import { SidebarMenuGroup } from "@/interfaces/sidebar-menu"
import { ProfileModal } from "@/components/profile/profile-modal"
import Link from "next/link"

export function InternalSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const router = useRouter()
    const pathname = usePathname()
    const { state } = useSidebar()
    const { account } = useAuthStore()
    const [profileOpen, setProfileOpen] = React.useState(false)



    const sidebarMenuGroups: SidebarMenuGroup[] = [
        {
            label: "",
            items: [
                {
                    title: "Dashboard",
                    url: `/internal`,
                    icon: LayoutDashboard,
                    exact: true,
                },
            ]
        },
        {
            label: "Operations",
            items: [
                {
                    title: "Projects",
                    url: `/internal/projects`,
                    icon: Folder,
                },
                {
                    title: "Organizations",
                    url: `/internal/organizations`,
                    icon: Building2,
                },
                {
                    title: "Support",
                    url: `/internal/support`,
                    icon: LifeBuoy,
                }
            ]
        },
        {
            label: "Governance",
            items: [
                {
                    title: "Teams",
                    url: `/internal/teams`,
                    icon: Users,
                },
                {
                    title: "Roles & Permissions",
                    url: `/internal/roles-and-permissions`,
                    icon: ShieldCheck,
                },
                {
                    title: "Audit trail",
                    url: `/internal/audit-trail`,
                    icon: History,
                }
            ]
        },
        {
            label: "Engineering",
            items: [
                {
                    title: "System Health",
                    url: `/internal/system-health`,
                    icon: Activity,
                },
                {
                    title: "Feature flags",
                    url: `/internal/feature-flags`,
                    icon: Flag,
                },
                {
                    title: "Change Logs",
                    url: `/internal/change-logs`,
                    icon: ScrollText,
                },
                {
                    title: "API Documentation",
                    url: `/internal/api-documentation`,
                    icon: BookOpen,
                }
            ]
        }
    ]

    return (
        <>
            <Sidebar collapsible="icon" {...props} className="gap-0 border-r bg-muted/5">
                <SidebarHeader className="h-12 border-b flex items-center justify-center px-4 py-0">
                    <div className="flex items-center gap-2">
                        <Logo size={state === "collapsed" ? "sm" : "sm"} iconOnly={state === "collapsed"} />
                    </div>
                </SidebarHeader>
                <SidebarContent className="pt-2">
                    {sidebarMenuGroups.map((group) => {
                        return <SidebarGroup key={group.label} className="py-0">
                            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50 px-2 mb-1">{group.label}</SidebarGroupLabel>
                            <SidebarMenu className="gap-1">
                                {group.items.map((item) => {
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
                                                <Link href={item.url}>
                                                    <item.icon className="h-3.5 w-3.5" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroup>
                    })}
                </SidebarContent>
                <SidebarFooter className="border-t">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12"
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
                                        <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/logout")}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
        </>
    )
}
