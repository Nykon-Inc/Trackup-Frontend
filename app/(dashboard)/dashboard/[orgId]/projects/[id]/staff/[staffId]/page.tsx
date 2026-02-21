"use client"

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGetAggregatedSessions } from '@/services/sessions.services'
import { useGetProjectMembers } from '@/services/projects.services'
import { useGetProject } from '@/services/projects.services'
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
import { subDays } from 'date-fns'
import clsx from 'clsx'

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

    const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview')
    const [editInfoOpen, setEditInfoOpen] = useState(false)

    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    })

    // Fetch project details (for project tabs and assignments)
    const { data: project, isLoading: projectLoading } = useGetProject({
        organizationId: activeOrgId || '',
        projectId: id,
    })

    // Fetch all project members to find this staff member
    const { data: projectMembersData, isLoading: membersLoading } = useGetProjectMembers(
        id,
        activeOrgId || '',
        { limit: 100 }
    )
    const member = useMemo(
        () => projectMembersData?.results?.find((m) => m.userId === staffId),
        [projectMembersData, staffId]
    )

    // Fetch aggregated sessions
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

    const { data: aggregatedSessions, isLoading: sessionsLoading } = useGetAggregatedSessions(sessionQuery)

    const sessions = aggregatedSessions || []

    const isLoading = projectLoading || membersLoading

    // ── Back navigation ──────────────────────────────────
    const handleBack = () => {
        router.push(`/dashboard/${activeOrgId || orgId}/projects/${id}`)
    }

    if (isLoading) {
        return <PageSkeleton orgId={activeOrgId || orgId} projectId={id} />
    }

    const staffName = member?.user?.name || 'Staff Member'
    const staffRole = member?.role || 'Member'
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
                    { label: projectName, href: orgId ? `/dashboard/${orgId}/projects/${projectHrefId}` : `/dashboard/projects/${projectHrefId}`, active: true },
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
                jobTitle={String(staffRole)}
                payRate={52}
                startDate={member?.createdAt}
                birthday={"1994-12-03"}
                notes={""}
            />

            {/* ── Sub-tabs + Content ─────────────────────────── */}
            <div className="flex flex-col flex-1 px-6 pt-3 pb-6 overflow-auto">
                {/* Sub-tab buttons */}
                <div>
                    <div className="inline-flex items-center rounded-lg bg-muted p-1 mb-4">
                        {SUB_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveSubTab(tab.value)}
                                className={clsx(
                                    "h-8 px-3 text-xs rounded-md transition-colors font-medium",
                                    activeSubTab === tab.value
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
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
                        />
                    )}
                    {activeSubTab === 'insights' && (
                        <InsightsTab
                            aggregatedSessions={sessions}
                            sessionsLoading={sessionsLoading}
                        />
                    )}
                    {activeSubTab === 'work-limits' && (
                        <WorkLimitsTab member={member} />
                    )}
                </div>
            </div>
        </div>
    )
}
