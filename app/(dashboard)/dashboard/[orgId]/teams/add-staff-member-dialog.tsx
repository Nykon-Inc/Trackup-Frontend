"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, UserPlus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { InviteUserPayload, ProjectMemberRole } from "@/interfaces/projects.interfaces";
import { useInviteUser } from "@/services/projects.services";

import { useGetOrganizationMembers, useInviteUserToOrganization } from "@/services/organization.services";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrganizationMember, OrganizationMemberRole } from "@/interfaces/organizations.interfaces";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

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

export function AddStaffMember({ projectId, organizationId }: { projectId?: string, organizationId?: string }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [selected, setSelected] = useState<Record<string, InviteUserPayload>>({});

    const projectInviteMutation = useInviteUser(projectId || "", organizationId);
    const organizationInviteMutation = useInviteUserToOrganization(organizationId || "");

    const inviteUser = async (payload: { members: InviteUserPayload[] }) => {
        // If projectId is provided, we always invite to the project.
        // organizationId is used for searching org members in the Assign Staff UI.
        if (projectId) {
            return await projectInviteMutation.mutateAsync(payload);
        } else if (organizationId) {
            return await organizationInviteMutation.mutateAsync(payload);
        } else {
            throw new Error("No context provided for invitation");
        }
    }

    const effectiveOrgId = organizationId || "";
    const { data: orgMembersData, isLoading: isLoadingOrgMembers } = useGetOrganizationMembers({
        organizationId: open && projectId ? effectiveOrgId : "",
        query: {
            search: debouncedSearch || undefined,
            limit: 10,
            page: 1,
        },
    });

    const orgMemberResults = useMemo(() => {
        const data = orgMembersData as unknown as { results?: OrganizationMember[] } | undefined;
        const results = data?.results ?? [];
        return results
            .filter((m) => (m.user?.email || "").length > 0)
            .filter((m) => (m.role || "").toLowerCase() !== OrganizationMemberRole.OWNER);
    }, [orgMembersData]);

    const selectedCount = Object.keys(selected).length;

    const toggleSelected = (email: string) => {
        setSelected((prev) => {
            const next = { ...prev };
            if (next[email]) {
                delete next[email];
                return next;
            }
            next[email] = { email, role: ProjectMemberRole.MEMBER };
            return next;
        });
    };

    const setSelectedRole = (email: string, role: ProjectMemberRole) => {
        setSelected((prev) => {
            if (!prev[email]) return prev;
            return {
                ...prev,
                [email]: {
                    ...prev[email],
                    role,
                },
            };
        });
    };

    const resetProjectInviteState = () => {
        setSearch("");
        setSelected({});
    };

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
                setOpen(false);
                resetForm();
                // Toast logic handles success feedback usually, or add here if missing
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
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) resetProjectInviteState();
            }}
        >
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" /> {projectId ? "Assign Staff" : "Invite User"}
                </Button>
            </DialogTrigger>
            <DialogContent className={projectId ? "sm:max-w-[560px] p-0 overflow-hidden gap-0" : "sm:max-w-[600px]"}>
                {projectId ? (
                    <>
                        <DialogHeader className="p-6 pb-3">
                            <DialogTitle className="text-xl font-bold">Assign Staff</DialogTitle>
                            <DialogDescription>Add team members to this project.</DialogDescription>
                        </DialogHeader>

                        <div className="px-6 pb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="pl-9 h-10"
                                />
                            </div>

                            <div className="mt-4 border rounded-lg overflow-hidden">
                                <div className="max-h-[320px] overflow-y-auto">
                                    {!effectiveOrgId ? (
                                        <div className="p-4 text-sm text-muted-foreground">Missing organization context.</div>
                                    ) : isLoadingOrgMembers ? (
                                        <div className="p-4 text-sm text-muted-foreground">Searching...</div>
                                    ) : orgMemberResults.length === 0 ? (
                                        <div className="p-4 text-sm text-muted-foreground">No results</div>
                                    ) : (
                                        orgMemberResults.slice(0, 10).map((member) => {
                                            const email = member.user?.email || "";
                                            const name = member.user?.name || "Unknown";
                                            const isSelected = !!selected[email];
                                            const payRate = member.hourlyRate;

                                            return (
                                                <div
                                                    key={member.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => toggleSelected(email)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            toggleSelected(email);
                                                        }
                                                    }}
                                                    className="w-full text-left flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/40 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleSelected(email)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />

                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${email}`} alt={name} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                                            {name.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="grid grid-cols-[1fr_auto] items-center gap-3 min-w-0">
                                                            <p className="font-medium text-sm truncate">{name}</p>
                                                            {isSelected ? (
                                                                <select
                                                                    value={selected[email]?.role}
                                                                    onChange={(e) => setSelectedRole(email, e.target.value as ProjectMemberRole)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="h-7 w-[104px] shrink-0 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                                >
                                                                    <option value={ProjectMemberRole.MEMBER}>Member</option>
                                                                    <option value={ProjectMemberRole.MANAGER}>Manager</option>
                                                                    <option value={ProjectMemberRole.VIEWER}>Viewer</option>
                                                                </select>
                                                            ) : (
                                                                <div className="h-7 w-[104px] shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{email}</p>
                                                    </div>

                                                    {typeof payRate === "number" && payRate >= 0 && (
                                                        <div className="text-xs text-muted-foreground whitespace-nowrap">${payRate ?? 0}/hr</div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                {selectedCount} member{selectedCount === 1 ? "" : "s"} selected
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setOpen(false);
                                        resetProjectInviteState();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    disabled={projectInviteMutation.isPending || selectedCount === 0}
                                    onClick={async () => {
                                        try {
                                            const members = Object.values(selected);
                                            await inviteUser({ members });
                                            toast.success("Invitations sent successfully");
                                            setOpen(false);
                                            resetProjectInviteState();
                                        } catch (error: unknown) {
                                            console.error("Failed to invite staff:", error);
                                            const apiError = error as { response?: { data?: { message?: string } } };
                                            toast.error(apiError?.response?.data?.message || "Failed to invite staff");
                                        }
                                    }}
                                >
                                    {projectInviteMutation.isPending ? "Inviting..." : "Assign"}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
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
                                                    typeof formik.errors.users[index]?.email === "string"
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {formik.touched.users?.[index]?.email &&
                                            Array.isArray(formik.errors.users) &&
                                            typeof formik.errors.users[index]?.email === "string" && (
                                                <p className="text-xs text-red-500">
                                                    {formik.errors.users[index]?.email}
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
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
