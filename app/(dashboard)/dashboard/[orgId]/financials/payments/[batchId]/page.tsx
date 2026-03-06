"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useParams, useSearchParams } from "next/navigation";
import { MoreHorizontal, CheckCircle, Eye, CalendarRange, Hash, User, Play } from "lucide-react";
import Table, { TableColumn } from "@/components/ui/data-table";
import {
    useFetchPaymentBatch,
    useFetchPayments,
    useProcessPayment,
    useProcessBatch,
} from "@/services/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/ui/table-pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    IPaymentBatch,
    IPaymentRecord,
    IPaymentItem,
    IProjectBreakdown,
} from "@/interfaces/payments.interfaces";

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

function BatchMetaCard({
    batch,
    onProcess,
    isProcessing,
}: {
    batch: IPaymentBatch;
    onProcess: () => void;
    isProcessing: boolean;
}) {
    const items = [
        {
            icon: CalendarRange,
            label: "Created On",
            value: formatDate(batch.createdOn),
        },
        {
            icon: Hash,
            label: "Timesheets",
            value: `${batch.processedCount ?? 0} / ${batch.totalTimesheets ?? 0} processed`,
        },
        {
            icon: User,
            label: "Initiated By",
            value: batch.initiatedBy?.name ?? batch.initiatedBy?.email ?? "—",
        },
        {
            icon: CalendarRange,
            label: "Processed At",
            value: formatDate(batch.processedAt),
        },
    ];

    return (
        <div className="rounded-lg border bg-card p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Batch Details
                </h2>
                <div className="flex items-center gap-2">
                    {batch.status && (
                        <Badge
                            variant={batch.status === "completed" ? "default" : "secondary"}
                            className="capitalize"
                        >
                            {batch.status}
                        </Badge>
                    )}
                    {batch.status === "pending" && (
                        <Button
                            size="sm"
                            onClick={onProcess}
                            disabled={isProcessing}
                        >
                            <Play className="h-3.5 w-3.5 mr-1.5" />
                            {isProcessing ? "Processing…" : "Process Batch"}
                        </Button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                {items.map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                        <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {label}
                        </p>
                        <p className="text-sm font-medium">{String(value)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function PaymentBatchDetailPage() {
    const params = useParams();
    const { activeOrgId } = useWorkspace();

    const orgId = activeOrgId ?? (params?.orgId as string) ?? "";
    const batchId = params?.batchId as string;

    const searchParams = useSearchParams();

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
    const [detailRecord, setDetailRecord] = useState<IPaymentRecord | null>(null);

    const { data: batchData, isLoading: batchLoading } = useFetchPaymentBatch(orgId, batchId);
    const batch = batchData as IPaymentBatch | undefined;

    const processPaymentMutation = useProcessPayment();
    const processBatchMutation = useProcessBatch();

    const handleProcessBatch = async () => {
        try {
            await processBatchMutation.mutateAsync(batchId);
            toast.success("Batch processed successfully.");
        } catch {
            toast.error("Failed to process batch. Please try again.");
        }
    };

    // paymentIds passed from the batches list page via query param (enables immediate fetch)
    const paymentIdsFromUrl = batch?.paymentIds ?? searchParams.get("paymentIds") ?? "";

    // Prefer URL-provided paymentIds for an immediate fetch; fall back to batch timesheetIds
    const batchTimesheetIds = batch?.timesheetIds ?? [];
    const canFetch = paymentIdsFromUrl.length > 0 || batchTimesheetIds.length > 0;

    const fetchParams = {
        timesheetIds: batchTimesheetIds.join(",") || undefined,
        ...(paymentIdsFromUrl && { paymentIds: paymentIdsFromUrl }),
        page,
        limit: rowsPerPage,
        ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
    };

    const { data: paymentsData, isLoading: paymentsLoading } = useFetchPayments(
        orgId,
        fetchParams,
        canFetch,
    );

    const isLoading = batchLoading || paymentsLoading;

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

    const columns: TableColumn<IPaymentRecord>[] = [
        {
            header: "Employee",
            key: "userName",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
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
                    <span className="font-medium">{row.userName ?? "—"}</span>
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailRecord(row)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleMarkPaid(row)}
                            disabled={
                                processPaymentMutation.isPending ||
                                row.paymentStatus === "paid"
                            }
                        >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Process Payment
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const paymentCounts = {
        all: totalResults,
        paid: records.filter((r) => r.paymentStatus === "paid").length,
        unpaid: records.filter((r) => r.paymentStatus !== "paid").length,
    };

    return (
        <div className="flex flex-col h-full min-w-0">
            <PageHeader
                title={
                    batch
                        ? `Batch · ${formatDate(batch.createdOn)}`
                        : "Payment Batch"
                }
                breadcrumbs={[
                    {
                        label: "Dashboard",
                        href: `/dashboard/${params?.orgId}`,
                        active: false,
                    },
                    {
                        label: "Financials",
                        href: `/dashboard/${params?.orgId}/financials`,
                        active: false,
                    },
                    {
                        label: "Payments",
                        href: `/dashboard/${params?.orgId}/financials/payments`,
                        active: false,
                    },
                    {
                        label: "Batch",
                        href: `/dashboard/${params?.orgId}/financials/payments/${batchId}`,
                        active: true,
                    },
                ]}
            />

            <div className="flex-1 min-w-0 flex flex-col p-4">
                {/* Batch metadata card */}
                {!batchLoading && batch && (
                    <BatchMetaCard
                        batch={batch}
                        onProcess={handleProcessBatch}
                        isProcessing={processBatchMutation.isPending}
                    />
                )}

                {/* Payment status filter toolbar */}
                <div className="flex items-center gap-2 mb-4 justify-end">
                    {(
                        [
                            { key: null, label: "All" },
                            { key: "notpaid", label: "Unpaid" },
                            { key: "paid", label: "Paid" },
                        ] as { key: string | null; label: string }[]
                    ).map(({ key, label }) => (
                        <Button
                            key={label}
                            variant={paymentStatusFilter === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                setPaymentStatusFilter(key);
                                setPage(1);
                            }}
                        >
                            {label} (
                            {key === null
                                ? paymentCounts.all
                                : key === "paid"
                                ? paymentCounts.paid
                                : paymentCounts.unpaid}
                            )
                        </Button>
                    ))}
                </div>

                {/* Table */}
                <div className="flex-1 min-w-0">
                    <div className="w-full overflow-hidden rounded-lg border bg-card">
                        <div className="min-w-full overflow-auto">
                            <Table
                                data={records}
                                columns={columns}
                                loading={isLoading}
                                emptyMessage="No payments found in this batch."
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

            {/* Details dialog */}
            <Dialog open={!!detailRecord} onOpenChange={(open) => !open && setDetailRecord(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                    </DialogHeader>
                    {detailRecord && (
                        <div className="space-y-4 text-sm">
                            {/* Employee */}
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    {detailRecord.userAvatar && (
                                        <AvatarImage
                                            src={detailRecord.userAvatar}
                                            alt={detailRecord.userName ?? ""}
                                        />
                                    )}
                                    <AvatarFallback>
                                        {(detailRecord.userName ?? "?")
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-base">
                                        {detailRecord.userName ?? "—"}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {formatDate(detailRecord.startDate)} –{" "}
                                        {formatDate(detailRecord.endDate)}
                                    </p>
                                </div>
                            </div>

                            {/* Summary grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border p-3">
                                <div>
                                    <p className="text-muted-foreground text-xs">Logged Hours</p>
                                    <p className="font-medium">
                                        {Number(detailRecord.totalLoggedHours ?? 0).toFixed(2)} hrs
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Holiday Hours</p>
                                    <p className="font-medium">
                                        {Number(detailRecord.totalHolidayHours ?? 0).toFixed(2)} hrs
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">PTO Hours</p>
                                    <p className="font-medium">
                                        {Number(detailRecord.totalPtoHours ?? 0).toFixed(2)} hrs
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Total Amount</p>
                                    <p className="font-semibold">
                                        {detailRecord.currency}{" "}
                                        {Number(detailRecord.totalAmount ?? 0).toLocaleString(
                                            undefined,
                                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Approval Status</p>
                                    <Badge variant="default" className="capitalize mt-0.5">
                                        {detailRecord.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Payment Status</p>
                                    <Badge
                                        variant={paymentStatusVariant(
                                            detailRecord.paymentStatus ?? null
                                        )}
                                        className={cn(
                                            "capitalize mt-0.5",
                                            detailRecord.paymentStatus === "paid" &&
                                                "bg-green-100 text-green-800 hover:bg-green-100"
                                        )}
                                    >
                                        {paymentStatusLabel(detailRecord.paymentStatus ?? null)}
                                    </Badge>
                                </div>
                                {detailRecord.approvedOn && (
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground text-xs">Approved On</p>
                                        <p className="font-medium">
                                            {formatDate(detailRecord.approvedOn)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Project breakdowns */}
                            {detailRecord.projectBreakdowns?.length > 0 && (
                                <div>
                                    <p className="font-medium mb-2">Project Breakdown</p>
                                    <div className="rounded-lg border overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="text-left px-3 py-2 font-medium">
                                                        Project
                                                    </th>
                                                    <th className="text-right px-3 py-2 font-medium">
                                                        Hours
                                                    </th>
                                                    <th className="text-right px-3 py-2 font-medium">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailRecord.projectBreakdowns.map(
                                                    (pb: IProjectBreakdown, i: number) => (
                                                        <tr
                                                            key={pb.projectId ?? i}
                                                            className="border-b last:border-0"
                                                        >
                                                            <td className="px-3 py-2">
                                                                {pb.projectName ?? pb.projectId}
                                                            </td>
                                                            <td className="px-3 py-2 text-right tabular-nums">
                                                                {Number(pb.hours ?? 0).toFixed(2)}
                                                            </td>
                                                            <td className="px-3 py-2 text-right tabular-nums">
                                                                {detailRecord.currency}{" "}
                                                                {Number(
                                                                    pb.amount ?? 0
                                                                ).toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-2 pt-1">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        handleMarkPaid(detailRecord);
                                        setDetailRecord(null);
                                    }}
                                    disabled={
                                        processPaymentMutation.isPending ||
                                        detailRecord.paymentStatus === "paid"
                                    }
                                    className="flex-1"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Process Payment
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
