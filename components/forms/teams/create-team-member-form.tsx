"use client";

import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { SelectControlled } from "@/components/ui/select-controlled";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createUserSchema } from "@/validators/users";
import { useCreateInternalUser, useFetchInternalUsers } from "@/services/users";
import { InternalUserRole } from "@/interfaces/auth.interfaces";
import { useState } from "react";

interface CreateTeamMemberFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateTeamMemberForm({ onClose, onSuccess }: CreateTeamMemberFormProps) {
    const [roleSearch, setRoleSearch] = useState("");
    const { mutateAsync: createUser, isPending: isCreating } = useCreateInternalUser();
    const { data: usersData } = useFetchInternalUsers({ limit: 1000 });
    
    // Check if lead operations already exists
    const users = (usersData as any)?.results || [];
    const leadOpsExists = users.some((u: any) => u.role === InternalUserRole.LEAD_OPERATIONS);

    // Role options mapping including LEAD_OPERATIONS
    const roleOptions = [
        { id: InternalUserRole.OPERATIONS, label: "Operations" },
        { id: InternalUserRole.EXECUTIVE, label: "Executive" },
        { id: InternalUserRole.ENGINEERING, label: "Engineering" },
        { id: InternalUserRole.LEAD_OPERATIONS, label: "Lead Operations" },
    ];

    // Filter roles: if lead ops exists, remove it from selection
    const availableRoles = leadOpsExists 
        ? roleOptions.filter(r => r.id !== InternalUserRole.LEAD_OPERATIONS)
        : roleOptions;

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            role: ''
        },
        validationSchema: createUserSchema,
        onSubmit: async (values) => {
            try {
                await createUser(values);
                toast.success("User created successfully");
                onClose();
                formik.resetForm();
                if (onSuccess) {
                    onSuccess();
                }
            } catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to create user");
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
                    name="email"
                    placeholder="john@example.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm">{formik.errors.email}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label>Role</Label>
                <SelectControlled
                    mode="single"
                    items={availableRoles.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase()))}
                    onSearch={setRoleSearch}
                    getId={(item) => item.id}
                    getLabel={(item) => item.label}
                    value={availableRoles.find(r => r.id === formik.values.role)}
                    onChange={(val) => formik.setFieldValue('role', val?.id)}
                    placeholder="Select a role"
                    searchable={true}
                />
                {formik.touched.role && formik.errors.role && (
                    <p className="text-red-500 text-sm">{formik.errors.role}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label>Password</Label>
                <Input
                    type="password"
                    name="password"
                    placeholder="********"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password && (
                    <p className="text-red-500 text-sm">{formik.errors.password}</p>
                )}
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                </Button>
            </DialogFooter>
        </form>
    );
}
