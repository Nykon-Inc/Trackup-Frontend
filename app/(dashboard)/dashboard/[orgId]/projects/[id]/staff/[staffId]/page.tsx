"use client"

import React, { useState, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useGetProjectMemberProfile, useUpdateProjectMemberProfile } from '@/services/projects.services'
import { useWorkspace } from '@/components/providers/workspace-provider'
import { DateRange } from 'react-day-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import { StaffProfileHero } from '@/components/projects/staff-profile/staff-profile-hero'
import { StaffProfileSkeleton } from '@/components/projects/staff-profile/staff-profile-skeleton'
import { OverviewTab } from '@/components/projects/staff-profile/tabs/overview-tab'
import { InsightsTab } from '@/components/projects/staff-profile/tabs/insights-tab'
import { WorkLimitsTab } from '@/components/projects/staff-profile/tabs/work-limits-tab'
import { EditStaffInfoModal } from '@/components/projects/staff-profile/modals/edit-staff-info-modal'
import { toast } from 'sonner'
import { subDays, startOfDay, endOfDay, format } from 'date-fns'
import clsx from 'clsx'
import { ProjectMemberRole, WorkDay } from '@/interfaces/projects.interfaces'
import { GetAggregatedSessionsResponse } from '@/interfaces/sessions.interfaces'
import { CustomTabs } from '@/components/custom-tabs'
import { useGetStaffInsights } from '@/services/ai.services'

// ─────────────────────────────────────────────
// Sub-tab IDs
// ─────────────────────────────────────────────
type SubTab = 'overview' | 'insights' | 'work-limits'

const SUB_TABS: { value: SubTab; label: string }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'insights', label: 'Insights' },
    { value: 'work-limits', label: 'Work Limits' },
]


function PageSkeleton({ orgId, projectId }: { orgId?: string; projectId: string }) {
    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title="Project"
                breadcrumbs={[
                    { label: "Dashboard", href: orgId ? `/dashboard/${orgId}` : "/dashboard", active: false },
                    { label: "Projects", href: orgId ? `/dashboard/${orgId}/projects` : "/dashboard/projects", active: false },
                    { label: "Project", href: orgId ? `/dashboard/${orgId}/projects/${projectId}` : `/dashboard/projects/${projectId}`, active: true },
                ]}
            />
            <StaffProfileSkeleton />
            <div className="flex flex-col flex-1 px-6 pt-3 pb-6 overflow-auto">
                <div className="flex items-center gap-0.5 mb-4">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-64 rounded-xl" />
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-40 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}


// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function StaffProfilePage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    const staffId = params?.staffId as string
    const orgId = params?.orgId as string
    const { activeOrgId } = useWorkspace()

    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    const queryParams = useSearchParams();
    const activeSubTab = queryParams.get("tab") || "overview";
    const [editInfoOpen, setEditInfoOpen] = useState(false)

    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    })

    const sessionQuery = useMemo(() => {
        const from = date?.from
        const to = date?.to || date?.from
        return {
            userId: staffId,
            projectId: id,
            startDate: from ? from.toISOString() : '',
            endDate: to ? to.toISOString() : '',
        }
    }, [staffId, id, date])

    const { data: profileData, isLoading, refetch: refetchProfile } = useGetProjectMemberProfile({
        organizationId: activeOrgId || orgId || '',
        projectId: id,
        userId: staffId,
        startDate: sessionQuery.startDate,
        endDate: sessionQuery.endDate,
    })

    const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProjectMemberProfile()
    const { data: insightsData, isLoading: insightsLoading } = useGetStaffInsights({
        projectId: id,
        userId: staffId,
        startDate: format(selectedDate, "yyyy-MM-dd") + "T00:00:00.000Z",
        endDate: format(selectedDate, "yyyy-MM-dd") + "T23:59:59.999Z",
    })

    const sessions: GetAggregatedSessionsResponse = profileData?.rawActivity?.aggregatedSessions || []
    const member = profileData?.member
    const project = profileData?.project
    const sessionsLoading = isLoading

    // ── Back navigation ──────────────────────────────────
    const handleBack = () => {
        router.push(`/dashboard/${activeOrgId || orgId}/projects/${id}`)
    }

    if (isLoading) {
        return <PageSkeleton orgId={activeOrgId || orgId} projectId={id} />
    }

    const staffName = member?.user?.name || 'Staff Member'
    const staffRole = member?.jobTitle || member?.role || 'Member'
    const staffAvatar = member?.user?.avatar
    const projectName = project?.name || 'Project'
    const projectHrefId = project?.id || id

    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title={projectName}
                breadcrumbs={[
                    { label: "Dashboard", href: orgId ? `/dashboard/${orgId}` : "/dashboard", active: false },
                    { label: "Projects", href: orgId ? `/dashboard/${orgId}/projects` : "/dashboard/projects", active: false },
                    { label: projectName, href: orgId ? `/dashboard/${orgId}/projects/${projectHrefId}` : `/dashboard/projects/${projectHrefId}`, active: false },
                    { label: staffName, href: orgId ? `/dashboard/${orgId}/projects/${projectHrefId}/staff/${staffId}` : `/dashboard/projects/${projectHrefId}/staff/${staffId}`, active: true },
                ]}
            />

            <StaffProfileHero
                staffName={staffName}
                staffRole={staffRole}
                staffAvatar={staffAvatar}
                projectName={projectName}
                onBack={handleBack}
                onEditInfo={() => setEditInfoOpen(true)}
                onManageProjects={() => toast.message("Manage Projects coming soon")}
                onExport={() => toast.message("Export coming soon")}
            />

            <EditStaffInfoModal
                open={editInfoOpen}
                onOpenChange={setEditInfoOpen}
                staffName={staffName}
                jobTitle={String(member?.role || ProjectMemberRole.MEMBER)}
                payRate={member?.hourlyRate}
                startDate={profileData?.employment?.startDate || undefined}
                birthday={profileData?.employment?.birthday || undefined}
                notes={member?.notes || ""}
                isSaving={isSavingProfile}
                onSave={async (payload) => {
                    await updateProfile({
                        organizationId: activeOrgId || orgId || '',
                        projectId: id,
                        userId: staffId,
                        body: {
                            role: payload.jobTitle as ProjectMemberRole,
                            hourlyRate: payload.payRate,
                            startDate: payload.startDate,
                            birthday: payload.birthday,
                            notes: payload.notes,
                        },
                    })
                    await refetchProfile()
                    toast.success("Staff profile updated")
                }}
            />

            {/* ── Sub-tabs + Content ─────────────────────────── */}
            <div className="flex flex-col flex-1 px-6 pt-3 pb-6 overflow-auto">
                {/* Sub-tab buttons */}
                <div>
                    <div className="mb-4">
                        <CustomTabs
                            persistInRoute
                            tabs={SUB_TABS}
                            defaultValue={activeSubTab}
                        />
                    </div>

                </div>

                {/* Tab content */}
                <div key={activeSubTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeSubTab === 'overview' && (
                        <OverviewTab
                            member={member}
                            aggregatedSessions={sessions}
                            sessionsLoading={sessionsLoading}
                            date={date}
                            setDate={setDate}
                            project={project}
                            employmentStartDate={profileData?.employment?.startDate || undefined}
                            employmentBirthday={profileData?.employment?.birthday || undefined}
                            canManageAssignments={false}
                        />
                    )}
                    {activeSubTab === 'insights' && (
                        <InsightsTab
                            aggregatedSessions={sessions}
                            insightsData={insightsData}
                            sessionsLoading={insightsLoading || sessionsLoading}
                            onDateChange={(date) => setSelectedDate(date)}
                            selectedDate={selectedDate}
                            employmentStartDate={profileData?.employment?.startDate || undefined}
                        />
                    )}
                    {activeSubTab === 'work-limits' && (
                        <WorkLimitsTab
                            member={member}
                            initialValues={{
                                totalHoursThisWeek: profileData?.rangeMetrics?.totalWorkedThisWeek ?? null,
                                totalHoursToday: profileData?.rangeMetrics?.totalWorkedToday ?? null,
                                expectedWorkDays: (member?.expectedWorkDays || [WorkDay.MON, WorkDay.TUE, WorkDay.WED, WorkDay.THU, WorkDay.FRI]) as WorkDay[],
                                weeklyLimitHours: member?.weeklyLimitHours ?? null,
                                dailyLimitHours: member?.dailyLimitHours ?? null,
                                expectedWeeklyHours: member?.expectedWeeklyHours ?? null,
                                requiredBreaks: member?.requiredBreaks ?? false,
                            }}
                            onSave={async (payload) => {
                                await updateProfile({
                                    organizationId: activeOrgId || orgId || '',
                                    projectId: id,
                                    userId: staffId,
                                    body: payload,
                                })
                                await refetchProfile()
                                toast.success("Work limits saved")
                            }}
                            isSaving={isSavingProfile}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
