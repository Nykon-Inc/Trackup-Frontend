"use client";

import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { SelectControlled } from "@/components/ui/select-controlled";
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as Yup from "yup";
import { useUpdateInternalUser, useFetchInternalUsers } from "@/services/users";
import { InternalUserRole } from "@/interfaces/auth.interfaces";
import { useState } from "react";

interface EditTeamMemberFormProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        memberId?: string;
        payRate?: number;
        startDate?: string | null;
        birthday?: string | null;
    };
    onClose: () => void;
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
    showExtendedFields?: boolean;
}

const editUserSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    role: Yup.string().required("Role is required"),
});

export function EditTeamMemberForm({ user, onClose, onSuccess, onSubmit, roleOptions, showExtendedFields = false }: EditTeamMemberFormProps) {
    const [roleSearch, setRoleSearch] = useState("");
    const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateInternalUser();
    const { data: usersData } = useFetchInternalUsers({ limit: 1000 });

    // Role options mapping including LEAD_OPERATIONS
    const standardRoleOptions = [
        { id: InternalUserRole.OPERATIONS, label: "Operations" },
        { id: InternalUserRole.EXECUTIVE, label: "Executive" },
        { id: InternalUserRole.ENGINEERING, label: "Engineering" },
        { id: InternalUserRole.LEAD_OPERATIONS, label: "Lead Operations" },
    ];

    // Check if lead operations already exists and is not the current user being edited
    const otherUsers = (usersData as any)?.results || [];
    const leadOpsExistsElsewhere = otherUsers.some((u: any) => u.role === InternalUserRole.LEAD_OPERATIONS && u.id !== user.id);

    const roles = leadOpsExistsElsewhere 
        ? standardRoleOptions.filter(r => r.id !== InternalUserRole.LEAD_OPERATIONS)
        : standardRoleOptions;

    const toDate = (value?: string | null) => {
        if (!value) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const formik = useFormik({
        initialValues: {
            name: user.name,
            email: user.email,
            role: user.role,
            payRate: user.payRate !== undefined ? String(user.payRate) : "",
            startDate: toDate(user.startDate),
            birthday: toDate(user.birthday),
        },
        validationSchema: editUserSchema,
        onSubmit: async (values) => {
            try {
                const numericPayRate = values.payRate ? Number(values.payRate) : undefined;
                if (onSubmit) {
                    await onSubmit({
                        id: user.id,
                        name: values.name,
                        email: values.email,
                        role: values.role,
                        memberId: user.memberId,
                        payRate: numericPayRate,
                        startDate: values.startDate ? values.startDate.toISOString() : null,
                        birthday: values.birthday ? values.birthday.toISOString() : null,
                    });
                } else {
                    await updateUser({ id: user.id, data: values });
                }
                toast.success("User updated successfully");
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            } catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to update user");
            }
        }
    });

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Name</Label>
                <Input
                    name="name"
                    placeholder="John Doe"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500 text-sm">{formik.errors.name}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Email</Label>
                <Input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formik.values.email}
                    readOnly
                    disabled
                    className="bg-muted text-muted-foreground"
                />
            </div>

            <div className="space-y-2">
                <Label>Role</Label>
                <SelectControlled
                    mode="single"
                    items={roles.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase()))}
                    onSearch={setRoleSearch}
                    getId={(item) => item.id}
                    getLabel={(item) => item.label}
                    value={roles.find(r => r.id === formik.values.role)}
                    onChange={(val) => formik.setFieldValue('role', val?.id)}
                    placeholder="Select a role"
                    searchable={true}
                />
                {formik.touched.role && formik.errors.role && (
                    <p className="text-red-500 text-sm">{formik.errors.role}</p>
                )}
            </div>

            {showExtendedFields && (
                <>
                    <div className="space-y-2">
                        <Label>Pay Rate ($/hr)</Label>
                        <Input
                            name="payRate"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            placeholder="50"
                            value={formik.values.payRate}
                            onChange={formik.handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <DatePickerCalendar
                                selected={formik.values.startDate || undefined}
                                onSelect={(date) => formik.setFieldValue("startDate", date || null)}
                                placeholder="Pick start date"
                                classname="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Birthday</Label>
                            <DatePickerCalendar
                                selected={formik.values.birthday || undefined}
                                onSelect={(date) => formik.setFieldValue("birthday", date || null)}
                                placeholder="Pick birthday"
                                toYear={new Date().getFullYear()}
                                classname="w-full"
                            />
                        </div>
                    </div>
                </>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
        </form>
    );
}
