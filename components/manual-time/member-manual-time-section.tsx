"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Table, { TableColumn } from "@/components/ui/data-table"
import TablePagination from "@/components/ui/table-pagination"
import { ManualTimeRequest, ManualTimeRequestStatus } from "@/interfaces/manual-time-request.interfaces"
import { useCreateManualTimeRequest, useGetManualTimeRequests } from "@/services/manual-time-requests.services"
import { useAuthStore } from "@/stores/auth.store"
import { ManualTimeRequestForm, ManualTimeRequestFormPayload } from "./manual-time-request-form"

interface MemberManualTimeSectionProps {
    organizationId: string
}

const statusStyles: Record<ManualTimeRequestStatus, string> = {
    approved: "bg-green-500/15 text-green-700 border-green-200",
    rejected: "bg-red-500/15 text-red-700 border-red-200",
    pending: "bg-amber-500/15 text-amber-700 border-amber-200",
}

const toDisplayName = (value: unknown, fallback = "-") => {
    if (typeof value === "string") return value
    if (value && typeof value === "object" && "name" in value) {
        return String((value as { name?: unknown }).name || fallback)
    }
    return fallback
}

export function MemberManualTimeSection({ organizationId }: MemberManualTimeSectionProps) {
    const { account } = useAuthStore()
    const [formOpen, setFormOpen] = useState(false)
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const createMutation = useCreateManualTimeRequest(organizationId)
    const { data, isLoading } = useGetManualTimeRequests({
        organizationId,
        page,
        limit: rowsPerPage,
        sortBy: "createdAt:desc",
    })

    const handleSubmit = async (payload: ManualTimeRequestFormPayload, reset: () => void) => {
        await createMutation.mutateAsync({
            projectId: payload.projectId,
            startTime: payload.startTime,
            endTime: payload.endTime,
            reason: payload.reason,
        })
        reset()
        setFormOpen(false)
    }

    const columns: TableColumn<ManualTimeRequest>[] = [
        {
            header: "Project",
            key: "projectId",
            render: (value) => <span className="text-sm font-semibold text-foreground">{toDisplayName(value)}</span>,
        },
        {
            header: "Start",
            key: "startTime",
            render: (value) => <span className="text-sm">{format(new Date(value as number), "MMM d, yyyy HH:mm")}</span>,
        },
        {
            header: "End",
            key: "endTime",
            render: (value) => <span className="text-sm">{format(new Date(value as number), "MMM d, yyyy HH:mm")}</span>,
        },
        {
            header: "Duration",
            key: "id",
            align: "center",
            render: (_, row) => <span className="text-xs font-medium">{((row.endTime - row.startTime) / 3600000).toFixed(2)}h</span>,
        },
        {
            header: "Reason",
            key: "reason",
            render: (value) => <span className="text-xs text-muted-foreground">{(value as string) || "-"}</span>,
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
        },
        {
            header: "Approved By",
            key: "approvedBy",
            render: (value) => <span className="text-sm">{toDisplayName(value, "-")}</span>,
        },
    ]

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button onClick={() => setFormOpen(true)}>Request Manual Time</Button>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <Table
                    data={data?.results || []}
                    columns={columns}
                    loading={isLoading}
                    rowKey={(row) => row.id}
                    emptyMessage="No manual time requests found."
                    hover
                    compact
                    bordered={false}
                    className="border-0"
                    headerClassName="bg-transparent h-12 border-b border-slate-100 text-slate-400 font-normal text-xs uppercase tracking-wider whitespace-nowrap"
                    rowClassName="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                    minTableWidth="1200px"
                />

                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/20">
                    <TablePagination
                        component="div"
                        count={data?.totalResults || 0}
                        page={page}
                        onPageChange={(_, nextPage) => setPage(nextPage)}
                        rowsPerPage={rowsPerPage}
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

            <ManualTimeRequestForm
                organizationId={organizationId}
                currentUserId={account?.id || ""}
                mode="member"
                open={formOpen}
                onOpenChange={setFormOpen}
                isSubmitting={createMutation.isPending}
                title="Request manual time"
                description="Submit a manual time request for manager review."
                submitLabel="Submit Request"
                onSubmit={handleSubmit}
            />
        </div>
    )
}
