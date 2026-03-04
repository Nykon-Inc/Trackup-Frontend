"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useParams, useRouter } from "next/navigation";
import { Eye, Plus, ChevronDown, CalendarDays, Layers } from "lucide-react";
import Table, { TableColumn } from "@/components/ui/data-table";
import { useFetchPaymentBatches } from "@/services/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import TablePagination from "@/components/ui/table-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { format, subWeeks } from "date-fns";
import { DateRange } from "react-day-picker";
import { IPaymentBatch } from "@/interfaces/payments.interfaces";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateBatchDialog, CreateMode } from "../components/create-batch-dialog";

const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const batchStatusVariant = (
    status: string | null | undefined
): "default" | "secondary" | "outline" => {
    if (status === "completed") return "default";
    if (status === "processing" || status === "pending") return "secondary";
    return "outline";
};

function UserCell({ user }: { user: IPaymentBatch["initiatedBy"] }) {
    if (!user) return <span className="text-muted-foreground">—</span>;
    const initials = (user.name ?? user.email ?? "?")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    return (
        <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name ?? ""} />}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span>{user.name ?? user.email ?? "—"}</span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentBatchesPage() {
    const params = useParams();
    const router = useRouter();
    const { activeOrgId } = useWorkspace();

    const orgId = activeOrgId ?? (params?.orgId as string) ?? "";

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [createBatchOpen, setCreateBatchOpen] = useState(false);
    const [createBatchMode, setCreateBatchMode] = useState<CreateMode | null>(null);

    const today = new Date();
    const [dateRange, setDateRange] = useState<DateRange>({
        from: subWeeks(today, 8),
        to: today,
    });

    const fetchParams = {
        dateFrom: dateRange?.from
            ? format(dateRange.from, "yyyy-MM-dd") + "T00:00:00.000Z"
            : undefined,
        dateTo: dateRange?.to
            ? format(dateRange.to, "yyyy-MM-dd") + "T23:59:59.999Z"
            : undefined,
        page,
        limit: rowsPerPage,
    };

    const { data: batchesData, isLoading } = useFetchPaymentBatches(orgId, fetchParams);

    const response = batchesData as any;
    const batches: IPaymentBatch[] = Array.isArray(batchesData)
        ? batchesData
        : response?.results ?? response?.data ?? [];

    const totalResults: number = Array.isArray(batchesData)
        ? batches.length
        : response?.totalResults ?? response?.total ?? batches.length;

    const totalPages = Math.max(1, Math.ceil(totalResults / rowsPerPage));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const columns: TableColumn<IPaymentBatch>[] = [
        {
            header: "Created On",
            key: "createdOn",
            render: (value) => (
                <span className="whitespace-nowrap">{formatDate(value)}</span>
            ),
        },
        {
            header: "Timesheets",
            key: "totalTimesheets",
            align: "right",
            render: (value) => (
                <span className="tabular-nums font-medium">{value ?? 0}</span>
            ),
        },
        {
            header: "Processed",
            key: "processedCount",
            align: "right",
            render: (value, row) => (
                <span className="tabular-nums text-muted-foreground">
                    {value ?? 0} / {row.totalTimesheets ?? 0}
                </span>
            ),
        },
        {
            header: "Amount",
            key: "totalAmount",
            align: "right",
            render: (value, row) => (
                <span className="tabular-nums font-semibold">
                    {row.currency} {Number(value ?? 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            ),
        },
        {
            header: "Initiated By",
            key: "initiatedBy",
            render: (_, row) => <UserCell user={row.initiatedBy} />,
        },
        {
            header: "Processed At",
            key: "processedAt",
            render: (value) => formatDate(value),
        },
        {
            header: "Status",
            key: "status",
            render: (value) => (
                <Badge variant={batchStatusVariant(value)} className="capitalize">
                    {value ?? "—"}
                </Badge>
            ),
        },
        {
            header: "",
            key: "actions",
            width: "60px",
            render: (_, row) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                        router.push(
                            `/dashboard/${params?.orgId}/financials/payments/${row.id}`
                        )
                    }
                >
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full min-w-0">
            <PageHeader
                title="Payment Batches"
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
                        active: true,
                    },
                ]}
            />

            <div className="flex-1 min-w-0 flex flex-col p-4">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 mb-4">
                    <DatePickerWithRange
                        date={dateRange}
                        setDate={(range: any) => {
                            setDateRange(range);
                            setPage(1);
                        }}
                        className="w-[300px]"
                    />
                    <div className="ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-1.5" />
                                    Create Batch
                                    <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCreateBatchMode("all");
                                        setCreateBatchOpen(true);
                                    }}
                                >
                                    <Layers className="h-4 w-4 mr-2" />
                                    All pending timesheets
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCreateBatchMode("dateRange");
                                        setCreateBatchOpen(true);
                                    }}
                                >
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    By date range
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Table card */}
                <div className="flex-1 min-w-0">
                    <div className="w-full overflow-hidden rounded-lg border bg-card">
                        <div className="min-w-full overflow-auto">
                            <Table
                                data={batches}
                                columns={columns}
                                loading={isLoading}
                                emptyMessage="No payment batches found."
                                rowKey={(row) => row.id ?? ""}
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

            <CreateBatchDialog
                orgId={orgId}
                open={createBatchOpen}
                mode={createBatchMode}
                onClose={() => setCreateBatchOpen(false)}
                onSuccess={() => setPage(1)}
            />
        </div>
    );
}
