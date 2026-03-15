"use client"

import { useMemo, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CalendarWithTime } from "@/components/ui/calendar-with-time"
import { format } from "date-fns"

import { useWorkspace } from "@/components/providers/workspace-provider"
import { OrganizationMemberRole } from "@/interfaces/organizations.interfaces"
import { useCreateDirectManualTime, useCreateManualTimeRequest } from "@/services/manual-time-requests.services"

export type MemberManualTimeRequestFormPayload = {
    userId: string
    projectId: string
    startTime: number
    endTime: number
    reason?: string
}

interface MemberManualTimeRequestFormProps {
    organizationId: string
    userId: string
    projectId: string
    projectName: string
    userName: string
    open: boolean
    onOpenChange: (open: boolean) => void
}



export function MemberManualTimeRequestForm({
    organizationId,
    userId,
    projectId,
    projectName,
    userName,
    open,
    onOpenChange,
}: MemberManualTimeRequestFormProps) {
    const { activeOrg } = useWorkspace()
    const isPrivileged = activeOrg?.role === OrganizationMemberRole.OWNER || activeOrg?.role === OrganizationMemberRole.MANAGER

    const directMutation = useCreateDirectManualTime(organizationId)
    const requestMutation = useCreateManualTimeRequest(organizationId)

    const mutation = isPrivileged ? directMutation : requestMutation
    const isSubmitting = mutation.isPending

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [startTime, setStartTime] = useState("09:00:00")
    const [endTime, setEndTime] = useState("17:00:00")
    const [reason, setReason] = useState("")
    const [confirmOpen, setConfirmOpen] = useState(false)

    const resetForm = () => {
        setSelectedDate(new Date())
        setStartTime("09:00:00")
        setEndTime("17:00:00")
        setReason("")
        setConfirmOpen(false)
    }

    const submitPayload = useMemo(() => {
        if (!userId || !projectId || !selectedDate || !startTime || !endTime) {
            return null
        }

        const start = new Date(selectedDate)
        const [sh, sm, ss] = startTime.split(":").map(Number)
        start.setHours(sh || 0, sm || 0, ss || 0, 0)

        const end = new Date(selectedDate)
        const [eh, em, es] = endTime.split(":").map(Number)
        end.setHours(eh || 0, em || 0, es || 0, 0)

        return {
            userId,
            projectId,
            startTime: start.getTime(),
            endTime: end.getTime(),
            reason,
        } as MemberManualTimeRequestFormPayload
    }, [userId, projectId, selectedDate, startTime, endTime, reason])

    const executeSubmit = async () => {
        if (!submitPayload) return

        try {
            await mutation.mutateAsync({
                userId: submitPayload.userId,
                projectId: submitPayload.projectId,
                startTime: submitPayload.startTime,
                endTime: submitPayload.endTime,
                reason: submitPayload.reason,
            })
            resetForm()
            onOpenChange(false)
        } catch {
            return
        }
    }

    const handleSubmit = async () => {
        if (!submitPayload) return
        setConfirmOpen(true)
    }

    const durationHours = useMemo(() => {
        if (!submitPayload) return "0.00"
        const hours = (submitPayload.endTime - submitPayload.startTime) / 3600000
        return Math.max(0, hours).toFixed(2)
    }, [submitPayload])

    const isInvalidRange = !!submitPayload && submitPayload.endTime <= submitPayload.startTime

    const handleDialogChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setConfirmOpen(false)
        }
        onOpenChange(nextOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Manual Time</DialogTitle>
                    <DialogDescription>
                        {isPrivileged 
                            ? "Manually add work sessions for your team members."
                            : "Submit a request for manual time to be added to your timesheet."}
                    </DialogDescription>
                </DialogHeader>
                {!confirmOpen ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Member</label>
                                <div className="text-sm font-semibold">{userName}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Project</label>
                                <div className="text-sm font-semibold">{projectName}</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase">Date & Time Range</label>
                            <CalendarWithTime
                                date={selectedDate}
                                startTime={startTime}
                                endTime={endTime}
                                onChange={(values) => {
                                    setSelectedDate(values.date)
                                    setStartTime(values.startTime)
                                    setEndTime(values.endTime)
                                }}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase">Reason</label>
                            <Textarea
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                placeholder="Reason for manual time entry"
                            />
                        </div>

                        {isInvalidRange && (
                            <p className="text-xs text-destructive">End time must be greater than start time.</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">Please confirm this manual time entry.</p>
                        <p><span className="font-medium">Member:</span> {userName}</p>
                        <p><span className="font-medium">Project:</span> {projectName}</p>
                        <p><span className="font-medium">Start:</span> {submitPayload?.startTime ? new Date(submitPayload.startTime).toLocaleString() : "-"}</p>
                        <p><span className="font-medium">End:</span> {submitPayload?.endTime ? new Date(submitPayload.endTime).toLocaleString() : "-"}</p>
                        <p><span className="font-medium">Duration:</span> {durationHours} hours</p>
                        <p><span className="font-medium">Reason:</span> {reason || "-"}</p>
                        <p className="text-xs text-muted-foreground pt-1">
                            {isPrivileged 
                                ? "This will create an approved manual time entry immediately."
                                : "This will create a manual time entry pending approval by your manager."}
                        </p>
                    </div>
                )}

                <DialogFooter>
                    {!confirmOpen ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    isSubmitting ||
                                    isInvalidRange ||
                                    !selectedDate ||
                                    !startTime ||
                                    !endTime
                                }
                            >
                                {isPrivileged ? "Confirm and Add" : "Submit Request"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                                Back
                            </Button>
                            <Button onClick={executeSubmit} disabled={isSubmitting || isInvalidRange}>
                                {isPrivileged ? "Add time" : "Confirm request"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
