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
import { CreateProjectDropdown } from "./components/CreateProjectDropdown";
import { Badge } from "@/components/ui/badge";
import TablePagination from "@/components/ui/table-pagination";
import { PageHeader } from "@/components/page-header";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { ProjectCard } from "./components/ProjectCard";
import { useAuthStore } from "@/stores/auth.store";

export default function ProjectsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("active");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const { account } = useAuthStore();

    const debouncedSearch = useDebounce(search, 500);

    const { activeOrgId } = useWorkspace();

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data: projectsData, isLoading } = useGetProjects({
        organizationId: activeOrgId || "",
        userId: account?.id || "",
        query: {
            search: debouncedSearch,
            page,
            limit: rowsPerPage,
            status: statusFilter
        }
    });

    const projects = projectsData?.results || [];
    const totalResults = projectsData?.totalResults || 0;

    // Client-side status filtering on the returned page
    // Ideally status should also be a server-side filter to work correctly with pagination
    const filteredProjects = projects.filter((project) => {
        const matchesStatus = !statusFilter || project.status === statusFilter;
        return matchesStatus;
    });

    const toggleStatusFilter = (status: string) => {
        setStatusFilter(current => current === status ? "" : status);
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

    return (
        <div className="space-y-4">
            <PageHeader
                title="Projects"
                breadcrumbs={[
                    { label: "Dashboard", href: `/${activeOrgId}`, active: false },
                    { label: "Projects", href: `/${activeOrgId}/projects`, active: true },
                ]}
                rightElement={<div>
                </div>}
            />

            <div className="px-4">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Input
                            placeholder="Search projects by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm h-10"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 h-10">
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
                                        checked={statusFilter === status}
                                        onCheckedChange={() => toggleStatusFilter(status)}
                                    >
                                        {status}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div>
                        <CreateProjectDropdown />
                    </div>
                </div>

                <div className="bg-card">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[250px] w-full bg-slate-100 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                                <Filter className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
                            <p className="text-slate-500 max-w-sm mt-1">
                                We couldn't find any projects matching your current filters or search query.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("");
                                }}
                            >
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => router.push(`/dashboard/${activeOrgId}/projects/${project.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    <div className="mt-8 border-t pt-4">
                        <TablePagination
                            component="div"
                            count={totalResults}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[6, 12, 24, 48, 96]}
                            showFirstButton
                            showLastButton
                            className="border-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
