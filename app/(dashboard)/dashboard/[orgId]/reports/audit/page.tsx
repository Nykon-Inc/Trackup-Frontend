"use client"

import { PageHeader } from "@/components/page-header"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, ChevronLeft, ChevronRight, Settings2, Clock3, List, Table2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar";
import { useMemo, useState } from "react";
import { addDays, format, subDays } from "date-fns";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { OrganizationMember, OrganizationMemberRole } from "@/interfaces/organizations.interfaces";
import { useGetOrganizationMembers } from "@/services/organization.services";
import { useGetProjects } from "@/services/projects.services";
import { SelectControlled } from "@/components/ui/select-controlled";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Table, { TableColumn } from "@/components/ui/data-table";
import TablePagination from "@/components/ui/table-pagination";
import { Badge } from "@/components/ui/badge";
import { IActivityLog } from "@/interfaces/activities";
import { useGetOrganizationActivityLogs } from "@/services/activity-logs";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type ViewMode = "timeline" | "table";
type TimeScope = "all_time" | "selected_day";
type AuditProject = { id: string; name: string };

const actionLabel = (action: string) =>
    action
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

const getLogKey = (log: IActivityLog, index: number) =>
    log.id ||
    log._id ||
    `${log.createdAt || "na"}-${log.actorId}-${log.action}-${log.targetId || "na"}-${index}`;

