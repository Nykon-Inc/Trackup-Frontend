"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Table, { TableColumn } from "@/components/ui/data-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { AddOrganizationMember } from "./create-organization-member-dialog";
import { BulkAddOrganizationMember } from "./bulk-create-organization-members";
import { Badge } from "@/components/ui/badge";
import TablePagination from "@/components/ui/table-pagination";
import { PageHeader } from "@/components/page-header";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Mail } from "lucide-react";
import {
    useGetOrganizationMembers,
    useGetOrganizationInvitations,
    useRemoveOrganizationInvitation,
    useResendOrganizationInvitation,
    useUpdateOrganizationInvitation,
    useUpdateOrganizationMember,
} from "@/services/organization.services";
import { OrganizationMember, OrganizationInvitation } from "@/interfaces/organizations.interfaces";
import { useAuthStore } from "@/stores/auth.store";
import { EditTeamMemberDialog } from "@/components/forms/teams/edit-team-member-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UnifiedMember {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    payRate?: number;
    hours?: number;
    earnings?: number;
    projects?: Array<{
        id: string;
        name: string;
        role: string;
    }>;
    projectCount?: number;
    isInvitation: boolean;
    invitationToken?: string;
    userId?: string;
    startDate?: string | null;
    birthday?: string | null;
    createdAt: string;
}

interface EditableMember {
    id: string;
    memberId: string;
    invitationToken?: string;
    isInvitation?: boolean;
    name: string;
    email: string;
    role: string;
    payRate?: number;
    startDate?: string | null;
    birthday?: string | null;
}

