"use client"

import { useMemo, useState } from "react"
import { OrganizationMember, OrganizationMemberRole } from "@/interfaces/organizations.interfaces"
import { useGetOrganizationMember, useGetOrganizationMembers } from "@/services/organization.services"
import { useGetProjects } from "@/services/projects.services"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { SelectControlled } from "@/components/ui/select-controlled"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type ProjectOption = {
    id: string
    name: string
}

type FormMode = "member" | "manager"

export type ManualTimeRequestFormPayload = {
    userId?: string
    projectId: string
    startTime: number
    endTime: number
    reason?: string
}

interface ManualTimeRequestFormProps {
    organizationId: string
    currentUserId: string
    mode: FormMode
    open: boolean
    onOpenChange: (open: boolean) => void
    isSubmitting?: boolean
    title: string
    description: string
    submitLabel: string
    onSubmit: (payload: ManualTimeRequestFormPayload, reset: () => void) => Promise<void> | void
}

const toLocalInputDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ManualTimeRequestForm({
    organizationId,
    currentUserId,
    mode,
    open,
    onOpenChange,
    isSubmitting = false,
    title,
    description,
    submitLabel,
    onSubmit,
}: ManualTimeRequestFormProps) {
    const [memberSearch, setMemberSearch] = useState("")
    const [projectSearch, setProjectSearch] = useState("")
    const [selectedUserId, setSelectedUserId] = useState<string>("")
    const [selectedProjectId, setSelectedProjectId] = useState<string>("")
    const [startInput, setStartInput] = useState("")
    const [endInput, setEndInput] = useState("")
    const [reason, setReason] = useState("")
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [nowTs] = useState(() => Date.now())

    const { data: membersData, isLoading: isLoadingMembers } = useGetOrganizationMembers({
        organizationId,
        query: { search: memberSearch, page: 1, limit: 200 },
    })

    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({
        organizationId: mode === "member" ? organizationId : "",
        userId: currentUserId,
        query: { search: projectSearch, page: 1, limit: 200 },
    })

    const members = useMemo(() => {
        return (((membersData as { results?: OrganizationMember[] } | undefined)?.results) || [])
            .filter((member) => member.role === OrganizationMemberRole.MEMBER)
    }, [membersData])

    const selectedMember = useMemo(
        () => members.find((member) => member.userId === selectedUserId) || null,
        [members, selectedUserId]
    )

    const { data: selectedMemberDetails, isLoading: isLoadingMemberProjects } = useGetOrganizationMember({
        organizationId,
        memberId: selectedMember?.id || "",
    })

    const projects = useMemo(() => {
        if (mode === "manager") {
            const memberProjects =
                selectedMemberDetails?.projects ||
                selectedMemberDetails?.member?.projects ||
                []

            const assigned = memberProjects
                .map((project) => ({ id: project.id, name: project.name }))
                .filter((project) => !!project.id && !!project.name)

            if (!projectSearch.trim()) return assigned

            return assigned.filter((project) =>
                project.name.toLowerCase().includes(projectSearch.toLowerCase())
            )
        }

        return (((projectsData as { results?: ProjectOption[] } | undefined)?.results) || [])
    }, [mode, projectsData, selectedMemberDetails, projectSearch])

    const selectedProject = useMemo(
        () => projects.find((project) => project.id === selectedProjectId) || null,
        [projects, selectedProjectId]
    )

    const maxDateTime = toLocalInputDateTime(nowTs)

    const resetForm = () => {
        setMemberSearch("")
        setProjectSearch("")
        setSelectedUserId("")
        setSelectedProjectId("")
        setStartInput("")
        setEndInput("")
        setReason("")
        setConfirmOpen(false)
    }

    const submitPayload = useMemo(() => {
        const ownerUserId = mode === "manager" ? selectedUserId : currentUserId
        if (!ownerUserId || !selectedProjectId || !startInput || !endInput) {
            return null
        }

        return {
            userId: mode === "manager" ? ownerUserId : undefined,
            projectId: selectedProjectId,
            startTime: new Date(startInput).getTime(),
            endTime: new Date(endInput).getTime(),
            reason,
        } as ManualTimeRequestFormPayload
    }, [mode, selectedUserId, currentUserId, selectedProjectId, startInput, endInput, reason])

    const executeSubmit = async () => {
        if (!submitPayload) return

        try {
            await onSubmit(submitPayload, resetForm)
        } catch {
            return
        }
    }

    const handleSubmit = async () => {
        if (!submitPayload) return

        if (mode === "manager") {
            setConfirmOpen(true)
            return
        }

        await executeSubmit()
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
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {!confirmOpen ? (
                    <div className="space-y-3">
                        {mode === "manager" && (
                            <SelectControlled<OrganizationMember>
                                mode="single"
                                value={selectedMember}
                                onChange={(member) => {
                                    setSelectedUserId(member?.userId || "")
                                    setSelectedProjectId("")
                                    setProjectSearch("")
                                }}
                                onSearch={setMemberSearch}
                                items={members}
                                isLoading={isLoadingMembers}
                                getId={(item) => item.userId}
                                getLabel={(item) => item.user.name}
                                placeholder="Select member"
                                searchable
                            />
                        )}

                        <SelectControlled<ProjectOption>
                            mode="single"
                            value={selectedProject}
                            onChange={(project) => setSelectedProjectId(project?.id || "")}
                            onSearch={setProjectSearch}
                            items={projects}
                            isLoading={mode === "manager" ? isLoadingMemberProjects : isLoadingProjects}
                            getId={(item) => item.id}
                            getLabel={(item) => item.name}
                            placeholder={mode === "manager" && !selectedUserId ? "Select member first" : "Select project"}
                            searchable
                            disabled={mode === "manager" && !selectedUserId}
                        />

                        <Input
                            type="datetime-local"
                            value={startInput}
                            max={maxDateTime}
                            onChange={(event) => setStartInput(event.target.value)}
                        />

                        <Input
                            type="datetime-local"
                            value={endInput}
                            max={maxDateTime}
                            onChange={(event) => setEndInput(event.target.value)}
                        />

                        <Textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Reason"
                        />

                        {isInvalidRange && (
                            <p className="text-xs text-destructive">End time must be greater than start time.</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">Please confirm this manual time entry.</p>
                        {mode === "manager" && (
                            <p><span className="font-medium">Member:</span> {selectedMember?.user?.name || "-"}</p>
                        )}
                        <p><span className="font-medium">Project:</span> {selectedProject?.name || "-"}</p>
                        <p><span className="font-medium">Start:</span> {startInput ? new Date(startInput).toLocaleString() : "-"}</p>
                        <p><span className="font-medium">End:</span> {endInput ? new Date(endInput).toLocaleString() : "-"}</p>
                        <p><span className="font-medium">Duration:</span> {durationHours} hours</p>
                        <p><span className="font-medium">Reason:</span> {reason || "-"}</p>
                        <p className="text-xs text-muted-foreground pt-1">
                            This will create an approved manual time entry immediately.
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
                                    !selectedProjectId ||
                                    !startInput ||
                                    !endInput ||
                                    (mode === "manager" && !selectedUserId)
                                }
                            >
                                {submitLabel}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                                Back
                            </Button>
                            <Button onClick={executeSubmit} disabled={isSubmitting || isInvalidRange}>
                                Confirm add
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
