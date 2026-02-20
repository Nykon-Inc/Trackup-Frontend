"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useGetInternalOrganizations } from "@/services/organization.services";
import Table, { TableColumn } from "@/components/ui/data-table";
import TablePagination from "@/components/ui/table-pagination";
import { Input } from "@/components/ui/input";
import { DebouncedSearch } from "@/components/ui/debounced-search";
import { Search, Building2, MonitorOff, Activity } from "lucide-react";
import { InternalStatCard } from "@/components/internal/stat-card";
import { Organization } from "@/interfaces/organizations.interfaces";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import OrgtableActions from "@/components/internal/organizations/OrgtableActions";

export default function InternalOrganizationsPage() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useGetInternalOrganizations({
        page,
        limit: rowsPerPage,
        search: search,
    });

    const columns: TableColumn<Organization>[] = [
        {
            header: "Name",
            key: "name",
            onClick: (row) => window.location.href = `/internal/organizations/${row.id}/projects`,
            render: (_: any, row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{row.name}</span>
                    <span className="text-xs text-muted-foreground">{row.domain}</span>
                </div>
            ),
        },
        {
            header: "Status",
            key: "status",
            onClick: (row) => window.location.href = `/internal/organizations/${row.id}/projects`,
            render: (status) => (
                <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize">
                    {status}
                </Badge>
            ),
        },
        {
            header: "Created At",
            key: "createdAt",
            onClick: (row) => window.location.href = `/internal/organizations/${row.id}/projects`,
            render: (date) => (
                <span className="text-muted-foreground">
                    {date ? format(new Date(date), "MMM d, yyyy") : "-"}
                </span>
            ),
        },
        {
            header: "Actions",
            key: "actions",
            align: "right",
            render: (_, row) => (
                <>
                    <OrgtableActions org={row} />
                </>
            ),
        },
    ];

    const totalResults = (data as any)?.totalResults || 0;
    const totalPages = (data as any)?.totalPages || 0;
    // Assuming the API returns these, otherwise we might need separate stats query
    // For now we'll just show Total Results as Active if we don't have breakdowns
    const activeCount = totalResults;

    return (
        <>
            <PageHeader
                title="Organizations"
                breadcrumbs={[
                    { label: "Dashboard", href: "/internal" },
                    { label: "Organizations", href: "/internal/organizations", active: true },
                ]}
            />

            <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 p-6 overflow-y-auto">
                <div className="grid gap-4 md:grid-cols-3">
                    <InternalStatCard
                        title="Total Organizations"
                        value={totalResults}
                        icon={Building2}
                        description="Registered organizations"
                    />
                    <InternalStatCard
                        title="Active Organizations"
                        value={activeCount}
                        icon={Activity}
                        trend="up"
                        trendValue="100%"
                        description="Currently active"
                    />
                    <InternalStatCard
                        title="Inactive / Archived"
                        value={0} // Placeholder until we have this data
                        icon={MonitorOff}
                        description="No longer active"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 md:max-w-sm">
                            <DebouncedSearch
                                placeholder="Search organizations..."
                                onSearch={(val) => {
                                    setSearch(val);
                                    setPage(1);
                                }}
                            />
                        </div>
                        {/* Add Filter Buttons here if needed */}
                    </div>

                    <Table
                        data={(data as any)?.results || []}
                        columns={columns}
                        loading={isLoading}
                        rowKey={(row) => row.id}
                        hover
                        emptyMessage="No organizations found."
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
            </div>
        </>
    );
}
