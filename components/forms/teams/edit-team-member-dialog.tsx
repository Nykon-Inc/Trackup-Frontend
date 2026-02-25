"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EditTeamMemberForm } from "./edit-team-member-form";

interface EditTeamMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        memberId?: string;
        payRate?: number;
        startDate?: string | null;
        birthday?: string | null;
    } | null;
    onSuccess?: () => void;
    onSubmit?: (values: {
        id: string;
        name: string;
        email: string;
        role: string;
        memberId?: string;
        payRate?: number;
        startDate?: string | null;
        birthday?: string | null;
    }) => Promise<void>;
    roleOptions?: Array<{ id: string; label: string }>;
    title?: string;
    showExtendedFields?: boolean;
}

export function EditTeamMemberDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
    onSubmit,
    roleOptions,
    title,
    showExtendedFields,
}: EditTeamMemberDialogProps) {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title || "Edit Team Member"}</DialogTitle>
                </DialogHeader>
                <EditTeamMemberForm
                    user={user}
                    onClose={() => onOpenChange(false)}
                    onSuccess={onSuccess}
                    onSubmit={onSubmit}
                    roleOptions={roleOptions}
                    showExtendedFields={showExtendedFields}
                />
            </DialogContent>
        </Dialog>
    );
}
