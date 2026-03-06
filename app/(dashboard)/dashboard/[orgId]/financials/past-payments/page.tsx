"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useParams } from "next/navigation";
import { Search, X, Eye } from "lucide-react";
import Table, { TableColumn } from "@/components/ui/data-table";
import { useFetchPayments, useProcessPayment, useMarkPaymentUnpaid } from "@/services/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TablePagination from "@/components/ui/table-pagination";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IPaymentRecord, IProjectBreakdown, IPaymentItem } from "@/interfaces/payments.interfaces";
import { format, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { useDebounce } from "@/hooks/use-debounce";
import { PaymentDetailDialog } from "../components/payment-detail-dialog";

const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const paymentStatusVariant = (status: string | null) => {
    if (status === "paid") return "default" as const;
    return "secondary" as const;
};

const paymentStatusLabel = (status: string | null) => {
    if (status === "paid") return "Paid";
    return "Unpaid";
};

export default function PastPaymentsPage() {
    const params = useParams();
    const { activeOrgId } = useWorkspace();
    const orgId = activeOrgId ?? (params?.orgId as string) ?? "";

    const today = new Date();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    const [paymentStatus, setPaymentStatus] = useState<string>("all");
    const [approvalStatus, setApprovalStatus] = useState<string>("all");
    const [dateRange, setDateRange] = useState<DateRange>({
        from: subMonths(today, 3),
        to: today,
    });
    const [detailRecord, setDetailRecord] = useState<IPaymentRecord | null>(null);

    const processPaymentMutation = useProcessPayment();
    const markUnpaidMutation = useMarkPaymentUnpaid();

    const fetchParams = {
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(paymentStatus !== "all" && { paymentStatus }),
        ...(approvalStatus !== "all" && { status: approvalStatus }),
        ...(dateRange?.from && {
            dateFrom: format(dateRange.from, "yyyy-MM-dd") + "T00:00:00.000Z",
        }),
        ...(dateRange?.to && {
            dateTo: format(dateRange.to, "yyyy-MM-dd") + "T23:59:59.999Z",
        }),
        page,
        limit: rowsPerPage,
    };

    const { data: paymentsData, isLoading } = useFetchPayments(orgId, fetchParams);

    const response = paymentsData as any;
    const records: IPaymentRecord[] = Array.isArray(paymentsData)
        ? paymentsData
        : response?.results ?? response?.data ?? [];

    const totalResults: number = Array.isArray(paymentsData)
        ? records.length
        : response?.totalResults ?? response?.total ?? records.length;

    const totalPages = Math.max(1, Math.ceil(totalResults / rowsPerPage));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const handleMarkPaid = async (record: IPaymentRecord) => {
        const timesheetId = record.timesheetId ?? record._id ?? "";
        if (!timesheetId) {
            toast.error("Unable to process payment: timesheet ID is missing.");
            return;
        }
        const paymentItem: IPaymentItem = {
            userId: record.userId,
            timesheetId,
            timesheetStartDate: new Date(record.startDate),
            timesheetEndDate: new Date(record.endDate),
            totalLoggedHours: record.totalLoggedHours,
            totalHolidayHours: record.totalHolidayHours,
            totalPtoHours: record.totalPtoHours,
            projectBreakdowns: record.projectBreakdowns,
            totalAmount: record.totalAmount,
            currency: record.currency,
        };
        try {
            await processPaymentMutation.mutateAsync({
                organizationId: record.organizationId,
                timesheetId,
                paymentItems: paymentItem,
                totalAmount: record.totalAmount,
                currency: record.currency,
            });
            toast.success(`Payment for ${record.userName ?? "user"} processed successfully.`);
        } catch {
            toast.error("Failed to process payment. Please try again.");
        }
    };

    const handleMarkUnpaid = async (record: IPaymentRecord) => {
        const timesheetId = record.timesheetId ?? record._id ?? "";
        if (!timesheetId) {
            toast.error("Unable to mark as unpaid: timesheet ID is missing.");
            return;
        }
        try {
            await markUnpaidMutation.mutateAsync({ timesheetId });
            toast.success(`Payment for ${record.userName ?? "user"} marked as unpaid.`);
        } catch {
            toast.error("Failed to mark as unpaid. Please try again.");
        }
    };

    const hasActiveFilters =
        !!debouncedSearch ||
        paymentStatus !== "all" ||
        approvalStatus !== "all";

    const clearFilters = () => {
        setSearch("");
        setPaymentStatus("all");
        setApprovalStatus("all");
        setDateRange({ from: subMonths(today, 3), to: today });
        setPage(1);
    };

    const columns: TableColumn<IPaymentRecord>[] = [
        {
            header: "Employee",
            key: "userName",
            width: "200px",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                        {row.userAvatar && (
                            <AvatarImage src={row.userAvatar} alt={row.userName ?? ""} />
                        )}
                        <AvatarFallback className="text-xs">
                            {(row.userName ?? "?")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium whitespace-nowrap">{row.userName ?? "—"}</span>
                </div>
            ),
        },
        {
            header: "Pay Period",
            key: "startDate",
            width: "220px",
            render: (_, row) =>
                row.startDate && row.endDate ? (
                    <span className="whitespace-nowrap">
                        {formatDate(row.startDate)} – {formatDate(row.endDate)}
                    </span>
                ) : (
                    "—"
                ),
        },
        {
            header: "Logged Hrs",
            key: "totalLoggedHours",
            align: "right",
            render: (value) => (
                <span className="tabular-nums">{Number(value ?? 0).toFixed(2)}</span>
            ),
        },
        {
            header: "Holiday Hrs",
            key: "totalHolidayHours",
            align: "right",
            render: (value) => (
                <span className="tabular-nums text-muted-foreground">
                    {Number(value ?? 0).toFixed(2)}
                </span>
            ),
        },
        {
            header: "PTO Hrs",
            key: "totalPtoHours",
            align: "right",
            render: (value) => (
                <span className="tabular-nums text-muted-foreground">
                    {Number(value ?? 0).toFixed(2)}
                </span>
            ),
        },
        {
            header: "Amount",
            key: "totalAmount",
            align: "right",
            render: (value, row) => (
                <span className="tabular-nums font-semibold">
                    {row.currency ?? ""}{" "}
                    {Number(value ?? 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            ),
        },
        {
            header: "Approval Status",
            key: "status",
            render: (value) => (
                <Badge
                    variant={value === "approved" ? "default" : "secondary"}
                    className="capitalize"
                >
                    {value ?? "—"}
                </Badge>
            ),
        },
        {
            header: "Payment Status",
            key: "paymentStatus",
            render: (value) => (
                <Badge
                    variant={paymentStatusVariant(value)}
                    className={cn(
                        "capitalize",
                        value === "paid" && "bg-green-100 text-green-800 hover:bg-green-100"
                    )}
                >
                    {paymentStatusLabel(value)}
                </Badge>
            ),
        },
        {
            header: "Approved On",
            key: "approvedOn",
            render: (value) => formatDate(value),
        },
        {
            header: "",
            key: "actions",
            width: "50px",
            render: (_, row) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setDetailRecord(row)}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full min-w-0">
            <PageHeader
                title="Past Payments"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Financials", href: `/dashboard/${params?.orgId}/financials`, active: false },
                    { label: "Past Payments", href: `/dashboard/${params?.orgId}/financials/past-payments`, active: true },
                ]}
            />

            <div className="flex-1 min-w-0 flex flex-col p-4">
                {/* Filters toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    {/* Left: search + date */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search employee…"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-8 h-9 w-[200px]"
                            />
                        </div>

                        <DatePickerWithRange
                            date={dateRange}
                            setDate={(range: any) => {
                                setDateRange(range);
                                setPage(1);
                            }}
                            className="w-[280px]"
                        />
                    </div>

                    {/* Right: status filters + clear */}
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={paymentStatus}
                            onChange={(e) => {
                                setPaymentStatus(e.target.value);
                                setPage(1);
                            }}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-[160px]"
                        >
                            <option value="all">All payment statuses</option>
                            <option value="paid">Paid</option>
                            <option value="notpaid">Unpaid</option>
                        </select>

                        {/* <select
                            value={approvalStatus}
                            onChange={(e) => {
                                setApprovalStatus(e.target.value);
                                setPage(1);
                            }}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-[180px]"
                        >
                            <option value="all">All approval statuses</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select> */}

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 text-muted-foreground"
                                onClick={clearFilters}
                            >
                                <X className="h-3.5 w-3.5 mr-1.5" />
                                Clear filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 min-w-0">
                    <div className="w-full overflow-hidden rounded-lg border bg-card">
                        <div className="min-w-full overflow-auto">
                            <Table
                                data={records}
                                columns={columns}
                                loading={isLoading}
                                emptyMessage="No payments found."
                                rowKey={(row) => row.timesheetId ?? row._id ?? ""}
                            />
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

            <PaymentDetailDialog
                record={detailRecord}
                onClose={() => setDetailRecord(null)}
                onProcess={handleMarkPaid}
                isProcessing={processPaymentMutation.isPending}
                onMarkUnpaid={handleMarkUnpaid}
                isMarkingUnpaid={markUnpaidMutation.isPending}
                hideActions
            />
        </div>
    );
}
