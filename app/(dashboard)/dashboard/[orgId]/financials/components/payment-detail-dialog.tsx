"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IPaymentRecord, IProjectBreakdown } from "@/interfaces/payments.interfaces";

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

interface PaymentDetailDialogProps {
    record: IPaymentRecord | null;
    onClose: () => void;
    onProcess: (record: IPaymentRecord) => void;
    isProcessing: boolean;
    onMarkUnpaid?: (record: IPaymentRecord) => void;
    isMarkingUnpaid?: boolean;
    hideActions?: boolean;
}

export function PaymentDetailDialog({
    record,
    onClose,
    onProcess,
    isProcessing,
    onMarkUnpaid,
    isMarkingUnpaid = false,
    hideActions = false,
}: PaymentDetailDialogProps) {
    return (
        <Dialog open={!!record} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                </DialogHeader>
                {record && (
                    <div className="space-y-4 text-sm">
                        {/* Employee */}
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                {record.userAvatar && (
                                    <AvatarImage
                                        src={record.userAvatar}
                                        alt={record.userName ?? ""}
                                    />
                                )}
                                <AvatarFallback>
                                    {(record.userName ?? "?")
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-base">
                                    {record.userName ?? "—"}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {formatDate(record.startDate)} –{" "}
                                    {formatDate(record.endDate)}
                                </p>
                            </div>
                        </div>

                        {/* Summary grid */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border p-3">
                            <div>
                                <p className="text-muted-foreground text-xs">Logged Hours</p>
                                <p className="font-medium">
                                    {Number(record.totalLoggedHours ?? 0).toFixed(2)} hrs
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Holiday Hours</p>
                                <p className="font-medium">
                                    {Number(record.totalHolidayHours ?? 0).toFixed(2)} hrs
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">PTO Hours</p>
                                <p className="font-medium">
                                    {Number(record.totalPtoHours ?? 0).toFixed(2)} hrs
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Total Amount</p>
                                <p className="font-semibold">
                                    {record.currency}{" "}
                                    {Number(record.totalAmount ?? 0).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Approval Status</p>
                                <Badge variant="default" className="capitalize mt-0.5">
                                    {record.status ?? "—"}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Payment Status</p>
                                <Badge
                                    variant={paymentStatusVariant(record.paymentStatus ?? null)}
                                    className={cn(
                                        "capitalize mt-0.5",
                                        record.paymentStatus === "paid" &&
                                            "bg-green-100 text-green-800 hover:bg-green-100"
                                    )}
                                >
                                    {paymentStatusLabel(record.paymentStatus ?? null)}
                                </Badge>
                            </div>
                            {record.approvedOn && (
                                <div className="col-span-2">
                                    <p className="text-muted-foreground text-xs">Approved On</p>
                                    <p className="font-medium">{formatDate(record.approvedOn)}</p>
                                </div>
                            )}
                        </div>

                        {/* Project breakdowns */}
                        {record.projectBreakdowns?.length > 0 && (
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
                                            {record.projectBreakdowns.map(
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
                                                            {record.currency}{" "}
                                                            {Number(pb.amount ?? 0).toLocaleString(
                                                                undefined,
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
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
                        {!hideActions && (
                        <div className="flex gap-2 pt-1">
                            <Button
                                size="sm"
                                onClick={() => {
                                    onProcess(record);
                                    onClose();
                                }}
                                disabled={isProcessing || record.paymentStatus === "paid"}
                                className="flex-1"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Process Payment
                            </Button>
                            {onMarkUnpaid && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        onMarkUnpaid(record);
                                        onClose();
                                    }}
                                    disabled={
                                        isMarkingUnpaid || record.paymentStatus !== "paid"
                                    }
                                    className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Mark as Unpaid
                                </Button>
                            )}
                        </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
