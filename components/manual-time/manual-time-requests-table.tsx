"use client"

import { useMemo, useState } from "react"
import { format, subWeeks } from "date-fns"
import { DateRange } from "react-day-picker"
import { CheckIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Table, { TableColumn } from "@/components/ui/data-table"
import TablePagination from "@/components/ui/table-pagination"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { SelectControlled } from "@/components/ui/select-controlled"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useGetOrganizationMembers } from "@/services/organization.services"
import { useGetProjects } from "@/services/projects.services"
import {
    useCreateDirectManualTime,
    useGetManualTimeRequests,
    useReviewManualTimeRequest,
} from "@/services/manual-time-requests.services"
import { useAuthStore } from "@/stores/auth.store"
import { ManualTimeRequest, ManualTimeRequestStatus } from "@/interfaces/manual-time-request.interfaces"
import { OrganizationMember, OrganizationMemberRole } from "@/interfaces/organizations.interfaces"
import { ManualTimeRequestForm, ManualTimeRequestFormPayload } from "./manual-time-request-form"

interface ManualTimeRequestsTableProps {
    organizationId: string
    showAddButton?: boolean
    userId?: string
}

type ProjectOption = {
    id: string
    name: string
}

const filterOptions: Array<ManualTimeRequestStatus | "all"> = ["all", "pending", "approved", "rejected"]

const statusStyles: Record<ManualTimeRequestStatus, string> = {
    approved: "bg-green-500/15 text-green-700 border-green-200",
    rejected: "bg-red-500/15 text-red-700 border-red-200",
    pending: "bg-amber-500/15 text-amber-700 border-amber-200",
}

const toDayStartTs = (date: Date) => new Date(format(date, "yyyy-MM-dd") + "T00:00:00.000Z").getTime()
const toDayEndTs = (date: Date) => new Date(format(date, "yyyy-MM-dd") + "T23:59:59.999Z").getTime()

const toDisplayName = (value: unknown, fallback = "-") => {
    if (typeof value === "string") return value
    if (value && typeof value === "object" && "name" in value) {
        return String((value as { name?: unknown }).name || fallback)
    }
    return fallback
}

const toEntityId = (value: unknown) => {
    if (typeof value === "string") return value
    if (value && typeof value === "object" && "id" in value) {
        return String((value as { id?: unknown }).id || "")
    }
    return ""
}

