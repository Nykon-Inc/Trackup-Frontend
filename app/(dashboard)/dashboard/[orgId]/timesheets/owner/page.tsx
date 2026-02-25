"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Table, { TableColumn } from "@/components/ui/data-table";
import { useFetchOwnerTimesheets, useApproveTimesheet, useRejectTimesheet } from "@/services/timesheets";
import { Badge } from "@/components/ui/badge";
import { DebouncedSearch } from "@/components/ui/debounced-search";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ITimesheet } from "@/interfaces/timesheet.interfaces";
import TablePagination from "@/components/ui/table-pagination";
import { DateRange } from "react-day-picker";
import { subWeeks, format } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { ApprovalActionsModal } from "../components/ApprovalActionsModal";
import { toast } from "sonner";

export default function OwnerTimesheetApprovalsPage() {
    const params = useParams();
    const router = useRouter();
    const { activeOrgId } = useWorkspace();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const today = new Date();
    const [dateRange, setDateRange] = useState<DateRange>({
        from: subWeeks(today, 8),
        to: today,
    });

    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [selectedTimesheet, setSelectedTimesheet] = useState<ITimesheet | null>(null);
    const approveMutation = useApproveTimesheet();
    const rejectMutation = useRejectTimesheet();

    const handleApproveClick = (row: ITimesheet) => {
        setSelectedTimesheet(row);
        setActionModalOpen(true);
    };

    const handleApprove = async () => {
        if (selectedTimesheet && "id" in selectedTimesheet) {
            try {
                await approveMutation.mutateAsync((selectedTimesheet as any).id);
                toast.success("Timesheet approved successfully");
            } catch (error) {
                console.error("Failed to approve timesheet:", error);
                toast.error("Failed to approve timesheet. Please try again.");
            }
        }
    };

    const handleReject = async (reason?: string) => {
        if (selectedTimesheet && "id" in selectedTimesheet) {
            try {
                await rejectMutation.mutateAsync({
                    timesheetId: (selectedTimesheet as any).id,
                    reason,
                });
                toast.success("Timesheet rejected successfully");
            } catch (error) {
                console.error("Failed to reject timesheet:", error);
                toast.error("Failed to reject timesheet. Please try again.");
            }
        }
    };

    const fetchParams = {
        search,
        dateFrom: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") + "T00:00:00.000Z" : undefined,
        dateTo: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") + "T23:59:59.999Z" : undefined,
        page,
        limit: rowsPerPage,
        orgId: activeOrgId,
        ...(statusFilter && { status: statusFilter }),
    };

    const { data: timesheetsData, isLoading } = useFetchOwnerTimesheets(fetchParams);

    const columns: TableColumn<ITimesheet>[] = [
        { header: "User", key: "user" },
        {
            header: "Pay Period",
            key: "startDate",
            render: (_, row) => {
                if (!row?.startDate || !row?.endDate) return "-";
                const formatDate = (date: Date | string) =>
                    new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    });

                return `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`;
            },
        },
        {
            header: "Regular Hours",
            key: "regularHours",
        },
        {
            header: "Manual Time",
            key: "manualTime",
            render: (value) => {
                if (!value) return "";
                return <Badge variant="default">{value} hrs</Badge>;
            },
        },
        {
            header: "Total Worked Hours",
            key: "totalWorkedHours",
            render: (value) => (
                <Badge variant="default">{value} hrs</Badge>
            ),
        },
        {
            header: "Activity Level",
            key: "activityLevel",
            render: (value) => (
                <Badge variant="default">{value}</Badge>
            ),
        },
        {
            header: "Submitted On",
            key: "submittedOn",
            render: (value) => {
                if (!value) return "-";
                return new Date(value).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
            },
        },
        {
            header: "Status",
            key: "status",
            render: (value) => <Badge>{value}</Badge>,
        },
        {
            header: "Screenshots",
            key: "screenshotCount",
            render: (value) => (
                <Badge variant="default">{value}</Badge>
            ),
        },
        {
            header: "",
            key: "actions",
            width: "50px",
            render: (_, row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                            if (typeof window !== 'undefined') {
                                sessionStorage.setItem('timesheetData', JSON.stringify(row));
                            }
                            router.push(`/dashboard/${params?.orgId}/timesheets/approvals/${(row as any).id}`);
                        }}>
                            View
                        </DropdownMenuItem>
                        {row.status === 'submitted' && (
                            <>
                                <DropdownMenuItem onClick={() => handleApproveClick(row)}>
                                    Approve/Reject
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const response = timesheetsData as any;
    const rawTimesheets = Array.isArray(timesheetsData)
        ? timesheetsData
        : response?.results || [];

    // Filter out open timesheets - owners should only see submitted, approved, and rejected
    const filteredTimesheets = rawTimesheets.filter((t: ITimesheet) => t.status !== 'open');

    // Sort timesheets: submitted on top, then by date
    const timesheets = [...filteredTimesheets].sort((a: ITimesheet, b: ITimesheet) => {
        // If one is submitted and the other isn't, submitted comes first
        if (a.status === 'submitted' && b.status !== 'submitted') return -1;
        if (a.status !== 'submitted' && b.status === 'submitted') return 1;
        // Otherwise maintain original order (or sort by date if needed)
        return 0;
    });

    const totalResults = Array.isArray(timesheetsData)
        ? timesheets.length
        : response?.totalResults ?? timesheets.length;

    const totalPages = Array.isArray(timesheetsData)
        ? Math.max(1, Math.ceil(totalResults / rowsPerPage))
        : response?.totalPages ?? Math.max(1, Math.ceil(totalResults / rowsPerPage));

    const statusCounts = {
        all: totalResults,
        submitted: timesheets.filter((t: ITimesheet) => t.status === 'submitted').length,
        approved: timesheets.filter((t: ITimesheet) => t.status === 'approved').length,
        rejected: timesheets.filter((t: ITimesheet) => t.status === 'rejected').length,
    };

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    return (
        <div className="flex flex-col h-full min-w-0">
            <PageHeader
                title="Timesheet Approvals (Owner View)"
                breadcrumbs={[
                    {
                        label: "Dashboard",
                        href: `/dashboard/${params?.orgId}`,
                        active: false,
                    },
                    {
                        label: "Timesheets",
                        href: `/dashboard/${params?.orgId}/timesheets`,
                        active: false,
                    },
                    {
                        label: "Approvals",
                        href: `#`,
                        active: true,
                    },
                ]}
            />

            <div className="flex-1 min-w-0 flex flex-col p-4">
                <div className="flex items-center justify-between shrink-0 mb-4">
                    <DebouncedSearch
                        onSearch={(val) => {
                            setSearch(val);
                            setPage(1);
                        }}
                        placeholder="Search users..."
                        wrapperClassName="max-w-sm"
                    />

                    <DatePickerWithRange
                        date={dateRange}
                        setDate={(range: any) => {
                            setDateRange(range);
                            setPage(1);
                        }}
                        className="w-[300px]"
                    />
                </div>

                <div className="flex-1 min-w-0 mt-4">
                    <div className="h-full w-full overflow-hidden rounded-lg border bg-card">
                        <div className="flex items-center gap-2 shrink-0 mb-1 justify-end p-2">
                            {['all', 'submitted', 'approved', 'rejected'].map((status) => (
                                <Button
                                    key={status}
                                    variant={statusFilter === (status === 'all' ? null : status) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setStatusFilter(status === 'all' ? null : status);
                                        setPage(1);
                                    }}
                                    className="capitalize"
                                >
                                    {status} ({statusCounts[status as keyof typeof statusCounts]})
                                </Button>
                            ))}
                        </div>

                        <div className="min-w-full h-full overflow-auto border-t">
                            <div className="min-w-full">
                                <Table
                                    data={timesheets}
                                    columns={columns}
                                    loading={isLoading}
                                    emptyMessage="No timesheets found"
                                />
                            </div>
                        </div>
                    </div>

                    <TablePagination
                        count={totalResults}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <ApprovalActionsModal
                open={actionModalOpen}
                onOpenChange={setActionModalOpen}
                selectedTimesheet={selectedTimesheet}
                isLoading={approveMutation.isPending || rejectMutation.isPending}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}
