"use client";

import React, { useState } from "react";
import Table, { TableColumn } from "@/components/ui/data-table";
import { DebouncedSearch } from "@/components/ui/debounced-search";
import { OrganizationMember } from "@/interfaces/organizations.interfaces";
import TablePagination from "@/components/ui/table-pagination";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useGetOrganizationMembers } from "@/services/organization.services";
import { AddStaffMember } from "@/app/(dashboard)/dashboard/[orgId]/teams/add-staff-member-dialog";

interface OrganizationUsersListProps {
    organizationId: string;
}

export function OrganizationUsersList({ organizationId }: OrganizationUsersListProps) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useGetOrganizationMembers({
        organizationId,
        query: {
            page,
            limit: rowsPerPage,
            search,
        },
    });

    const columns: TableColumn<OrganizationMember>[] = [
        {
            header: "User",
            key: "user",
            render: (_value, row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{row.user?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">{row.user?.email || "-"}</span>
                </div>
            ),
        },
        {
            header: "Role",
            key: "role",
            render: (role: string) => <Badge variant="outline" className="capitalize">{role}</Badge>,
        },
        {
            header: "Joined At",
            key: "createdAt",
            render: (date) => (
                <span className="text-muted-foreground">
                    {date ? format(new Date(date), "MMM d, yyyy") : "-"}
                </span>
            ),
        },
    ];


    const totalResults = (data as { totalResults?: number } | undefined)?.totalResults || 0;

    return (
        <div className="flex flex-col gap-4">
            {/* // ... in main component */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 md:max-w-sm">
                    <DebouncedSearch
                        placeholder="Search users..."
                        onSearch={(val) => {
                            setSearch(val);
                            setPage(1);
                        }}
                    />
                </div>
                <AddStaffMember organizationId={organizationId} />
            </div>

            <Table
                data={(data as { results?: OrganizationMember[] } | undefined)?.results || []}
                columns={columns}
                emptyMessage="No users found."
                loading={isLoading}
                rowKey={(row) => row.id}
            />

            <TablePagination
                count={totalResults}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
                rowsPerPageOptions={[10, 20, 50, 100]}
            />
        </div>
    );
}
