import { Project, ProjectMember, GetProjectMembersQuery, ProjectMemberRole } from '@/interfaces/projects.interfaces'
import React, { useState, useEffect, useCallback } from 'react'
import { useGetProjectMembers, useResendInviteUser } from '@/services/projects.services'
import Table, { TableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import TablePagination from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DateTime } from "luxon";

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

export default function Staff({ project }: { project: Project }) {
    const router = useRouter();
    const { account } = useAuthStore();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

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
    const { mutate: resendInviteUser } = useResendInviteUser()

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
    const members = projectMembersData?.results || [];
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

    const columns: TableColumn<ProjectMember>[] = [
        {
            header: "Member",
            key: "user",
            width: "250px",
            render: (_, member) => {
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
            header: "Role",
            key: "role",
            width: "120px",
            render: (role) => (
                <Badge variant="outline" className="capitalize font-normal">
                    {role as string}
                </Badge>
            )
        },
        {
            header: "Status",
            key: "status",
            width: "100px",
            render: (status) => (
                <Badge
                    variant="secondary"
                    className={`capitalize font-normal border ${status === 'active'
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/20"
                        : "bg-slate-500/15 text-slate-700 border-slate-500/20"
                        }`}
                >
                    {status as string}
                </Badge>
            )
        },
        {
            header: "Joined Date",
            key: "createdAt",
            width: "150px",
            render: (date) => (
                <span className="text-sm text-muted-foreground">
                    {DateTime.fromISO(date as string).toFormat("MM/dd/yyyy")}
                </span>
            )
        },
        {
            header: "",
            key: "actions",
            width: "50px",
            render: (_, member) => {
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
                            <DropdownMenuContent align="end" className="w-[160px]">
                                {member.status === "invited" ? (
                                    <DropdownMenuItem onClick={() => handleResendInvite({ email: member.user?.email, role: member.role })}>Resend invitation</DropdownMenuItem>
                                ) : (<DropdownMenuItem>Edit member</DropdownMenuItem>)}
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
                    onRowClick={(row) => router.push(`/dashboard/projects/${project.id}/staff/${row.userId}`)}
                    rowClassName={"cursor-pointer"}
                    bordered={false}
                    className="border-0 shadow-none"
                    headerClassName="bg-muted/50 h-10 border-b border-border"
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
        </div>
    )
}
