"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { InviteUserPayload, ProjectMemberRole } from "@/interfaces/projects.interfaces";

// Validation schema for adding staff members
const AddStaffSchema = Yup.object().shape({
    users: Yup.array().of(
        Yup.object().shape({
            email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            role: Yup.string().required("Role is required").oneOf([ProjectMemberRole.MANAGER, ProjectMemberRole.MEMBER, ProjectMemberRole.VIEWER]),
        })
    ).min(1, "At least one user is required"),
});

interface InviteMembersFormProps {
    onSubmit: (values: InviteUserPayload[]) => Promise<void>;
    isLoading?: boolean;
}

export function InviteMembersForm({ onSubmit, isLoading }: InviteMembersFormProps) {
    // Initial user object
    const initialUser: InviteUserPayload = { email: "", role: ProjectMemberRole.MEMBER };

    const formik = useFormik<{ users: InviteUserPayload[] }>({
        initialValues: {
            users: [initialUser],
        },
        validationSchema: AddStaffSchema,
        onSubmit: async (values) => {
            await onSubmit(values.users);
        },
    });

    const addUser = () => {
        const newUsers = [...formik.values.users, { ...initialUser }];
        formik.setFieldValue("users", newUsers);
    };

    const removeUser = (index: number) => {
        const newUsers = formik.values.users.filter((_, i) => i !== index);
        formik.setFieldValue("users", newUsers);
    };

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {formik.values.users.map((user, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-12 sm:col-span-7 space-y-1">
                            <Input
                                name={`users[${index}].email`}
                                placeholder="user@example.com"
                                value={user.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={
                                    formik.touched.users?.[index]?.email &&
                                        (formik.errors.users?.[index] as any)?.email
                                        ? "border-red-500 h-9"
                                        : "h-9"
                                }
                            />
                            {formik.touched.users?.[index]?.email &&
                                (formik.errors.users?.[index] as any)?.email && (
                                    <p className="text-xs text-red-500">
                                        {(formik.errors.users?.[index] as any).email}
                                    </p>
                                )}
                        </div>
                        <div className="col-span-10 sm:col-span-4 space-y-1">
                            <select
                                name={`users[${index}].role`}
                                value={user.role}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="member">Member</option>
                                <option value="manager">Manager</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex justify-end">
                            {formik.values.users.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeUser(index)}
                                    className="text-muted-foreground hover:text-red-500 h-9 w-9"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addUser}
                    className="gap-2 w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" /> Add another
                </Button>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !formik.isValid}
                size="sm"
            >
                {isLoading ? "Sending Invitations..." : "Send Invitations"}
            </Button>
        </form>
    );
}