export function ManualTimeRequestsTable({ organizationId, showAddButton, userId }: ManualTimeRequestsTableProps) {
    const { account } = useAuthStore()
    const today = new Date()

    const [status, setStatus] = useState<ManualTimeRequestStatus | "all">("all")
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subWeeks(today, 8),
        to: today,
    })
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [memberSearch, setMemberSearch] = useState("")
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
    const [projectSearch, setProjectSearch] = useState("")
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

    const [rejectOpen, setRejectOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [selectedRequest, setSelectedRequest] = useState<ManualTimeRequest | null>(null)

    const [directOpen, setDirectOpen] = useState(false)

    const { data: membersData } = useGetOrganizationMembers({
        organizationId,
        query: { search: memberSearch, page: 1, limit: 200 },
    })

    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({
        organizationId,
        userId: account?.id || "",
        query: { search: projectSearch, page: 1, limit: 200, projectType: "watchtower" },
    })

    const members = useMemo(() => {
        return (((membersData as { results?: OrganizationMember[] } | undefined)?.results) || [])
            .filter((member) => member.role === OrganizationMemberRole.MEMBER)
    }, [membersData])

    const selectedMember = useMemo(
        () => members.find((member) => member.userId === selectedMemberId) || null,
        [members, selectedMemberId]
    )

    const projects = useMemo(() => {
        return (((projectsData as { results?: ProjectOption[] } | undefined)?.results) || [])
    }, [projectsData])

    const selectedProject = useMemo(
        () => projects.find((project) => project.id === selectedProjectId) || null,
        [projects, selectedProjectId]
    )

    const { data: requests, isLoading } = useGetManualTimeRequests({
        organizationId,
        status,
        userId: userId || selectedMemberId || undefined,
        startDate: dateRange?.from ? toDayStartTs(dateRange.from) : undefined,
        endDate: dateRange?.to ? toDayEndTs(dateRange.to) : undefined,
        page,
        limit: rowsPerPage,
        sortBy: "createdAt:desc",
    })

    const reviewMutation = useReviewManualTimeRequest(organizationId)
    const directMutation = useCreateDirectManualTime(organizationId)

    const serverRows = requests?.results || []
    const filteredRows = selectedProjectId
        ? serverRows.filter((row) => toEntityId(row.projectId) === selectedProjectId)
        : serverRows

    const totalFilteredResults = selectedProjectId ? filteredRows.length : (requests?.totalResults || 0)

    const handleApprove = async (request: ManualTimeRequest) => {
        try {
            await reviewMutation.mutateAsync({ requestId: request.id, status: "approved" })
        } catch {
            return
        }
    }

    const handleReject = async () => {
        if (!selectedRequest || !rejectReason.trim()) return

        try {
            await reviewMutation.mutateAsync({
                requestId: selectedRequest.id,
                status: "rejected",
                reason: rejectReason,
            })
        } catch {
            return
        }

        setRejectOpen(false)
        setSelectedRequest(null)
        setRejectReason("")
    }

    const handleDirectCreate = async (payload: ManualTimeRequestFormPayload, reset: () => void) => {
        if (!payload.userId) return

        try {
            await directMutation.mutateAsync({
                userId: payload.userId,
                projectId: payload.projectId,
                startTime: payload.startTime,
                endTime: payload.endTime,
                reason: payload.reason,
            })
        } catch {
            return
        }

        reset()
        setDirectOpen(false)
    }

    const columns: TableColumn<ManualTimeRequest>[] = [
        ...(!userId
            ? [
                {
                    header: "Member",
                    key: "userId",
                    render: (value: any) => (
                        <span className="text-sm font-semibold text-foreground">{toDisplayName(value)}</span>
                    ),
                    width: "200px",
                } as TableColumn<ManualTimeRequest>,
            ]
            : []),
        {
            header: "Project",
            key: "projectId",
            render: (value) => <span className="text-sm">{toDisplayName(value)}</span>,
            width: "210px",
        },
        {
            header: "Start",
            key: "startTime",
            render: (value) => <span className="text-sm">{format(new Date(value as number), "MMM d, yyyy HH:mm")}</span>,
            width: "170px",
        },
        {
            header: "End",
            key: "endTime",
            render: (value) => <span className="text-sm">{format(new Date(value as number), "MMM d, yyyy HH:mm")}</span>,
            width: "170px",
        },
        {
            header: "Duration",
            key: "id",
            align: "center",
            render: (_, row) => <span className="text-xs font-medium">{((row.endTime - row.startTime) / 3600000).toFixed(2)}h</span>,
            width: "110px",
        },
        {
            header: "Reason",
            key: "reason",
            render: (value) => <span className="text-xs text-muted-foreground">{(value as string) || "-"}</span>,
            width: "260px",
        },
        {
            header: "Status",
            key: "status",
            align: "center",
            render: (value) => {
                const current = value as ManualTimeRequestStatus
                return (
                    <Badge className={`text-xs px-1.5 py-0 ${statusStyles[current] || ""}`}>
                        {current.charAt(0).toUpperCase() + current.slice(1)}
                    </Badge>
                )
            },
            width: "110px",
        },
        {
            header: "Approved By",
            key: "approvedBy",
            render: (value) => <span className="text-sm">{toDisplayName(value, "-")}</span>,
            width: "170px",
        },
        ...(!userId
            ? [
                {
                    header: "Actions",
                    key: "id",
                    align: "center",
                    render: (_, row: ManualTimeRequest) => {
                        if (row.status !== "pending") return <span className="text-muted-foreground">-</span>

                        return (
                            <div className="flex gap-1.5 justify-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                    onClick={() => handleApprove(row)}
                                    disabled={reviewMutation.isPending}
                                    aria-label="Approve manual time request"
                                >
                                    <CheckIcon className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                    onClick={() => {
                                        setSelectedRequest(row)
                                        setRejectReason("")
                                        setRejectOpen(true)
                                    }}
                                    disabled={reviewMutation.isPending}
                                    aria-label="Reject manual time request"
                                >
                                    <XIcon className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )
                    },
                    width: "120px",
                } as TableColumn<ManualTimeRequest>,
            ]
            : []),
    ]

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex gap-1 mt-3 flex-wrap">
                    {filterOptions.map((option) => (
                        <Button
                            key={option}
                            variant={status === option ? "default" : "ghost"}
                            size="sm"
                            className="text-xs h-7 px-2.5 capitalize"
                            onClick={() => {
                                setStatus(option)
                                setPage(1)
                            }}
                        >
                            {option}
                        </Button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <DatePickerWithRange
                        date={dateRange}
                        setDate={(range) => {
                            setDateRange(range)
                            setPage(1)
                        }}
                        className="w-[280px]"
                    />
                    {!userId && (
                        <div className="w-[240px]">
                            <SelectControlled<OrganizationMember>
                                mode="single"
                                value={selectedMember}
                                onChange={(member) => {
                                    setSelectedMemberId(member?.userId || null)
                                    setPage(1)
                                }}
                                onSearch={setMemberSearch}
                                items={members}
                                getId={(item) => item.userId}
                                getLabel={(item) => item.user.name}
                                placeholder="Filter by member"
                                searchable
                            />
                        </div>
                    )}
                    <div className="w-[240px]">
                        <SelectControlled<ProjectOption>
                            mode="single"
                            value={selectedProject}
                            onChange={(project) => {
                                setSelectedProjectId(project?.id || null)
                                setPage(1)
                            }}
                            onSearch={setProjectSearch}
                            items={projects}
                            isLoading={isLoadingProjects}
                            getId={(item) => item.id}
                            getLabel={(item) => item.name}
                            placeholder="Filter by project"
                            searchable
                        />
                    </div>
                    {showAddButton && <Button onClick={() => setDirectOpen(true)}>Add Manual Time</Button>}
                </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <Table
                    data={filteredRows}
                    columns={columns}
                    loading={isLoading}
                    rowKey={(row) => row.id}
                    emptyMessage={`No ${status !== "all" ? status : ""} manual time requests found.`}
                    hover
                    compact
                    bordered={false}
                    className="border-0"
                    headerClassName="bg-transparent h-12 border-b border-slate-100 text-slate-400 font-normal text-xs uppercase tracking-wider whitespace-nowrap"
                    rowClassName="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                    minTableWidth="1550px"
                />

                <div className="border-t border-slate-100 px-4 bg-slate-50/20">
                    <TablePagination
                        component="div"
                        count={totalFilteredResults}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(_, nextPage) => setPage(nextPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(Number(event.target.value))
                            setPage(1)
                        }}
                        rowsPerPageOptions={[10, 20, 50]}
                        showFirstButton
                        showLastButton
                        className="border-0 p-0"
                    />
                </div>
            </div>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject manual time request</DialogTitle>
                        <DialogDescription>Please provide a reason for rejection.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        placeholder="Reason"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!rejectReason.trim() || reviewMutation.isPending} onClick={handleReject}>
                            Reject request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ManualTimeRequestForm
                organizationId={organizationId}
                currentUserId={account?.id || ""}
                mode="manager"
                open={directOpen}
                onOpenChange={setDirectOpen}
                isSubmitting={directMutation.isPending}
                title="Add manual time"
                description="Create an approved manual entry directly."
                submitLabel="Add time"
                onSubmit={handleDirectCreate}
            />
        </div>
    )
}
