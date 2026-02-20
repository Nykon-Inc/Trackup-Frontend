"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { InviteUserPayload, ProjectMemberRole } from "@/interfaces/projects.interfaces";
import { useInviteUser } from "@/services/projects.services";

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

export function AddStaffMember({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false);

    const { mutateAsync: inviteUser } = useInviteUser(projectId)
    // Initial user object
    const initialUser: InviteUserPayload = { email: "", role: ProjectMemberRole.MEMBER };

    const formik = useFormik<{ users: InviteUserPayload[] }>({
        initialValues: {
            users: [initialUser],
        },
        validationSchema: AddStaffSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                await inviteUser({ members: values.users })
                console.log("Adding staff members:", values.users)
                setOpen(false);
                resetForm();
            } catch (error) {
                console.error("Failed to add staff members:", error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const addUser = async () => {
        const errors = await formik.validateForm();

        if (errors.users && Object.keys(errors.users).length > 0) {
            const touchedUsers = formik.values.users.map(() => ({
                email: true,
                role: true,
            }));
            formik.setTouched({ users: touchedUsers });
            return;
        }

        const newUsers = [...formik.values.users, { ...initialUser }];
        formik.setFieldValue("users", newUsers);
    };

    const removeUser = (index: number) => {
        const newUsers = formik.values.users.filter((_, i) => i !== index);
        formik.setFieldValue("users", newUsers);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" /> Invite User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Invite Users</DialogTitle>
                    <DialogDescription>
                        Invite multiple users to your project. Assign roles to manage permissions.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit}>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        {/* Header Row */}
                        {formik.values.users.length > 0 && (
                            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <div className="col-span-12 sm:col-span-7">Email</div>
                                <div className="col-span-12 sm:col-span-4">Role</div>
                                <div className="hidden sm:block sm:col-span-1"></div>
                            </div>
                        )}

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
                                                Array.isArray(formik.errors.users) &&
                                                (formik.errors.users[index] as any)?.email
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {formik.touched.users?.[index]?.email &&
                                        Array.isArray(formik.errors.users) &&
                                        (formik.errors.users[index] as any)?.email && (
                                            <p className="text-xs text-red-500">
                                                {(formik.errors.users[index] as any).email}
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
                                            className="text-muted-foreground hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-start mb-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addUser}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" /> Add another
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={formik.isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={formik.isSubmitting || !formik.isValid}
                        >
                            {formik.isSubmitting ? "Inviting..." : "Send Invitations"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
