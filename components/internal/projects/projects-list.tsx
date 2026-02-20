"use client";

import React, { useState } from "react";
import { useGetInternalProjects } from "@/services/projects.services";
import Table, { TableColumn } from "@/components/ui/data-table";
import TablePagination from "@/components/ui/table-pagination";
import { DebouncedSearch } from "@/components/ui/debounced-search";
import { Project } from "@/interfaces/projects.interfaces";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ProjectsListProps {
    organizationId?: string;
    basePath?: string;
}

export function ProjectsList({ organizationId, basePath = "/internal/projects" }: ProjectsListProps) {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useGetInternalProjects({
        page,
        limit: rowsPerPage,
        search: search,
        organizationId
    });

    const columns: TableColumn<Project>[] = [
        {
            header: "Project Name",
            key: "name",
            render: (name) => <span className="font-medium text-foreground">{name}</span>,
        },
        // Only show Organization column if NOT filtered by organization
        ...(!organizationId ? [{
            header: "Organization",
            key: "organization",
            render: (_: any, row: Project) => (
                <span className="text-xs text-muted-foreground truncate max-w-[300px] block" title={row.organization?.name}>
                    {row.organization?.name || "-"}
                </span>
            ),
        } as TableColumn<Project>] : []),
        {
            header: "Status",
            key: "status",
            render: (status) => (
                <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize">
                    {status}
                </Badge>
            ),
        },
        {
            header: "Created At",
            key: "createdAt",
            render: (date) => (
                <span className="text-muted-foreground">
                    {date ? format(new Date(date), "MMM d, yyyy") : "-"}
                </span>
            ),
        },
    ];

    const totalResults = data?.totalResults || 0;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 md:max-w-sm">
                    <DebouncedSearch
                        placeholder="Search projects..."
                        onSearch={(val) => {
                            setSearch(val);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <Table
                data={data?.results || []}
                columns={columns}
                loading={isLoading}
                rowKey={(row) => row.id}
                emptyMessage="No projects found."
                onRowClick={(row) => {
                    // Careful with slashes
                    const path = basePath.endsWith('/') ? `${basePath}${row.id}` : `${basePath}/${row.id}`;
                    router.push(path);
                }}
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
