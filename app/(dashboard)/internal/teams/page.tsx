"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Table, { TableColumn } from "@/components/ui/data-table";
import { useFetchInternalUsers, useDisableUser, useRestoreUser, useResetUserPassword } from "@/services/users";
import { Badge } from "@/components/ui/badge";
import { DebouncedSearch } from "@/components/ui/debounced-search";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { CreateTeamMemberDialog } from "@/components/forms/teams/create-team-member-dialog";
import { EditTeamMemberDialog } from "@/components/forms/teams/edit-team-member-dialog";
import { InternalUserRole } from "@/interfaces/auth.interfaces";
import { Mail, Shield, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectControlled } from "@/components/ui/select-controlled";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface IUser {
    id: string;
    name: string;
    email: string;
    status: string;
    role: string;
}

export default function Teams() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Read initial states from URL
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [status, setStatus] = useState<string>(searchParams.get("status") || "all");
    const [role, setRole] = useState<string>(searchParams.get("role") || "all");
    const [editingUser, setEditingUser] = useState<IUser | null>(null);

    // Update URL when filters change
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const nextParams = new URLSearchParams();
        if (search) nextParams.set("search", search);
        if (status !== "all") nextParams.set("status", status);
        if (role !== "all") nextParams.set("role", role);
        
        // Only replace if query string has actually changed
        if (urlParams.toString() !== nextParams.toString()) {
            router.replace(`${pathname}?${nextParams.toString()}`);
        }
    }, [search, status, role, pathname, router]);

    // Hooks
    const { data: usersData, isLoading, refetch } = useFetchInternalUsers({ 
        search, 
        limit: 1000,
        status: status === 'all' ? undefined : status,
        role: role === 'all' ? undefined : role
    });

    const roleOptions = [
        { id: "all", label: "All Roles" },
        { id: InternalUserRole.OPERATIONS, label: "Operations" },
        { id: InternalUserRole.EXECUTIVE, label: "Executive" },
        { id: InternalUserRole.ENGINEERING, label: "Engineering" },
        { id: InternalUserRole.LEAD_OPERATIONS, label: "Lead Operations" },
    ];

    const statusOptions = [
        { id: "all", label: "All Statuses" },
        { id: "active", label: "Active" },
        { id: "disabled", label: "Disabled" },
    ];
    const { mutate: disableUser } = useDisableUser();
    const { mutate: restoreUser } = useRestoreUser();
    const { mutate: resetPassword } = useResetUserPassword();

    const handleResetPassword = (userId: string) => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*";
        const randomPass = Array(12).fill(chars).map(x => x[Math.floor(Math.random() * x.length)]).join('');

        resetPassword({ userId, password: randomPass }, {
            onSuccess: () => {
                toast.success(`Password reset. New password: ${randomPass}`, {
                    duration: 10000,
                });
            },
            onError: () => {
                toast.error("Failed to reset password");
            }
        });
    };

    const handleToggleStatus = (user: IUser) => {
        if (user.status === 'active') {
            disableUser(user.id, {
                onSuccess: () => { toast.success("User disabled"); refetch(); },
                onError: () => toast.error("Failed to disable user")
            });
        } else {
            restoreUser(user.id, {
                onSuccess: () => { toast.success("User restored"); refetch(); },
                onError: () => toast.error("Failed to restore user")
            });
        }
    };

    const columns: TableColumn<IUser>[] = [
        { 
            header: "Member", 
            key: "name",
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                        <UserIcon className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-neutral-900 truncate">{row.name}</span>
                        <div className="flex items-center gap-1 opacity-60">
                            <Mail className="h-2.5 w-2.5" />
                            <span className="text-[10px] truncate">{row.email}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: "Role",
            key: "role",
            render: (value) => {
                const isLead = value === InternalUserRole.LEAD_OPERATIONS;
                return (
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "capitalize rounded-full px-2 py-0.5 text-[10px] font-bold",
                            isLead ? "border-amber-100 bg-amber-50 text-amber-700" : "border-neutral-100 bg-neutral-50 text-neutral-600"
                        )}
                    >
                        {isLead ? <Shield className="h-2.5 w-2.5 mr-1" /> : null}
                        {value}
                    </Badge>
                );
            }
        },
        {
            header: "Status",
            key: "status",
            render: (value) => (
                <Badge 
                    variant="outline"
                    className={cn(
                        "capitalize rounded-full px-2 py-0.5 text-[10px] font-bold",
                        value === 'active' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-700'
                    )}
                >
                    {value === 'active' ? 'Active' : 'Disabled'}
                </Badge>
            )
        },
        {
            header: "",
            key: "actions",
            width: "50px",
            render: (_, row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-neutral-100">
                            <MoreHorizontal className="h-4 w-4 text-neutral-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl">
                        <DropdownMenuItem onClick={() => setEditingUser(row)} className="rounded-lg text-xs font-medium focus:bg-neutral-50">
                            Edit User Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(row.id)} className="rounded-lg text-xs font-medium focus:bg-neutral-50">
                            Reset Access Password
                        </DropdownMenuItem>
                        <div className="my-1 h-px bg-neutral-100" />
                        <DropdownMenuItem 
                            onClick={() => handleToggleStatus(row)} 
                            className={cn(
                                "rounded-lg text-xs font-bold uppercase tracking-wider",
                                row.status === 'active' ? "text-red-600 focus:bg-red-50 focus:text-red-700" : "text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
                            )}
                        >
                            {row.status === 'active' ? 'Disable Account' : 'Restore Account'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    const users = Array.isArray(usersData) ? usersData : (usersData as any)?.results || [];

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA]">
            <PageHeader
                title="Management Team"
                breadcrumbs={[
                    { label: "Internal", href: "/internal" },
                    { label: "Teams", active: true }
                ]}
                rightElement={
                    <CreateTeamMemberDialog onSuccess={refetch} />
                }
            />

            <div className="flex-1 p-6 space-y-6 max-w-screen-2xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 max-w-sm">
                        <DebouncedSearch
                            onSearch={(val) => setSearch(val)}
                            initialValue={search}
                            placeholder="Search team members by name or email..."
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-40">
                            <SelectControlled
                                mode="single"
                                items={roleOptions}
                                value={roleOptions.find(o => o.id === role)}
                                getId={o => o.id}
                                getLabel={o => o.label}
                                onChange={o => setRole(o?.id || "all")}
                                onSearch={() => {}}
                                searchable={false}
                                placeholder="Filter by Role"
                                buttonClassName="h-9 text-[11px] font-bold uppercase tracking-wider border-border rounded-xl bg-white"
                            />
                        </div>
                        <div className="w-40">
                            <SelectControlled
                                mode="single"
                                items={statusOptions}
                                value={statusOptions.find(o => o.id === status)}
                                getId={o => o.id}
                                getLabel={o => o.label}
                                onChange={o => setStatus(o?.id || "all")}
                                onSearch={() => {}}
                                searchable={false}
                                placeholder="Status"
                                buttonClassName="h-9 text-[11px] font-bold uppercase tracking-wider border-border rounded-xl bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                    <Table
                        data={users}
                        columns={columns}
                        loading={isLoading}
                        emptyMessage="No team members found"
                        onRowClick={(row) => setEditingUser(row)}
                    />
                </div>
            </div>

            <EditTeamMemberDialog
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                user={editingUser}
                onSuccess={refetch}
            />
        </div>
    );
}
