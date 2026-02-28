"use client"

import React, { useMemo, useState } from "react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQueries } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"
import { endOfDay, startOfDay, subDays } from "date-fns"
import { toast } from "sonner"
import http from "@/services/base"
import { routes } from "@/services/routes"
import { PageHeader } from "@/components/page-header"
import { StaffProfileHero } from "@/components/projects/staff-profile/staff-profile-hero"
import { StaffProfileSkeleton } from "@/components/projects/staff-profile/staff-profile-skeleton"
import { OverviewTab } from "@/components/projects/staff-profile/tabs/overview-tab"
import { InsightsTab } from "@/components/projects/staff-profile/tabs/insights-tab"
import { WorkLimitsTab } from "@/components/projects/staff-profile/tabs/work-limits-tab"
import { EditStaffInfoModal } from "@/components/projects/staff-profile/modals/edit-staff-info-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { SelectControlled } from "@/components/ui/select-controlled"
import { CustomTabs } from "@/components/custom-tabs"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { useGetOrganizationMember } from "@/services/organization.services"
import { useAssignProjectMember, useGetProjects, useUnassignProjectMember, useUpdateProjectMemberProfile } from "@/services/projects.services"
import { IStaffHourlyInsight } from "@/interfaces/ai.interfaces"
import { ProjectMemberProfileResponse, ProjectMemberRole, WorkDay } from "@/interfaces/projects.interfaces"

type SubTab = "overview" | "insights" | "work-limits"

type AssignmentLike = {
    id?: string
    projectId?: string
    name?: string
    role?: string
    projectRole?: string
    project?: {
        id?: string
        name?: string
    }
}

const SUB_TABS: { value: SubTab; label: string }[] = [
    { value: "overview", label: "Overview" },
    { value: "insights", label: "Insights" },
    { value: "work-limits", label: "Work Limits" },
]

const ALL_PROJECTS = "all"

