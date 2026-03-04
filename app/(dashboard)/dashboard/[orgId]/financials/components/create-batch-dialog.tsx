"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useFetchPayments, useCreatePaymentBatch } from "@/services/payments";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { IPaymentRecord } from "@/interfaces/payments.interfaces";

export type CreateMode = "all" | "dateRange";

const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export function CreateBatchDialog({
    orgId,
    open,
    mode,
    onClose,
    onSuccess,
}: {
    orgId: string;
    open: boolean;
    mode: CreateMode | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [step, setStep] = useState<"pickDates" | "review">("pickDates");
    const [batchDateRange, setBatchDateRange] = useState<DateRange | undefined>(undefined);
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
    const [shouldFetch, setShouldFetch] = useState(false);

    const createBatchMutation = useCreatePaymentBatch();

    // Reset & initialise when dialog opens
    useEffect(() => {
        if (open) {
            setRemovedIds(new Set());
            if (mode === "all") {
                setStep("review");
                setShouldFetch(true);
            } else {
                setStep("pickDates");
                setBatchDateRange(undefined);
                setShouldFetch(false);
            }
        } else {
            setShouldFetch(false);
        }
    }, [open, mode]);

    const fetchParams: Record<string, any> = {
        paymentStatus: "notpaid",
        status: "approved",
        limit: 1000,
    };
    if (mode === "dateRange" && batchDateRange?.from) {
        fetchParams.dateFrom = format(batchDateRange.from, "yyyy-MM-dd") + "T00:00:00.000Z";
    }
    if (mode === "dateRange" && batchDateRange?.to) {
        fetchParams.dateTo = format(batchDateRange.to, "yyyy-MM-dd") + "T23:59:59.999Z";
    }

    const { data: pendingData, isLoading: isFetching } = useFetchPayments(
        orgId,
        fetchParams,
        shouldFetch,
    );

    const r = pendingData as any;
    const allTimesheets: IPaymentRecord[] = Array.isArray(pendingData)
        ? (pendingData as IPaymentRecord[])
        : r?.results ?? r?.data ?? [];

    const selectedTimesheets = allTimesheets.filter(
        (t) => !removedIds.has(t.timesheetId ?? t._id ?? ""),
    );

    const handleRemove = (id: string) =>
        setRemovedIds((prev) => new Set([...prev, id]));

    const handleProceed = async () => {
        const timesheetIds = selectedTimesheets
            .map((t) => t.timesheetId ?? t._id ?? "")
            .filter(Boolean);
        if (timesheetIds.length === 0) {
            toast.error("No timesheets selected.");
            return;
        }
        try {
            await createBatchMutation.mutateAsync({ organizationId: orgId, timesheetIds });
            toast.success("Payment batch created successfully.");
            onSuccess();
            onClose();
        } catch {
            toast.error("Failed to create payment batch. Please try again.");
        }
    };

    const totalAmount = selectedTimesheets.reduce((sum, t) => sum + (t.totalAmount ?? 0), 0);
    const currency = selectedTimesheets[0]?.currency ?? "";

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="w-[98vw] max-w-[98vw] sm:max-w-[98vw] h-[96vh] max-h-[96vh] flex flex-col gap-0 p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <DialogTitle className="text-lg">
                        {step === "pickDates" ? "Select Date Range" : "Review Timesheets"}
                    </DialogTitle>
                </DialogHeader>

                {/* Step 1 – date range picker (dateRange mode only) */}
                {step === "pickDates" && (
                    <div className="flex flex-col gap-5 px-6 py-6 flex-1">
                        <p className="text-sm text-muted-foreground">
                            Select the date range to include pending approved timesheets.
                        </p>
                        <DatePickerWithRange
                            date={batchDateRange}
                            setDate={(r: any) => setBatchDateRange(r)}
                            className="w-full max-w-sm"
                        />
                        <DialogFooter className="mt-auto pt-4 border-t">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                disabled={!batchDateRange?.from}
                                onClick={() => {
                                    setShouldFetch(true);
                                    setStep("review");
                                }}
                            >
                                Load Timesheets
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* Step 2 – review / remove timesheets */}
                {step === "review" && (
                    <div className="flex flex-col flex-1 min-h-0">
                        {isFetching ? (
                            <div className="flex items-center justify-center flex-1 gap-2 text-muted-foreground py-20">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading pending timesheets…</span>
                            </div>
                        ) : selectedTimesheets.length === 0 && allTimesheets.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-20 text-center flex-1">
                                No pending approved timesheets found.
                            </p>
                        ) : (
                            <>
                                {/* Summary bar */}
                                <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30 shrink-0 text-sm">
                                    <span className="text-muted-foreground">
                                        <span className="font-semibold text-foreground">
                                            {selectedTimesheets.length}
                                        </span>{" "}
                                        timesheet(s) selected
                                        {removedIds.size > 0 && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                · {removedIds.size} removed
                                            </span>
                                        )}
                                    </span>
                                    <span className="font-semibold">
                                        Total: {currency}{" "}
                                        {totalAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>

                                {/* Scrollable table */}
                                <div className="flex-1 overflow-auto min-h-0">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 z-10 bg-background border-b">
                                            <tr>
                                                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                                                    Employee
                                                </th>
                                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                                                    Pay Period
                                                </th>
                                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                                                    Approval
                                                </th>
                                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                    Logged Hrs
                                                </th>
                                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                    Holiday Hrs
                                                </th>
                                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                    PTO Hrs
                                                </th>
                                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                    Amount
                                                </th>
                                                <th className="w-10" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedTimesheets.map((t) => {
                                                const id = t.timesheetId ?? t._id ?? "";
                                                const initials = (t.userName ?? "?")
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()
                                                    .slice(0, 2);
                                                return (
                                                    <tr
                                                        key={id}
                                                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                                    >
                                                        <td className="px-6 py-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <Avatar className="h-7 w-7">
                                                                    {t.userAvatar && (
                                                                        <AvatarImage
                                                                            src={t.userAvatar}
                                                                            alt={t.userName ?? ""}
                                                                        />
                                                                    )}
                                                                    <AvatarFallback className="text-xs">
                                                                        {initials}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="font-medium">
                                                                    {t.userName ?? "—"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                            {formatDate(t.startDate)} –{" "}
                                                            {formatDate(t.endDate)}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="capitalize text-muted-foreground">
                                                                {t.status ?? "—"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right tabular-nums">
                                                            {Number(t.totalLoggedHours ?? 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                                            {Number(t.totalHolidayHours ?? 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                                            {Number(t.totalPtoHours ?? 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right tabular-nums font-semibold">
                                                            {t.currency}{" "}
                                                            {Number(t.totalAmount ?? 0).toLocaleString(
                                                                undefined,
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                },
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleRemove(id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        <DialogFooter className="px-6 py-4 border-t shrink-0">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            {mode === "dateRange" && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStep("pickDates");
                                        setShouldFetch(false);
                                    }}
                                >
                                    Back
                                </Button>
                            )}
                            <Button
                                onClick={handleProceed}
                                disabled={
                                    createBatchMutation.isPending ||
                                    isFetching ||
                                    selectedTimesheets.length === 0
                                }
                            >
                                {createBatchMutation.isPending && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Proceed ({selectedTimesheets.length})
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
