"use client"

import React, { useMemo, useState } from "react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MetricCard } from "@/components/dashboard/metric-card"
import {
    Cake,
    CalendarDays,
    DollarSign,
    FolderKanban,
    Mail,
    X,
} from "lucide-react"
import type { ProjectMember } from "@/interfaces/projects.interfaces"
import type { AggregatedSessions } from "@/interfaces/sessions.interfaces"
import { RemoveFromProjectModal } from "@/components/projects/staff-profile/modals/remove-from-project-modal"
import { toast } from "sonner"

export function OverviewTab({
    member,
    aggregatedSessions,
    sessionsLoading,
    date,
    setDate,
    project,
    projects,
    employmentStartDate,
    employmentBirthday,
    canManageAssignments = false,
    onAssignProject,
    onRemoveProject,
    removingProjectId,
}: {
    member: ProjectMember | undefined
    aggregatedSessions: AggregatedSessions[]
    sessionsLoading: boolean
    date: DateRange | undefined
    setDate: (d: DateRange | undefined) => void
    project: { id: string; name: string } | undefined
    projects?: { id: string; name: string; role?: string }[]
    employmentStartDate?: string
    employmentBirthday?: string
    canManageAssignments?: boolean
    onAssignProject?: () => void
    onRemoveProject?: (projectId: string, projectName: string) => Promise<void> | void
    removingProjectId?: string | null
}) {
    const [removeOpen, setRemoveOpen] = useState(false)
    const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null)

    const formatCurrency = (value: number) => {
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    const totalHours = useMemo(() => {
        return aggregatedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    }, [aggregatedSessions])

    const payRate = member?.hourlyRate ?? 0
    const earnings = member?.amountEarned ?? totalHours * payRate

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Employee Info */}
            <Card className="border border-border/60 shadow-sm rounded-xl gap-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Employee Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 gap-0">
                    <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm">{member?.user?.email || "-"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Pay Rate</p>
                            <p className="text-sm">${formatCurrency(payRate)}/hr</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Start Date</p>
                            <p className="text-sm">
                                {employmentStartDate ? format(new Date(employmentStartDate), "MMMM do, yyyy") : "-"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Cake className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Birthday</p>
                            <p className="text-sm">{employmentBirthday ? format(new Date(employmentBirthday), "MMMM do, yyyy") : "-"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right: Work & Earnings + Project Assignments */}
            <div className="lg:col-span-2 space-y-4">
                {/* Work & Earnings */}
                <Card className="border border-border/60 shadow-sm rounded-xl gap-0">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <CardTitle className="text-sm font-semibold">Work & Earnings</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Summary for the selected date range</p>
                            </div>
                            {/* <div className="flex items-center gap-2 flex-wrap">
                                <DatePickerWithRange date={date} setDate={setDate} />
                            </div> */}
                        </div>
                    </CardHeader>
                    <CardContent className="gap-0">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <MetricCard
                                title="Hours Worked"
                                value={sessionsLoading ? "--" : `${totalHours.toFixed(1)}h`}
                            />
                            <MetricCard
                                title="Pay Rate"
                                value={payRate ? `$${formatCurrency(payRate)}/hr` : "--"}
                            />
                            <MetricCard
                                title="Earnings"
                                value={sessionsLoading ? "--" : `$${formatCurrency(Number(earnings || 0))}`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Project Assignments */}
                <Card className="border border-border/60 shadow-sm rounded-xl gap-0">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold">Project Assignments</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Manage project assignments for this team member</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                onClick={() => {
                                    if (!canManageAssignments) {
                                        toast.message("Manage assignments is available in Team view only")
                                        return
                                    }
                                    onAssignProject?.()
                                }}
                                disabled={!canManageAssignments}
                            >
                                <FolderKanban className="h-3.5 w-3.5" />
                                Assign to Project
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {projects && projects.length > 0 ? (
                            <div className="space-y-2">
                                {projects.map((assigned) => (
                                    <div key={assigned.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium">{assigned.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{assigned.role || "member"}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!canManageAssignments) {
                                                    toast.message("Manage assignments is available in Team view only")
                                                    return
                                                }
                                                setRemoveTarget({ id: assigned.id, name: assigned.name })
                                                setRemoveOpen(true)
                                            }}
                                            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                                            disabled={!canManageAssignments || removingProjectId === assigned.id}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : project ? (
                            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium">{project.name}</p>
                                    {sessionsLoading ? (
                                        <div className="mt-0.5">
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {`${totalHours.toFixed(1)}h • $${formatCurrency(Number(earnings || 0))}`}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!canManageAssignments) {
                                            toast.message("Manage assignments is available in Team view only")
                                            return
                                        }
                                        setRemoveTarget({ id: project.id, name: project.name })
                                        setRemoveOpen(true)
                                    }}
                                    className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                                    disabled={!canManageAssignments || removingProjectId === project.id}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No project assignments yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <RemoveFromProjectModal
                open={removeOpen}
                onOpenChange={setRemoveOpen}
                staffName={member?.user?.name || "This staff member"}
                projectName={removeTarget?.name || project?.name || "this project"}
                onConfirm={async () => {
                    if (!removeTarget) return
                    await onRemoveProject?.(removeTarget.id, removeTarget.name)
                    setRemoveOpen(false)
                }}
                isPending={!!removeTarget && removingProjectId === removeTarget.id}
            />
        </div>
    )
}