export default function AuditLogsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { account } = useAuthStore();
    const { activeOrg } = useWorkspace();

    const [orgSearch, setOrgSearch] = useState("");
    const [projectSearch, setProjectSearch] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [selectedLog, setSelectedLog] = useState<IActivityLog | null>(null);

    const parsedDate = searchParams.get("date");
    const parsedScope = searchParams.get("timeScope");
    const [date, setDate] = useState<Date>(parsedDate ? new Date(parsedDate) : new Date());
    const [timeScope, setTimeScope] = useState<TimeScope>(parsedScope === "selected_day" ? "selected_day" : "all_time");

    const userIdFromUrl = searchParams.get("userId");
    const projectIdFromUrl = searchParams.get("projectId");

    const isPrivileged = activeOrg?.role === OrganizationMemberRole.OWNER || activeOrg?.role === OrganizationMemberRole.MANAGER;

    const updateSearchParam = (updates: Record<string, string | null>) => {
        const nextParams = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                nextParams.delete(key);
                return;
            }
            nextParams.set(key, value);
        });
        router.push(`?${nextParams.toString()}`);
    };

    const { data: membersData, isLoading: isLoadingMembers } = useGetOrganizationMembers({
        organizationId: params?.orgId as string,
        query: {
            search: orgSearch,
            limit: 200,
            page: 1,
        },
    });

    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({
        organizationId: params?.orgId as string,
        userId: account?.id || "",
        query: {
            search: projectSearch,
            limit: 200,
            page: 1,
        },
    });

    const members = (((membersData as { results?: OrganizationMember[] } | undefined)?.results) || [])
        .filter((m: OrganizationMember) => m.role === OrganizationMemberRole.MEMBER);
    const projects = ((projectsData as { results?: AuditProject[] } | undefined)?.results) || [];
    const selectedMember = members.find((m: OrganizationMember) => m.userId === userIdFromUrl) || null;
    const selectedProject = projects.find((p: AuditProject) => p.id === projectIdFromUrl) || null;

    const query = useMemo(() => ({
        actorId: userIdFromUrl || undefined,
        projectId: projectIdFromUrl || undefined,
        startDate: timeScope === "selected_day" ? `${format(date, "yyyy-MM-dd")}T00:00:00.000Z` : undefined,
        endDate: timeScope === "selected_day" ? `${format(date, "yyyy-MM-dd")}T23:59:59.999Z` : undefined,
        page,
        limit: rowsPerPage,
        sortBy: "createdAt:desc",
    }), [userIdFromUrl, projectIdFromUrl, timeScope, date, page, rowsPerPage]);

    const { data: logsData, isLoading } = useGetOrganizationActivityLogs(params?.orgId as string, query);

    const logs = logsData?.results || [];
    const totalResults = logsData?.totalResults || 0;

    const handlePrevDay = () => {
        const nextDate = subDays(date, 1);
        setDate(nextDate);
        setPage(1);
        updateSearchParam({ date: nextDate.toISOString() });
    };

    const handleNextDay = () => {
        const nextDate = addDays(date, 1);
        setDate(nextDate);
        setPage(1);
        updateSearchParam({ date: nextDate.toISOString() });
    };

    const clearUserFilter = () => {
        setPage(1);
        updateSearchParam({ userId: null });
    };

    const clearProjectFilter = () => {
        setPage(1);
        updateSearchParam({ projectId: null });
    };

    const clearDateScopeFilter = () => {
        setTimeScope("all_time");
        setPage(1);
        updateSearchParam({ timeScope: "all_time" });
    };

    const hasActiveFilters = Boolean(selectedMember || selectedProject || timeScope === "selected_day");

    const columns: TableColumn<IActivityLog>[] = [
        {
            header: "Time",
            key: "createdAt",
            width: "160px",
            sortable: true,
            render: (value) => (
                <span className="text-xs text-slate-600 whitespace-nowrap">
                    {value ? format(new Date(value), "MMM d, yyyy h:mm a") : "-"}
                </span>
            ),
        },
        {
            header: "Type",
            key: "type",
            width: "120px",
            render: (value) => (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{value}</Badge>
            ),
        },
        {
            header: "Action",
            key: "action",
            width: "190px",
            render: (value) => <span className="text-xs font-medium text-slate-700">{actionLabel(value as string)}</span>,
        },
        {
            header: "Actor",
            key: "actor.name",
            width: "220px",
            render: (_, row) => (
                <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={row.actor?.avatar || undefined} alt={row.actor?.name || "User"} />
                        <AvatarFallback className="text-[10px]">{row.actor?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-slate-700 truncate">{row.actor?.name || row.actorId}</span>
                </div>
            ),
        },
        {
            header: "Target",
            key: "target.name",
            width: "260px",
            render: (_, row) => {
                const targetName = row.target?.name || row.target?.email || row.targetId || "-";
                if (row.target?.href) {
                    return (
                        <a href={row.target.href} className="text-xs text-primary hover:underline truncate block" title={targetName}>
                            {targetName}
                        </a>
                    );
                }
                return <span className="text-xs text-slate-700 truncate block" title={targetName}>{targetName}</span>;
            },
        },
        {
            header: "Description",
            key: "description",
            render: (value) => <span className="text-xs text-slate-600 truncate block" title={value as string}>{value as string}</span>,
        },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-slate-50/50">
            <PageHeader
                title="Audit Logs"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Reports", href: `/dashboard/${params?.orgId}/reports`, active: false },
                    { label: "Audit Logs", href: `/dashboard/${params?.orgId}/reports/audit`, active: true },
                ]}
            />

            <div className="border-b px-4 py-3 flex items-center justify-between gap-4 sticky top-12 z-20 bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden bg-white">
                        <Button variant="ghost" size="icon" className="h-9 w-9 border-r rounded-none" onClick={handlePrevDay}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={handleNextDay}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="w-56">
                        <DatePickerCalendar
                            selected={date}
                            onSelect={(d) => {
                                if (!d) return;
                                setDate(d);
                                setPage(1);
                                updateSearchParam({ date: d.toISOString() });
                            }}
                            classname="h-9 text-sm"
                            maxDate={new Date()}
                        />
                    </div>

                    <div className="inline-flex items-center rounded-md border bg-white p-1 gap-1">
                        <Button
                            variant={timeScope === "all_time" ? "default" : "ghost"}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => {
                                setTimeScope("all_time");
                                setPage(1);
                                updateSearchParam({ timeScope: "all_time" });
                            }}
                        >
                            All time
                        </Button>
                        <Button
                            variant={timeScope === "selected_day" ? "default" : "ghost"}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => {
                                setTimeScope("selected_day");
                                setPage(1);
                                updateSearchParam({ timeScope: "selected_day" });
                            }}
                        >
                            Selected day
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isPrivileged && (
                        <div className="w-64">
                            <SelectControlled<OrganizationMember>
                                mode="single"
                                value={selectedMember}
                                onChange={(val: OrganizationMember | null) => {
                                    setPage(1);
                                    updateSearchParam({ userId: val?.userId || null });
                                }}
                                onSearch={setOrgSearch}
                                items={members}
                                isLoading={isLoadingMembers}
                                getId={(item: OrganizationMember) => item.id}
                                getLabel={(item: OrganizationMember) => item.user.name}
                                placeholder="Select member..."
                                searchable
                                renderItem={(item: OrganizationMember) => (
                                    <div className="flex items-center gap-2 py-1">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px]">{item.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm truncate">{item.user.name}</span>
                                    </div>
                                )}
                            />
                        </div>
                    )}

                    <div className="w-64">
                        <SelectControlled<AuditProject>
                            mode="single"
                            value={selectedProject}
                            onChange={(val: AuditProject | null) => {
                                setPage(1);
                                updateSearchParam({ projectId: val?.id || null });
                            }}
                            onSearch={setProjectSearch}
                            items={projects}
                            isLoading={isLoadingProjects}
                            getId={(item: AuditProject) => item.id}
                            getLabel={(item: AuditProject) => item.name}
                            placeholder="All Projects"
                            searchable
                        />
                    </div>

                    {!isPrivileged && account && (
                        <div className="flex items-center gap-2 px-3 h-9 border rounded-md bg-slate-50">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">{account.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-700">{account.name}</span>
                        </div>
                    )}

                    <div className="flex items-center rounded-md border bg-white p-1 gap-1">
                        <Button
                            variant={viewMode === "timeline" ? "default" : "ghost"}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => setViewMode("timeline")}
                        >
                            <List className="h-4 w-4 mr-1" /> Timeline
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => setViewMode("table")}
                        >
                            <Table2 className="h-4 w-4 mr-1" /> Table
                        </Button>
                    </div>

                    <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
                        <Settings2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {hasActiveFilters && (
                <div className="border-b bg-white/90 px-4 py-2 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 font-medium">Active filters:</span>

                    {timeScope === "selected_day" && (
                        <Badge variant="secondary" className="h-7 pl-2 pr-1 gap-1 rounded-md">
                            <span className="text-xs">Day: {format(date, "MMM d, yyyy")}</span>
                            <button type="button" onClick={clearDateScopeFilter} className="rounded hover:bg-black/10 p-0.5" aria-label="Clear day filter">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}

                    {selectedMember && (
                        <Badge variant="secondary" className="h-7 pl-2 pr-1 gap-1 rounded-md">
                            <span className="text-xs">Member: {selectedMember.user.name}</span>
                            <button type="button" onClick={clearUserFilter} className="rounded hover:bg-black/10 p-0.5" aria-label="Clear member filter">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}

                    {selectedProject && (
                        <Badge variant="secondary" className="h-7 pl-2 pr-1 gap-1 rounded-md">
                            <span className="text-xs">Project: {selectedProject.name}</span>
                            <button type="button" onClick={clearProjectFilter} className="rounded hover:bg-black/10 p-0.5" aria-label="Clear project filter">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                            setPage(1);
                            setTimeScope("all_time");
                            updateSearchParam({ userId: null, projectId: null, timeScope: "all_time" });
                        }}
                    >
                        Clear all
                    </Button>
                </div>
            )}

            <div className="p-4 lg:p-6 overflow-y-auto flex-1">
                {viewMode === "table" ? (
                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <Table
                            data={logs}
                            columns={columns}
                            loading={isLoading}
                            hover
                            compact
                            bordered={false}
                            className="border-0"
                            headerClassName="bg-transparent h-12 border-b border-slate-100 text-slate-400 font-normal text-xs uppercase tracking-wider"
                            emptyMessage="No audit records found for the selected filters."
                            rowClassName={"border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer"}
                            sortable
                            onRowClick={(row) => setSelectedLog(row)}
                            rowKey={(row: IActivityLog, index: number) => getLogKey(row, index)}
                            minTableWidth="1200px"
                        />

                        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/20">
                            <TablePagination
                                component="div"
                                count={totalResults}
                                page={page}
                                onPageChange={(_, nextPage) => setPage(nextPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(Number(event.target.value));
                                    setPage(1);
                                }}
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                showFirstButton
                                showLastButton
                                className="border-0 p-0"
                            />
                        </div>
                    </div>
                ) : logs.length > 0 ? (
                    <div className="space-y-3">
                        {logs.map((log, index) => {
                            const actorName = log.actor?.name || "Unknown";
                            const targetName = log.target?.name || log.target?.email || log.targetId || "-";
                            const isLast = index === logs.length - 1;

                            return (
                                <div key={getLogKey(log, index)} className="relative pl-8">
                                    {!isLast && <div className="absolute left-3 top-8 bottom-0 w-px bg-slate-200" />}
                                    <div className="absolute left-1.5 top-4 h-3 w-3 rounded-full bg-white border-2 border-slate-300" />

                                    <Card className="border-slate-200 shadow-none hover:border-slate-300 transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                                                    <AvatarImage src={log.actor?.avatar || undefined} alt={actorName} />
                                                    <AvatarFallback className="text-[10px]">{actorName.charAt(0)}</AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                        <span className="text-sm font-medium text-slate-800 truncate max-w-full">{log.description}</span>
                                                        <Badge variant="outline" className="text-[10px] uppercase">{log.type}</Badge>
                                                        <Badge variant="secondary" className="text-[10px]">{actionLabel(log.action)}</Badge>
                                                    </div>

                                                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 min-w-0">
                                                        <span>By {actorName}</span>
                                                        <span>•</span>
                                                        <span className="inline-flex min-w-0 items-center gap-1 max-w-[340px]">
                                                            Target:
                                                            {log.target?.href ? (
                                                                <a
                                                                    href={log.target.href}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="text-primary hover:underline truncate inline-block align-bottom max-w-[240px]"
                                                                    title={targetName}
                                                                >
                                                                    {targetName}
                                                                </a>
                                                            ) : (
                                                                <span className="truncate inline-block align-bottom max-w-[240px]" title={targetName}>{targetName}</span>
                                                            )}
                                                        </span>
                                                        {log.project?.name && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate max-w-[220px]">Project: {log.project.name}</span>
                                                            </>
                                                        )}
                                                        <span>•</span>
                                                        <span className="whitespace-nowrap"><Clock3 className="h-3 w-3 inline mr-1" />{log.createdAt ? format(new Date(log.createdAt), "MMM d, yyyy h:mm a") : "-"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}

                        <div className="border-t border-slate-100 pt-3">
                            <TablePagination
                                component="div"
                                count={totalResults}
                                page={page}
                                onPageChange={(_, nextPage) => setPage(nextPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(Number(event.target.value));
                                    setPage(1);
                                }}
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                showFirstButton
                                showLastButton
                                className="border-0 p-0"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No audit records found</h3>
                        <p className="text-muted-foreground max-w-sm mt-1">
                            No logs were recorded for the selected filters.
                        </p>
                    </div>
                )}
            </div>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Audit event details</DialogTitle>
                        <DialogDescription>
                            Detailed context for this activity log.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="uppercase text-[10px]">{selectedLog.type}</Badge>
                                <Badge variant="secondary" className="text-[10px]">{actionLabel(selectedLog.action)}</Badge>
                                <span className="text-xs text-slate-500">
                                    {selectedLog.createdAt ? format(new Date(selectedLog.createdAt), "MMM d, yyyy h:mm:ss a") : "-"}
                                </span>
                            </div>

                            <div className="rounded-md border bg-slate-50/50 p-3 text-sm text-slate-700">
                                {selectedLog.description}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="rounded-md border p-3 space-y-1 min-w-0">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Actor</p>
                                    <p className="font-medium truncate">{selectedLog.actor?.name || selectedLog.actorId}</p>
                                    <p className="text-slate-600 truncate">{selectedLog.actor?.email || "-"}</p>
                                </div>

                                <div className="rounded-md border p-3 space-y-1 min-w-0 overflow-hidden">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Target</p>
                                    <p className="font-medium truncate">{selectedLog.target?.name || selectedLog.target?.email || selectedLog.targetId || "-"}</p>
                                    {selectedLog.target?.href && (
                                        <a href={selectedLog.target.href} className="text-primary inline-flex items-center gap-1 hover:underline text-xs">
                                            Open target <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>

                                <div className="rounded-md border p-3 space-y-1 min-w-0">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Project</p>
                                    <p className="font-medium truncate">{selectedLog.project?.name || selectedLog.projectId || "-"}</p>
                                    {selectedLog.project?.href && (
                                        <a href={selectedLog.project.href} className="text-primary inline-flex items-center gap-1 hover:underline text-xs">
                                            Open project <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>

                                <div className="rounded-md border p-3 space-y-1 min-w-0">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Organization</p>
                                    <p className="font-medium truncate">{selectedLog.organization?.name || selectedLog.organizationId || "-"}</p>
                                    {selectedLog.organization?.href && (
                                        <a href={selectedLog.organization.href} className="text-primary inline-flex items-center gap-1 hover:underline text-xs">
                                            Open organization <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-md border p-3 min-w-0 overflow-hidden">
                                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Metadata</p>
                                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 ? (
                                    <pre className="text-xs text-slate-700 whitespace-pre-wrap break-all max-w-full">
                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                    </pre>
                                ) : (
                                    <p className="text-sm text-slate-500">No additional metadata.</p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