export default function TeamStaffProfilePage() {
    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const orgId = params?.orgId as string
    const staffId = params?.id as string
    const { activeOrgId } = useWorkspace()

    const organizationId = activeOrgId || orgId || ""
    const memberId = searchParams.get("memberId") || ""
    const activeSubTab = (searchParams.get("tab") || "overview") as SubTab
    const projectFilter = searchParams.get("projectFilter") || ALL_PROJECTS
    const selectedProjectId = projectFilter === ALL_PROJECTS ? "" : projectFilter

    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    })
    const [projectSearch, setProjectSearch] = useState("")
    const [editInfoOpen, setEditInfoOpen] = useState(false)
    const [assignOpen, setAssignOpen] = useState(false)
    const [assignProjectId, setAssignProjectId] = useState("")
    const [assignRole, setAssignRole] = useState<ProjectMemberRole>(ProjectMemberRole.MEMBER)
    const [removingProjectId, setRemovingProjectId] = useState<string | null>(null)

    const { data: organizationMember, isLoading: isLoadingMember, refetch: refetchOrganizationMember } = useGetOrganizationMember({
        organizationId,
        memberId,
    })

    const { data: projectsData } = useGetProjects({
        organizationId,
        userId: staffId,
        query: {
            limit: 100,
            page: 1,
        },
    })

    const rawAssignments = useMemo(() => {
        const list = organizationMember?.projects || organizationMember?.member?.projects || []
        return Array.isArray(list) ? list : []
    }, [organizationMember])

    const assignments = useMemo(() => {
        return rawAssignments
            .map((item) => {
                const assignment = item as AssignmentLike
                const id = assignment?.id || assignment?.projectId || assignment?.project?.id
                const name = assignment?.name || assignment?.project?.name || "Unnamed Project"
                const role = assignment?.role || assignment?.projectRole || "member"
                return id ? { id: String(id), name: String(name), role: String(role) } : null
            })
            .filter(Boolean) as Array<{ id: string; name: string; role?: string }>
    }, [rawAssignments])

    const projectOptions = useMemo(() => {
        return [{ id: ALL_PROJECTS, name: "All projects" }, ...assignments.map((item) => ({ id: item.id, name: item.name }))]
    }, [assignments])

    const filteredProjectOptions = useMemo(() => {
        const query = projectSearch.trim().toLowerCase()
        if (!query) return projectOptions

        const allOption = projectOptions[0]
        const projectMatches = projectOptions.slice(1).filter((item) => item.name.toLowerCase().includes(query))

        return allOption ? [allOption, ...projectMatches] : projectMatches
    }, [projectOptions, projectSearch])

    const selectedProjectOption = useMemo(() => {
        return projectOptions.find((item) => item.id === projectFilter) || projectOptions[0] || null
    }, [projectOptions, projectFilter])

    const from = date?.from
    const to = date?.to || date?.from
    const startDate = from ? from.toISOString() : ""
    const endDate = to ? to.toISOString() : ""

    const profileQueries = useQueries({
        queries: assignments.map((assignment) => ({
            queryKey: ["team-member-project-profile", organizationId, assignment.id, staffId, startDate, endDate],
            queryFn: async () => {
                const data = await http.get({
                    url: `${routes.organization.index}/${organizationId}/projects/${assignment.id}/members/${staffId}/profile`,
                    query: { startDate, endDate },
                })
                return data as ProjectMemberProfileResponse
            },
            enabled: !!organizationId && !!assignment.id && !!staffId,
        })),
    })

    const insightsQueries = useQueries({
        queries: assignments.map((assignment) => ({
            queryKey: ["team-member-project-insights", assignment.id, staffId, selectedDate.toISOString()],
            queryFn: async () => {
                const data = await http.get({
                    url: routes.ai.staff,
                    query: {
                        projectId: assignment.id,
                        userId: staffId,
                        startDate: startOfDay(selectedDate).toISOString(),
                        endDate: endOfDay(selectedDate).toISOString(),
                    },
                })
                return data as IStaffHourlyInsight[]
            },
            enabled: !!assignment.id && !!staffId,
        })),
    })

    const selectedProfileData = useMemo(() => {
        if (!selectedProjectId) return undefined
        const idx = assignments.findIndex((a) => a.id === selectedProjectId)
        if (idx < 0) return undefined
        return profileQueries[idx]?.data as ProjectMemberProfileResponse | undefined
    }, [assignments, profileQueries, selectedProjectId])

    const allProfileData = useMemo(() => {
        return profileQueries
            .map((query) => query.data as ProjectMemberProfileResponse | undefined)
            .filter(Boolean) as ProjectMemberProfileResponse[]
    }, [profileQueries])

    const aggregatedProfileData = useMemo(() => {
        if (allProfileData.length === 0) return undefined

        const base = allProfileData[0]
        const totalHoursWorked = allProfileData.reduce((sum, item) => sum + (item.rangeMetrics?.totalHoursWorked || 0), 0)
        const totalAmountEarned = allProfileData.reduce((sum, item) => sum + (item.rangeMetrics?.amountEarned || 0), 0)
        const totalWorkedThisWeek = allProfileData.reduce((sum, item) => sum + (item.rangeMetrics?.totalWorkedThisWeek || 0), 0)
        const totalWorkedToday = allProfileData.reduce((sum, item) => sum + (item.rangeMetrics?.totalWorkedToday || 0), 0)
        const allSessions = allProfileData.flatMap((item) => item.rawActivity?.aggregatedSessions || [])

        const weightedRate = allProfileData.reduce((sum, item) => {
            return sum + (item.member?.hourlyRate || 0) * (item.rangeMetrics?.totalHoursWorked || 0)
        }, 0)
        const fallbackAverageRate = allProfileData.reduce((sum, item) => sum + (item.member?.hourlyRate || 0), 0) / allProfileData.length
        const hourlyRate = totalHoursWorked > 0 ? weightedRate / totalHoursWorked : fallbackAverageRate

        const startDates = allProfileData
            .map((item) => item.employment?.startDate)
            .filter(Boolean)
            .map((d) => new Date(d as string).getTime())
            .filter((t) => !Number.isNaN(t))
        const earliestStartDate = startDates.length ? new Date(Math.min(...startDates)).toISOString() : undefined

        return {
            member: {
                ...base.member,
                hourlyRate,
                amountEarned: totalAmountEarned,
            },
            employment: {
                startDate: earliestStartDate || base.employment?.startDate,
                birthday: base.employment?.birthday,
            },
            rangeMetrics: {
                totalHoursWorked,
                amountEarned: totalAmountEarned,
                avgActivityRate: base.rangeMetrics?.avgActivityRate || 0,
                totalWorkedThisWeek,
                totalWorkedToday,
            },
            rawActivity: {
                aggregatedSessions: allSessions,
            },
        }
    }, [allProfileData])

    const selectedInsights = useMemo(() => {
        if (!selectedProjectId) {
            return insightsQueries.flatMap((query) => ((query.data as IStaffHourlyInsight[] | undefined) || []))
        }
        const idx = assignments.findIndex((a) => a.id === selectedProjectId)
        if (idx < 0) return []
        return (insightsQueries[idx]?.data as IStaffHourlyInsight[] | undefined) || []
    }, [assignments, insightsQueries, selectedProjectId])

    const activeProfileData = selectedProjectId ? selectedProfileData : aggregatedProfileData
    const member = activeProfileData?.member
    const staffName = member?.user?.name || organizationMember?.user?.name || "Staff Member"
    const staffRole = member?.jobTitle || member?.role || organizationMember?.role || "Member"
    const staffAvatar = member?.user?.avatar ?? organizationMember?.user?.avatar ?? undefined

    const isProfilesLoading = profileQueries.some((query) => query.isLoading)
    const isInsightsLoading = insightsQueries.some((query) => query.isLoading)

    const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProjectMemberProfile()
    const { mutateAsync: assignProjectMember, isPending: isAssigningProject } = useAssignProjectMember()
    const { mutateAsync: unassignProjectMember } = useUnassignProjectMember()

    const availableProjects = useMemo(() => {
        const list = projectsData?.results || []
        const assignedIds = new Set(assignments.map((item) => item.id))

        return list
            .map((item) => ({ id: item.id, name: item.name }))
            .filter((item) => !assignedIds.has(item.id))
    }, [projectsData, assignments])

    const handleOpenAssign = () => {
        if (!availableProjects.length) {
            toast.message("No available projects to assign")
            return
        }

        setAssignProjectId(availableProjects[0]?.id || "")
        setAssignRole(ProjectMemberRole.MEMBER)
        setAssignOpen(true)
    }

    const handleAssignProject = async () => {
        if (!assignProjectId) {
            toast.error("Select a project")
            return
        }

        await assignProjectMember({
            organizationId,
            projectId: assignProjectId,
            userId: staffId,
            role: assignRole as "manager" | "member" | "viewer",
        })

        setAssignOpen(false)
        await refetchOrganizationMember()
        toast.success("Project assigned")
    }

    const handleRemoveProject = async (projectId: string) => {
        setRemovingProjectId(projectId)

        try {
            await unassignProjectMember({
                organizationId,
                projectId,
                userId: staffId,
            })
            await refetchOrganizationMember()
            toast.success("Removed from project")
        } finally {
            setRemovingProjectId(null)
        }
    }

    if (isLoadingMember || (assignments.length > 0 && isProfilesLoading)) {
        return (
            <div className="flex flex-col h-full">
                <PageHeader
                    title="Team"
                    breadcrumbs={[
                        { label: "Dashboard", href: orgId ? `/dashboard/${orgId}` : "/dashboard", active: false },
                        { label: "Team", href: orgId ? `/dashboard/${orgId}/teams` : "/dashboard/teams", active: false },
                        { label: "Member", href: "#", active: true },
                    ]}
                />
                <StaffProfileSkeleton />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title="Team"
                breadcrumbs={[
                    { label: "Dashboard", href: orgId ? `/dashboard/${orgId}` : "/dashboard", active: false },
                    { label: "Team", href: orgId ? `/dashboard/${orgId}/teams` : "/dashboard/teams", active: false },
                    { label: staffName, href: "#", active: true },
                ]}
            />

            <StaffProfileHero
                staffName={staffName}
                staffRole={String(staffRole)}
                staffAvatar={staffAvatar}
                projectName={selectedProjectId ? assignments.find((item) => item.id === selectedProjectId)?.name : "All Projects"}
                onBack={() => router.push(`/dashboard/${organizationId}/teams`)}
                onEditInfo={() => {
                    if (!selectedProjectId) {
                        toast.message("Select a project to edit staff profile fields")
                        return
                    }
                    setEditInfoOpen(true)
                }}
                onExport={() => toast.message("Export coming soon")}
            />

            <EditStaffInfoModal
                open={editInfoOpen}
                onOpenChange={setEditInfoOpen}
                staffName={staffName}
                jobTitle={String(member?.role || ProjectMemberRole.MEMBER)}
                payRate={member?.hourlyRate}
                startDate={activeProfileData?.employment?.startDate || undefined}
                birthday={activeProfileData?.employment?.birthday || undefined}
                notes={member?.notes || ""}
                isSaving={isSavingProfile}
                onSave={async (payload) => {
                    if (!selectedProjectId) return
                    await updateProfile({
                        organizationId,
                        projectId: selectedProjectId,
                        userId: staffId,
                        body: {
                            role: payload.jobTitle as ProjectMemberRole,
                            hourlyRate: payload.payRate,
                            startDate: payload.startDate,
                            birthday: payload.birthday,
                            notes: payload.notes,
                        },
                    })
                    toast.success("Staff profile updated")
                }}
            />

            <div className="flex flex-col flex-1 px-6 pt-3 pb-6 overflow-auto">
                <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">

                    {/* <CustomTabs persistInRoute tabs={SUB_TABS} defaultValue={activeSubTab} /> */}

                    <div className="flex items-center gap-2">
                        <Label htmlFor="project-filter" className="text-xs text-muted-foreground whitespace-nowrap">Project</Label>
                        <div id="project-filter" className="w-[220px]">
                            <SelectControlled<{ id: string; name: string }>
                                mode="single"
                                value={selectedProjectOption}
                                onChange={(value) => {
                                    const nextValue = value?.id || ALL_PROJECTS
                                    const q = new URLSearchParams(searchParams.toString())
                                    q.set("projectFilter", nextValue)
                                    q.delete("projectId")
                                    if (memberId) q.set("memberId", memberId)
                                    router.replace(`${pathname}?${q.toString()}`)
                                }}
                                onSearch={setProjectSearch}
                                items={filteredProjectOptions}
                                getId={(item) => item.id}
                                getLabel={(item) => item.name}
                                placeholder="All projects"
                                searchable
                                searchMinChars={1}
                            />
                        </div>
                    </div>
                </div>

                <div key={activeSubTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeSubTab === "overview" && (
                        <OverviewTab
                            member={member}
                            aggregatedSessions={activeProfileData?.rawActivity?.aggregatedSessions || []}
                            sessionsLoading={isProfilesLoading}
                            date={date}
                            setDate={setDate}
                            project={selectedProjectId ? assignments.find((item) => item.id === selectedProjectId) : undefined}
                            projects={assignments}
                            employmentStartDate={activeProfileData?.employment?.startDate || undefined}
                            employmentBirthday={activeProfileData?.employment?.birthday || undefined}
                            canManageAssignments
                            onAssignProject={handleOpenAssign}
                            onRemoveProject={async (projectId) => handleRemoveProject(projectId)}
                            removingProjectId={removingProjectId}
                        />
                    )}

                    {/* {activeSubTab === "insights" && (
                        <InsightsTab
                            aggregatedSessions={activeProfileData?.rawActivity?.aggregatedSessions || []}
                            insightsData={selectedInsights}
                            sessionsLoading={isInsightsLoading || isProfilesLoading}
                            onDateChange={(nextDate) => setSelectedDate(nextDate)}
                            selectedDate={selectedDate}
                            employmentStartDate={activeProfileData?.employment?.startDate || undefined}
                            runInsightsUserId={staffId}
                            runInsightsProjectId={selectedProjectId || undefined}
                        />
                    )}

                    {activeSubTab === "work-limits" && (
                        selectedProjectId ? (
                            <WorkLimitsTab
                                member={member}
                                initialValues={{
                                    totalHoursThisWeek: activeProfileData?.rangeMetrics?.totalWorkedThisWeek ?? null,
                                    totalHoursToday: activeProfileData?.rangeMetrics?.totalWorkedToday ?? null,
                                    expectedWorkDays: (member?.expectedWorkDays || [WorkDay.MON, WorkDay.TUE, WorkDay.WED, WorkDay.THU, WorkDay.FRI]) as WorkDay[],
                                    weeklyLimitHours: member?.weeklyLimitHours ?? null,
                                    dailyLimitHours: member?.dailyLimitHours ?? null,
                                    expectedWeeklyHours: member?.expectedWeeklyHours ?? null,
                                    requiredBreaks: member?.requiredBreaks ?? false,
                                }}
                                onSave={async (payload) => {
                                    await updateProfile({
                                        organizationId,
                                        projectId: selectedProjectId,
                                        userId: staffId,
                                        body: payload,
                                    })
                                    toast.success("Work limits saved")
                                }}
                                isSaving={isSavingProfile}
                            />
                        ) : (
                            <Card className="border border-border/60 shadow-sm rounded-xl">
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    Select a project filter to edit work limits.
                                </CardContent>
                            </Card>
                        )
                    )} */}
                </div>
            </div>

            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign to project</DialogTitle>
                        <DialogDescription>
                            Add this team member to a project and set their role.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="assign-project">Project</Label>
                            <select
                                id="assign-project"
                                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                                value={assignProjectId}
                                onChange={(event) => setAssignProjectId(event.target.value)}
                            >
                                {availableProjects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="assign-role">Role</Label>
                            <select
                                id="assign-role"
                                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                                value={assignRole}
                                onChange={(event) => setAssignRole(event.target.value as ProjectMemberRole)}
                            >
                                <option value={ProjectMemberRole.MEMBER}>Member</option>
                                <option value={ProjectMemberRole.MANAGER}>Manager</option>
                                <option value={ProjectMemberRole.VIEWER}>Viewer</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={isAssigningProject}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignProject} loading={isAssigningProject}>
                            Assign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
