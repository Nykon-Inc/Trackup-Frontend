"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Table, { TableColumn } from "@/components/ui/data-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Filter } from "lucide-react";
import { useGetProjects } from "@/services/projects.services";
import { ProjectStatus, Project } from "@/interfaces/projects.interfaces";
import { useDebounce } from "@/hooks/use-debounce";
import { CreateProjectDialog } from "./create-project-dialog";
import { Badge } from "@/components/ui/badge";
import TablePagination from "@/components/ui/table-pagination";
import { PageHeader } from "@/components/page-header";
import { useWorkspace } from "@/components/providers/workspace-provider";

export default function ProjectsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const debouncedSearch = useDebounce(search, 500);

    const { activeOrgId } = useWorkspace();

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data: projectsData, isLoading } = useGetProjects({
        organizationId: activeOrgId || "",
        query: {
            search: debouncedSearch,
            page,
            limit: rowsPerPage
        }
    });

    const projects = projectsData?.results || [];
    const totalPages = projectsData?.totalPages || 1;
    const totalResults = projectsData?.totalResults || 0;

    // Client-side status filtering on the returned page
    // Ideally status should also be a server-side filter to work correctly with pagination
    const filteredProjects = projects.filter((project) => {
        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(project.status);
        return matchesStatus;
    });

    const toggleStatusFilter = (status: string) => {
        setStatusFilter(current =>
            current.includes(status)
                ? current.filter(s => s !== status)
                : [...current, status]
        );
    };

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

    const columns: TableColumn<Project>[] = [
        {
            header: "Name",
            key: "name",
            width: "150px",
            sortable: true,
            className: "font-medium",
        },
        {
            header: "Description",
            key: "description",
            width: "400px",
        },
        {
            header: "Status",
            key: "status",
            width: "80px",
            render: (value) => {
                const status = value as ProjectStatus;
                const isActive = status === ProjectStatus.ACTIVE;

                return (
                    <Badge
                        variant="secondary"
                        className={`${isActive
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20"
                            : "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-500/20"
                            } border capitalize font-normal`}
                    >
                        {status}
                    </Badge>
                );
            }
        },
        {
            header: "Created Date",
            key: "createdAt",
            align: "left",
            width: "150px",
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            header: "",
            key: "actions",
            width: "70px",
            render: (_, project) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem>Edit project</DropdownMenuItem>
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                Delete project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <PageHeader
                title="Projects"
                breadcrumbs={[
                    { label: "Dashboard", href: `/${activeOrgId}`, active: false },
                    { label: "Projects", href: `/${activeOrgId}/projects`, active: true },
                ]}
                rightElement={<div>
                    <CreateProjectDialog />
                </div>}
            />

            <div className="px-4">
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search projects by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Status
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.values(ProjectStatus).map((status) => (
                                <DropdownMenuCheckboxItem
                                    key={status}
                                    checked={statusFilter.includes(status)}
                                    onCheckedChange={() => toggleStatusFilter(status)}
                                >
                                    {status}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="bg-card pt-5">
                    <Table
                        data={filteredProjects}
                        columns={columns}
                        loading={isLoading}
                        hover
                        compact
                        bordered={false}
                        className="border-0 rounded-b-none shadow-none"
                        headerClassName="bg-transparent h-12 border-t border-b border-border"
                        emptyMessage="No projects found."
                        onRowClick={(row) => router.push(`/dashboard/${activeOrgId}/projects/${row.id}`)}
                        rowClassName={"cursor-pointer"}
                        sortable
                        defaultSortKey="name"
                        defaultSortOrder="asc"
                        rowKey={(row: Project) => row.id}
                        minTableWidth="1080px"
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
        </div>
    )
}