export default function TeamsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [showPending, setShowPending] = useState(false);
    const [editingMember, setEditingMember] = useState<EditableMember | null>(null);
    const [resendInviteTarget, setResendInviteTarget] = useState<{ token: string; email: string } | null>(null)
    const [removeInviteTarget, setRemoveInviteTarget] = useState<{ token: string; email: string } | null>(null)
    const { account } = useAuthStore();
    const { mutateAsync: updateOrganizationMember } = useUpdateOrganizationMember();
    const { mutateAsync: updateOrganizationInvitation } = useUpdateOrganizationInvitation();
    const { mutateAsync: resendOrganizationInvitation, isPending: isResendingInvitation } = useResendOrganizationInvitation();
    const { mutateAsync: removeOrganizationInvitation, isPending: isRemovingInvitation } = useRemoveOrganizationInvitation();

    const handleConfirmResendInvite = async () => {
        if (!activeOrgId || !resendInviteTarget?.token) return

        try {
            await resendOrganizationInvitation({
                organizationId: activeOrgId,
                invitationToken: resendInviteTarget.token,
            })
            await refetchInvitations()
            toast.success("Invitation resent")
            setResendInviteTarget(null)
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { message?: string } } }
            toast.error(apiError?.response?.data?.message || "Failed to resend invitation")
        }
    }

    const handleConfirmRemoveInvite = async () => {
        if (!activeOrgId || !removeInviteTarget?.token) return

        try {
            await removeOrganizationInvitation({
                organizationId: activeOrgId,
                invitationToken: removeInviteTarget.token,
            })
            await refetchInvitations()
            toast.success("Invitation removed")
            setRemoveInviteTarget(null)
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { message?: string } } }
            toast.error(apiError?.response?.data?.message || "Failed to remove invitation")
        }
    }

    const debouncedSearch = useDebounce(search, 500);

    const { activeOrgId } = useWorkspace();

    const { data: membersData, isLoading: isLoadingMembers, refetch: refetchMembers } = useGetOrganizationMembers({
        organizationId: activeOrgId || "",
        query: {
            search: debouncedSearch,
            page,
            limit: rowsPerPage
        }
    });

    const { data: invitationsData, isLoading: isLoadingInvitations, refetch: refetchInvitations } = useGetOrganizationInvitations({
        organizationId: activeOrgId || "",
        query: {
            search: debouncedSearch,
            page,
            limit: rowsPerPage
        }
    });

    const isLoading = showPending ? isLoadingInvitations : isLoadingMembers;
    const currentData = showPending ? invitationsData : membersData;

    const members: UnifiedMember[] = showPending
        ? (invitationsData?.results || []).map((inv: OrganizationInvitation) => ({
            id: inv.id || inv.token,
            name: inv.email.split('@')[0],
            email: inv.email,
            role: inv.role,
            status: inv.status,
            isInvitation: true,
            invitationToken: inv.token,
            startDate: inv.startDate ? new Date(inv.startDate).toISOString() : null,
            birthday: inv.birthday ? new Date(inv.birthday).toISOString() : null,
            payRate: inv.hourlyRate || 0,
            projectCount: 0,
            hours: 0,
            earnings: 0,
            projects: [],
            createdAt: ""
        }))
        : (membersData?.results || []).map((m: OrganizationMember) => ({
            id: m.id,
            name: m.user?.name || "",
            email: m.user?.email || "",
            role: m.role,
            status: m.status,
            isInvitation: false,
            userId: m.userId,
            payRate: m.hourlyRate || 0,
            projectCount: m.projectCount || 0,
            startDate: m.startDate || null,
            birthday: m.birthday || null,
            hours: 0,
            earnings: 0,
            projects: m.projects || [],
            createdAt: m.createdAt
        }));

    const totalResults = currentData?.totalResults || 0;
    const pendingCount = invitationsData?.totalResults || 0;

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const getInitials = (name: string) => {
        if (!name) return "??";
        return name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase();
    };

    const columns: TableColumn<UnifiedMember>[] = [
        {
            header: "Name",
            key: "name",
            width: "250px",
            sortable: true,
            render: (value, member) => (
                <div className="flex items-center gap-3 py-2">
                    <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${member.email}`} alt={member.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {getInitials(member.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm leading-tight text-slate-900">{member.name}</p>
                            {member.email === account?.email && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-primary/10 text-primary border-none font-medium">You</Badge>
                            )}
                            {(member.status === "pending" || member.isInvitation) && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-tight">{member.email}</p>
                    </div>
                </div>
            ),
        },
        {
            header: "Job Title",
            key: "role",
            width: "180px",
            className: "text-slate-500",
            render: (value) => (
                <span className="text-sm capitalize">{value as string}</span>
            ),
        },
        {
            header: "Project(s)",
            key: "projectCount",
            width: "180px",
            render: (value) => {
                const count = Number(value || 0)
                return <span className="text-sm text-slate-700">{count} {count === 1 ? "project" : "projects"}</span>
            },
        },
        {
            header: "Pay Rate",
            key: "payRate",
            align: "left",
            width: "120px",
            sortable: true,
            render: (value) => <span className="text-sm font-medium text-slate-700">${value}/hr</span>,
        },
        {
            header: "Hours",
            key: "hours",
            align: "left",
            width: "100px",
            sortable: true,
            render: (value) => <span className="text-sm font-medium text-slate-700">{((value || 0) as number).toFixed(1)}h</span>,
        },
        {
            header: "Earnings",
            key: "earnings",
            align: "left",
            width: "120px",
            sortable: true,
            render: (value) => <span className="text-sm font-medium text-slate-900">${((value || 0) as number).toLocaleString()}</span>,
        },
        {
            header: "",
            key: "actions",
            width: "70px",
            render: (_, member) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            {!member.isInvitation && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (!member.userId) return;
                                        setEditingMember({
                                            id: member.userId,
                                            memberId: member.id,
                                            name: member.name,
                                            email: member.email,
                                            role: member.role,
                                            payRate: member.payRate,
                                            startDate: member.startDate,
                                            birthday: member.birthday,
                                        });
                                    }}
                                >
                                    Edit member
                                </DropdownMenuItem>
                            )}
                            {!member.isInvitation && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (!member.userId) return;
                                        const query = new URLSearchParams({ memberId: member.id, projectFilter: "all" });
                                        router.push(`/dashboard/${activeOrgId}/teams/staff/${member.userId}?${query.toString()}`);
                                    }}
                                >
                                    View details
                                </DropdownMenuItem>
                            )}
                            {member.isInvitation ? (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (!member.invitationToken) return;
                                            setEditingMember({
                                                id: member.id,
                                                invitationToken: member.invitationToken,
                                                memberId: member.id,
                                                isInvitation: true,
                                                name: member.name,
                                                email: member.email,
                                                role: member.role,
                                                payRate: member.payRate,
                                                startDate: member.startDate,
                                                birthday: member.birthday,
                                            });
                                        }}
                                    >
                                        Edit invite
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            if (!member.invitationToken) return
                                            setResendInviteTarget({ token: member.invitationToken, email: member.email })
                                        }}
                                    >
                                        Resend invite
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={async () => {
                                            if (!member.invitationToken) return
                                            setRemoveInviteTarget({ token: member.invitationToken, email: member.email })
                                        }}
                                    >
                                        Remove invite
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                        Remove member
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <PageHeader
                title="Team"
                breadcrumbs={[
                    { label: "Dashboard", href: `/${activeOrgId}`, active: false },
                    { label: "Team", href: `/${activeOrgId}/teams`, active: true },
                ]}
            />

            <div className="px-6">
                <div className="flex items-start justify-between mb-8">
                    <div>
                    </div>

                    <div className="flex items-center gap-3">
                        <BulkAddOrganizationMember />
                        <AddOrganizationMember />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative flex-1 min-w-[320px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, role, email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPage(1)
                            }}
                            className="h-10 pl-10 bg-white border-slate-200"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow h-10">
                            <div className="flex items-center gap-2 pr-2 border-r border-slate-100">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                                    Show Pending Invitations <span className="text-slate-400 font-normal ml-1">({pendingCount})</span>
                                </span>
                            </div>
                            <Switch
                                checked={showPending}
                                onCheckedChange={(checked) => {
                                    setShowPending(checked)
                                    setPage(1)
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <Table
                        data={members}
                        columns={columns}
                        loading={isLoading}
                        hover
                        compact
                        bordered={false}
                        className="border-0"
                        headerClassName="bg-transparent h-12 border-b border-slate-100 text-slate-400 font-normal text-xs uppercase tracking-wider"
                        emptyMessage="No team members found."
                        onRowClick={(row) => {
                            if (row.isInvitation || !row.userId) return;
                            const query = new URLSearchParams({ memberId: row.id, projectFilter: "all" });
                            router.push(`/dashboard/${activeOrgId}/teams/staff/${row.userId}?${query.toString()}`);
                        }}
                        rowClassName={"cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/50"}
                        sortable
                        rowKey={(row: UnifiedMember) => row.id}
                        minTableWidth="1100px"
                    />

                    <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/20">
                        <TablePagination
                            component="div"
                            count={totalResults}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                            className="border-0 p-0"
                        />
                    </div>
                </div>
            </div>

            <EditTeamMemberDialog
                open={!!editingMember}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingMember(null);
                    }
                }}
                user={editingMember}
                title={editingMember?.isInvitation ? "Edit Invitation" : "Edit Team Member"}
                showExtendedFields
                roleOptions={[
                    { id: "manager", label: "Manager" },
                    { id: "member", label: "Member" },
                ]}
                onSubmit={async (values) => {
                    if (!activeOrgId || !values.memberId) return;

                    if (editingMember?.isInvitation && editingMember.invitationToken) {
                        await updateOrganizationInvitation({
                            organizationId: activeOrgId,
                            invitationToken: editingMember.invitationToken,
                            body: {
                                role: values.role,
                                payRate: values.payRate,
                                startDate: values.startDate,
                                birthday: values.birthday,
                            },
                        });
                        return;
                    }

                    await updateOrganizationMember({
                        organizationId: activeOrgId,
                        memberId: values.memberId,
                        body: {
                            name: values.name,
                            role: values.role,
                            hourlyRate: values.payRate,
                            startDate: values.startDate,
                            birthday: values.birthday,
                        },
                    });
                }}
                onSuccess={async () => {
                    await Promise.all([refetchMembers(), refetchInvitations()]);
                }}
            />

            <Dialog open={!!resendInviteTarget} onOpenChange={(open) => !open && setResendInviteTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Resend invitation?</DialogTitle>
                        <DialogDescription>
                            This will resend the invite email to `{resendInviteTarget?.email}`.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResendInviteTarget(null)} disabled={isResendingInvitation}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmResendInvite} loading={isResendingInvitation}>
                            Resend invite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!removeInviteTarget} onOpenChange={(open) => !open && setRemoveInviteTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove invitation?</DialogTitle>
                        <DialogDescription>
                            This will remove the pending invite for `{removeInviteTarget?.email}`.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveInviteTarget(null)} disabled={isRemovingInvitation}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmRemoveInvite} loading={isRemovingInvitation}>
                            Remove invite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
