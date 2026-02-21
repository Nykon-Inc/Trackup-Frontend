"use client"

import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation"
import { useGetProject, useGetProjectStats } from "@/services/projects.services"
import { Users, Settings, ArrowLeft, Download } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/page-header"
import clsx from "clsx"
import Staff from "./staff/Staff"
import { Button } from "@/components/ui/button"
import { AddStaffMember } from "../../teams/add-staff-member-dialog"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { MetricCard } from "@/components/dashboard/metric-card"

export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const id = params?.id as string
    const orgId = params?.orgId as string
    const { activeOrgId } = useWorkspace();

    const currentTab = searchParams.get("tab") || "staff"

    const { data: project, isLoading } = useGetProject({ organizationId: activeOrgId || "", projectId: id })
    const { data: projectStats } = useGetProjectStats({ organizationId: activeOrgId || orgId || "", projectId: id })

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("tab", value)
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleBackToProjects = () => {
        const targetOrgId = activeOrgId || orgId;
        router.push(targetOrgId ? `/dashboard/${targetOrgId}/projects` : "/dashboard/projects")
    }

    if (isLoading) {
        return (
            <div className="flex flex-col h-full space-y-4">
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

                <div className="px-6">
                    <div className="pt-4 mb-6">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-28" />

                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-32 rounded-md" />
                                <Skeleton className="h-9 w-44 rounded-md" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Skeleton className="h-7 w-64" />
                            <Skeleton className="h-4 w-96 mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-[92px] w-full rounded-md" />
                        <Skeleton className="h-[92px] w-full rounded-md" />
                        <Skeleton className="h-[92px] w-full rounded-md" />
                    </div>

                    <div className="mt-6">
                        <div className="px-0">
                            <div className="flex gap-2 h-12 px-2 items-center">
                                <Skeleton className="h-8 w-28" />
                                <Skeleton className="h-8 w-28" />
                            </div>
                        </div>
                        <div className="px-4 py-2 space-y-4">
                            <Skeleton className="h-32 w-full rounded-lg" />
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!project) {
        return <div className="p-8">Project not found</div>
    }

    const assignedStaff = projectStats?.membersAssigned ?? project.membersCount ?? 0
    const totalHoursWorked = projectStats?.totalHoursWorked ?? project.totalHours ?? 0
    const estimatedPayroll = projectStats?.totalPayment ?? project.totalSpent ?? 0

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
        <div className="flex flex-col h-full space-y-4">
            <PageHeader
                title={project.name || "Project"}
                breadcrumbs={[
                    { label: "Dashboard", href: orgId ? `/dashboard/${orgId}` : "/dashboard", active: false },
                    { label: "Projects", href: orgId ? `/dashboard/${orgId}/projects` : "/dashboard/projects", active: false },
                    { label: project.name, href: orgId ? `/dashboard/${orgId}/projects/${project.id}` : `/dashboard/projects/${project.id}`, active: true },
                ]}
            />
            <div className="px-6">
                <div className="pt-1 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="mt-4">
                            <h2 className="text-2xl font-semibold tracking-tight">{project.name || "Project"}</h2>
                            <p className="text-sm text-muted-foreground">Internal dashboard for business intelligence and reporting</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <AddStaffMember projectId={project.id} organizationId={activeOrgId || orgId} />
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export Project Report
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        title="Assigned Staff"
                        value={assignedStaff.toString()}
                    />
                    <MetricCard
                        title="Total Hours Worked"
                        value={`${Number(totalHoursWorked).toFixed(1)}h`}
                    />
                    <MetricCard
                        title="Estimated Payroll"
                        value={`$${Number(estimatedPayroll).toLocaleString()}`}
                    />
                </div>

                <div>
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out py-2">
                        <Staff project={project} />
                    </div>
                </div>
            </div>
        </div>
    )
}
