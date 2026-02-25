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
import { Label } from "@/components/ui/label"
import { CustomTabs } from "@/components/custom-tabs"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { useGetOrganizationMember } from "@/services/organization.services"
import { useUpdateProjectMemberProfile } from "@/services/projects.services"
import { IStaffHourlyInsight } from "@/interfaces/ai.interfaces"
import { ProjectMemberProfileResponse, ProjectMemberRole, WorkDay } from "@/interfaces/projects.interfaces"

type SubTab = "overview" | "insights" | "work-limits"

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
    const [editInfoOpen, setEditInfoOpen] = useState(false)

    const { data: organizationMember, isLoading: isLoadingMember } = useGetOrganizationMember({
        organizationId,
        memberId,
    })

    const rawAssignments = useMemo(() => {
        const list = organizationMember?.projects || organizationMember?.member?.projects || []
        return Array.isArray(list) ? list : []
    }, [organizationMember])

    const assignments = useMemo(() => {
        return rawAssignments
            .map((item: any) => {
                const id = item?.id || item?.projectId || item?.project?.id
                const name = item?.name || item?.project?.name || "Unnamed Project"
                const role = item?.role || item?.projectRole || "member"
                return id ? { id: String(id), name: String(name), role: String(role) } : null
            })
            .filter(Boolean) as Array<{ id: string; name: string; role?: string }>
    }, [rawAssignments])

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
    const staffAvatar = member?.user?.avatar || organizationMember?.user?.avatar

    const isProfilesLoading = profileQueries.some((query) => query.isLoading)
    const isInsightsLoading = insightsQueries.some((query) => query.isLoading)

    const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProjectMemberProfile()

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
                    <CustomTabs persistInRoute tabs={SUB_TABS} defaultValue={activeSubTab} />
                    <div className="flex items-center gap-2">
                        <Label htmlFor="project-filter" className="text-xs text-muted-foreground whitespace-nowrap">Project</Label>
                        <select
                            id="project-filter"
                            value={projectFilter}
                            onChange={(e) => {
                                const q = new URLSearchParams(searchParams.toString())
                                q.set("projectFilter", e.target.value)
                                q.delete("projectId")
                                if (memberId) q.set("memberId", memberId)
                                router.replace(`${pathname}?${q.toString()}`)
                            }}
                            className="h-9 w-[220px] rounded-md border border-input bg-background px-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value={ALL_PROJECTS}>All projects</option>
                            {assignments.map((assignment) => (
                                <option key={assignment.id} value={assignment.id}>
                                    {assignment.name}
                                </option>
                            ))}
                        </select>
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
                        />
                    )}

                    {activeSubTab === "insights" && (
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
                    )}
                </div>
            </div>
        </div>
    )
}
