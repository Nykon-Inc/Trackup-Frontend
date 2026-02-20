"use client"

import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation"
import { useGetProject } from "@/services/projects.services"
import { Users, Clock, UserCheck, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/page-header"
import clsx from "clsx"
import Staff from "./staff/Staff"
import { Button } from "@/components/ui/button"
import { AddStaffMember } from "../../teams/add-staff-member-dialog"
import { useWorkspace } from "@/components/providers/workspace-provider"

export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const id = params?.id as string
    const { activeOrgId } = useWorkspace();

    const currentTab = searchParams.get("tab") || "staff"

    const { data: project, isLoading } = useGetProject({ organizationId: activeOrgId || "", projectId: id })

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("tab", value)
        router.push(`${pathname}?${params.toString()}`)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <div className="h-4 w-px bg-border mx-2" />
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                </div>
                <div className="px-0">
                    <div className="w-full h-16 border-b bg-card flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-5 w-8" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-5 w-8" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-5 w-12" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    </div>
                    <div className="px-0">
                        <div className="flex gap-2 h-12 px-2 items-center">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                    <div className="px-4 py-2 space-y-4">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-64 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }

    if (!project) {
        return <div className="p-8">Project not found</div>
    }

    const tabItems = [
        {
            value: "staff",
            label: "Staff members",
            icon: Users
        },
        {
            value: "configurations",
            label: "Configurations",
            icon: Settings
        },
    ]

    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title={project.name || "Project"}
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard", active: false },
                    { label: "Projects", href: "/dashboard/projects", active: false },
                    { label: project.name, href: `/dashboard/projects/${project.id}`, active: true },
                ]}
                rightElement={<div>
                    <AddStaffMember projectId={project.id} />
                </div>}
            />
            <div className="px-0">
                <div className="w-full h-16 border-b bg-card flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-lg font-bold">{project.membersCount}</h3>
                            <p className="text-xs text-muted-foreground">Total Staff</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-lg font-bold">{project.managerCount}</h3>
                            <p className="text-xs text-muted-foreground">Managers</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-lg font-bold">{project.staffCount}</h3>
                            <p className="text-xs text-muted-foreground">Staff</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-lg font-bold">1,234h</h3>
                            <p className="text-xs text-muted-foreground">Hours Logged</p>
                        </div>
                    </div>
                </div>

                <div>
                    {/* tabs definitions */}
                    <div className="px-0">
                        <div className="flex gap-2 h-12  items-center">
                        </div>
                    </div>

                    <div key={currentTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out py-2">
                        <Staff project={project} />
                    </div>
                </div>
            </div>
        </div>
    )
}
