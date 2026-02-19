
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
} from "@/components/ui/sidebar"
import { OrgSwitcher } from "./org-switcher"
import { ProjectSwitcher } from "./project-switcher"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { LayoutDashboard, Folder, Users, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { activeOrgId } = useWorkspace()
    const router = useRouter()
    const pathname = usePathname()

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
            title: "Team",
            url: `/dashboard/${activeOrgId}/users`,
            icon: Users,
        },
        {
            title: "Settings",
            url: `/dashboard/${activeOrgId}/settings`,
            icon: Settings,
        },
    ]

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <OrgSwitcher />
                {/* <ProjectSwitcher /> */}
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
                                    >
                                        <button onClick={() => router.push(item.url)}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {/* Ad Space or User Profile could go here */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
