"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { ITimesheet } from "@/interfaces/timesheet.interfaces";

interface SubmitTimesheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTimesheet: ITimesheet | null;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function SubmitTimesheetModal({
  open,
  onOpenChange,
  selectedTimesheet,
  isLoading = false,
  onConfirm,
}: SubmitTimesheetModalProps) {
  const isEndDateNotReached = (timesheet: ITimesheet | null) => {
    if (!timesheet?.endDate) return false;
    const endDate = new Date(timesheet.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return endDate > today;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Submit Timesheet</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {isEndDateNotReached(selectedTimesheet)
              ? `This timesheet's end date (${new Date(
                  selectedTimesheet?.endDate || ""
                ).toLocaleDateString()}) has not been reached yet.`
              : "Ready to submit this timesheet?"}
          </DialogDescription>
        </DialogHeader>

        {isEndDateNotReached(selectedTimesheet) && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-900">
            <p className="font-medium mb-1">⚠️ Warning:</p>
            <p>
              Submitting now will invalidate the remaining days in this pay
              period. You will not be able to log time for the days after
              today.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={
              isEndDateNotReached(selectedTimesheet)
                ? "bg-amber-600 hover:bg-amber-700"
                : ""
            }
          >
            {isLoading
              ? "Submitting..."
              : isEndDateNotReached(selectedTimesheet)
                ? "Submit Anyway"
                : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
