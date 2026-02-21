"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function RemoveFromProjectModal({
    open,
    onOpenChange,
    staffName,
    projectName,
    onConfirm,
    isPending,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    staffName: string
    projectName: string
    onConfirm: () => void | Promise<void>
    isPending?: boolean
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Remove from Project?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove {staffName} from "{projectName}"?
                        <br />
                        <br />
                        This will unassign them from this project only. Their profile and other project assignments will remain unchanged.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={async () => {
                            await onConfirm()
                        }}
                        disabled={isPending}
                    >
                        {isPending ? "Removing..." : "Remove"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
