import { Project, ProjectMember, GetProjectMembersQuery, ProjectMemberRole } from '@/interfaces/projects.interfaces'
import React, { useState, useEffect, useCallback } from 'react'
import { useGetProjectMemberProfile, useGetProjectMembers, useResendInviteUser, useUpdateProjectMemberProfile } from '@/services/projects.services'
import Table, { TableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import TablePagination from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useAuthStore } from "@/stores/auth.store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { StaffFilters } from '../StaffFilters';
import { useRouter } from 'next/navigation';
import { useRowLoading } from '@/hooks/useRowLoading';
import { useWorkspace } from '@/components/providers/workspace-provider';
import { EditStaffInfoModal } from '@/components/projects/staff-profile/modals/edit-staff-info-modal';
import { toast } from 'sonner';

type ProjectMemberRow = ProjectMember & {
    displayName: string;
    jobTitle?: string;
    payRate?: number;
    hoursWorked?: number;
    earnings?: number;
}

function formatMoney(n?: number) {
    if (typeof n !== "number" || Number.isNaN(n)) return "--"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

function formatHours(n?: number) {
    if (typeof n !== "number" || Number.isNaN(n)) return "--"
    return `${n.toFixed(1)}h`
}

function getFallbackJobTitle(role: ProjectMemberRole) {
    switch (role) {
        case ProjectMemberRole.OWNER:
            return "Owner"
        case ProjectMemberRole.MANAGER:
            return "Manager"
        case ProjectMemberRole.VIEWER:
            return "Viewer"
        default:
            return "Member"
    }
}

export default function Staff({ project }: { project: Project }) {
    const router = useRouter();
    const { account } = useAuthStore();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [editInfoOpen, setEditInfoOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ProjectMemberRow | null>(null);

    // Filters
    const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "manager" | "member">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "invited">("all");

    const debouncedSearch = useDebounce(search, 500);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, roleFilter, statusFilter]);

    const query: GetProjectMembersQuery = {
        limit: rowsPerPage,
        page: page,
        search: debouncedSearch,
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
    };

    const { activeOrgId } = useWorkspace();

    const { isLoading: checkIsLoading, start, stop } = useRowLoading()

    const { data: projectMembersData, isLoading } = useGetProjectMembers(project.id, activeOrgId!, query);
    const { data: selectedMemberProfile } = useGetProjectMemberProfile({
        organizationId: activeOrgId || project.organization?.id || "",
        projectId: project.id,
        userId: selectedMember?.userId || "",
    });
    const { mutate: resendInviteUser } = useResendInviteUser()
    const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProjectMemberProfile()

    const handleResendInvite = useCallback(({ email, role }: { email: string, role: ProjectMemberRole }) => {
        start(email)
        resendInviteUser({
            projectId: project.id,
            members: [{
                email,
                role,
            }]
        })
        stop(email)
    }, [])
    const members = (projectMembersData?.results || []).map((m): ProjectMemberRow => {
        const payRate = m.hourlyRate;
        const hoursWorked = m.totalHoursWorked;
        const earnings = m.amountEarned ?? (payRate !== undefined && hoursWorked !== undefined ? payRate * hoursWorked : undefined);
        const jobTitle = m.jobTitle || getFallbackJobTitle(m.role);

        return {
            ...m,
            displayName: m.user?.name || "Unknown",
            jobTitle,
            payRate,
            hoursWorked,
            earnings,
        };
    });
    const totalResults = projectMembersData?.totalResults || 0;

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

    const onClearFilters = () => {
        setRoleFilter("all");
        setStatusFilter("all");
    }

    const handleOpenEditMember = (member: ProjectMemberRow) => {
        setSelectedMember(member)
        setEditInfoOpen(true)
    }

    const columns: TableColumn<ProjectMemberRow>[] = [
        {
            header: "Name",
            key: "displayName",
            sortable: true,
            width: "320px",
            render: (_value, member) => {
                const isMe = member.userId === account?.id;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user?.avatar} alt={member?.user?.name} />
                            <AvatarFallback>{member?.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{member?.user?.name}</span>
                                {isMe && (
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 border-border bg-muted text-muted-foreground hover:bg-muted cursor-default">
                                        You
                                    </Badge>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">{member?.user?.email}</span>
                        </div>
                    </div>
                )
            }
        },
        {
            header: "Job Title",
            key: "jobTitle",
            width: "240px",
            render: (jobTitle) => (
                <span className="text-muted-foreground text-sm">{jobTitle as string}</span>
            )
        },
        {
            header: "Pay Rate",
            key: "payRate",
            width: "140px",
            align: "right",
            render: (payRate) => {
                if (typeof payRate !== "number") return <span className="text-muted-foreground">--</span>
                return <span className="text-sm font-medium">${payRate}/hr</span>
            }
        },
        {
            header: "Hours Worked",
            key: "hoursWorked",
            sortable: true,
            width: "160px",
            align: "right",
            render: (hoursWorked) => (
                <span className="text-sm font-medium">{formatHours(hoursWorked as number | undefined)}</span>
            )
        },
        {
            header: "Earnings",
            key: "earnings",
            sortable: true,
            width: "160px",
            align: "right",
            render: (earnings) => (
                <span className="text-sm font-medium">{formatMoney(earnings as number | undefined)}</span>
            )
        },
        {
            header: "",
            key: "actions",
            width: "60px",
            align: "right",
            render: (_value, member) => {
                const isMe = member.userId === account?.id;
                if (isMe) return null;

                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button loading={checkIsLoading(member.user?.email)} variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                {member.status === "invited" ? (
                                    <DropdownMenuItem onClick={() => handleResendInvite({ email: member.user?.email, role: member.role })}>Resend invitation</DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={() => handleOpenEditMember(member)}>Edit member</DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    Remove member
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            }
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />

                <StaffFilters
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    onClearFilters={onClearFilters}
                />
            </div>

            <div className="bg-card rounded-md border border-border/50 shadow-sm overflow-hidden">
                <Table
                    data={members}
                    columns={columns}
                    loading={isLoading}
                    hover
                    compact
                    sortable
                    defaultSortKey="displayName"
                    defaultSortOrder="asc"
                    onRowClick={(row) => router.push(`/dashboard/${activeOrgId}/projects/${project.id}/staff/${row.userId}`)}
                    rowClassName={"cursor-pointer"}
                    bordered={false}
                    className="border-0 shadow-none"
                    headerClassName="bg-transparent normal-case tracking-normal text-sm font-medium text-foreground border-b border-border/60"
                    emptyMessage="No members found."
                    rowKey={(row) => row.id}
                />
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
                    className="border-t border-border"
                />
            </div>

            <EditStaffInfoModal
                open={editInfoOpen}
                onOpenChange={(open) => {
                    setEditInfoOpen(open)
                    if (!open) setSelectedMember(null)
                }}
                staffName={selectedMember?.user?.name || "Staff Member"}
                jobTitle={String(selectedMember?.role || ProjectMemberRole.MEMBER)}
                payRate={selectedMember?.hourlyRate}
                startDate={selectedMemberProfile?.employment?.startDate || undefined}
                birthday={selectedMemberProfile?.employment?.birthday || undefined}
                notes={selectedMember?.notes || ""}
                isSaving={isSavingProfile}
                onSave={async (payload) => {
                    if (!selectedMember) return

                    await updateProfile({
                        organizationId: activeOrgId || project.organization?.id || "",
                        projectId: project.id,
                        userId: selectedMember.userId,
                        body: {
                            role: payload.jobTitle as ProjectMemberRole,
                            hourlyRate: payload.payRate,
                            startDate: payload.startDate,
                            birthday: payload.birthday,
                            notes: payload.notes,
                        },
                    })

                    toast.success("Staff profile updated")
                }}
            />
        </div>
    )
}
