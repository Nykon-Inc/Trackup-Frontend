"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { ITimesheet } from "@/interfaces/timesheet.interfaces";

interface ApprovalActionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTimesheet: ITimesheet | null;
    isLoading: boolean;
    onApprove: () => void;
    onReject: (reason?: string) => void;
}

export const ApprovalActionsModal: React.FC<ApprovalActionsModalProps> = ({
    open,
    onOpenChange,
    selectedTimesheet,
    isLoading,
    onApprove,
    onReject,
}) => {
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectMode, setIsRejectMode] = useState(false);

    const handleClose = () => {
        setRejectionReason("");
        setIsRejectMode(false);
        onOpenChange(false);
    };

    const handleApprove = () => {
        onApprove();
        handleClose();
    };

    const handleReject = () => {
        onReject(rejectionReason);
        handleClose();
    };

    if (!selectedTimesheet) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isRejectMode ? "Reject Timesheet" : "Approve Timesheet"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Timesheet Info */}
                    <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <p className="text-sm">
                            <span className="font-semibold">User:</span> {selectedTimesheet.user || selectedTimesheet.userId}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Total Hours:</span>{" "}
                            {selectedTimesheet.totalWorkedHours} hrs
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Status:</span>{" "}
                            <span className="capitalize">{selectedTimesheet.status}</span>
                        </p>
                    </div>

                    {!isRejectMode ? (
                        <>
                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                <p className="text-sm text-blue-800">
                                    Are you sure you want to approve this timesheet? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsRejectMode(true)}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Reject Instead
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleApprove}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    {isLoading ? "Approving..." : "Approve"}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Rejection Reason (Optional)
                                </label>
                                <Textarea
                                    placeholder="Provide a reason for rejecting this timesheet..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="min-h-24"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsRejectMode(false)}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    {isLoading ? "Rejecting..." : "Reject"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
