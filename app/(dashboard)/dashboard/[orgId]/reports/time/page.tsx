"use client"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import Table, { TableColumn } from "@/components/ui/data-table"
import { SelectControlled } from "@/components/ui/select-controlled"
import TablePagination from "@/components/ui/table-pagination"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { MetricCard } from "@/components/dashboard/metric-card"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { useGetOrganizationMembers } from "@/services/organization.services"
import { useGetProjects } from "@/services/projects.services"
import { useGetAggregatedSessions } from "@/services/sessions.services"
import { useAuthStore } from "@/stores/auth.store"
import { OrganizationMember, OrganizationMemberRole } from "@/interfaces/organizations.interfaces"
import { AggregatedSessions } from "@/interfaces/sessions.interfaces"
import { format, subDays } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DateRange } from "react-day-picker"
import { useParams, useRouter } from "next/navigation"
import { Download, Filter, Play, Save, Timer } from "lucide-react"
import { useMemo, useState } from "react"

type GroupByOption = {
    id: "day" | "week" | "month"
    name: string
}

type TimeProject = {
    id: string
    name: string
}

type OrganizationOption = {
    id: string
    name: string
}

type TimeReportRow = {
    id: string
    date: string
    member?: string
    project: string
    totalHours: string
    activity: string
    totalEarned: string
}

type TimeChartRow = {
    day: string
    tracked: number
    manual: number
    sortAt: number
}

const groupedByOptions: GroupByOption[] = [
    { id: "day", name: "Date per day" },
    { id: "week", name: "Date per week" },
    { id: "month", name: "Date per month" },
]

const chartConfig = {
    tracked: {
        label: "Tracked",
        color: "#000000",
    },
    manual: {
        label: "Manual",
        color: "#10B981",
    },
} satisfies ChartConfig

const toDayStartIso = (date: Date) => `${format(date, "yyyy-MM-dd")}T00:00:00.000Z`
const toDayEndIso = (date: Date) => `${format(date, "yyyy-MM-dd")}T23:59:59.999Z`

const formatHoursToClock = (hours: number) => {
    const totalSeconds = Math.round(hours * 3600)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export default function TimeReportsPage() {
    const params = useParams()
    const router = useRouter()
    const orgId = params?.orgId as string
    const { account } = useAuthStore()
    const { activeOrg, activeOrgId, organizations } = useWorkspace()

    const role = activeOrg?.role as OrganizationMemberRole | undefined
    const canViewOrgFilter = role === OrganizationMemberRole.OWNER
    const canViewMemberFilter = role === OrganizationMemberRole.OWNER || role === OrganizationMemberRole.MANAGER
    const isMember = role === OrganizationMemberRole.MEMBER

    const [orgSearch, setOrgSearch] = useState("")
    const [memberSearch, setMemberSearch] = useState("")
    const [projectSearch, setProjectSearch] = useState("")
    const [groupSearch, setGroupSearch] = useState("")
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [groupedBy, setGroupedBy] = useState<GroupByOption | null>(groupedByOptions[0])
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 13),
        to: new Date(),
    })

    const { data: membersData, isLoading: isLoadingMembers } = useGetOrganizationMembers({
        organizationId: orgId,
        query: {
            search: memberSearch,
            limit: 200,
            page: 1,
        },
    })

    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({
        organizationId: orgId,
        userId: account?.id || "",
        query: {
            search: projectSearch,
            limit: 200,
            page: 1,
        },
    })

    const organizationOptions = useMemo<OrganizationOption[]>(() => {
        const owned = organizations.filter((org) => (org.role || "").toLowerCase() === OrganizationMemberRole.OWNER)
        const map = new Map<string, OrganizationOption>()
        owned.forEach((org) => {
            if (org.organization?.id && org.organization?.name) {
                map.set(org.organization.id, { id: org.organization.id, name: org.organization.name })
            }
        })
        if (map.size === 0 && activeOrg?.organization?.id) {
            map.set(activeOrg.organization.id, {
                id: activeOrg.organization.id,
                name: activeOrg.organization.name,
            })
        }
        return Array.from(map.values())
    }, [organizations, activeOrg])

    const filteredOrganizations = useMemo(() => {
        if (!orgSearch) return organizationOptions
        return organizationOptions.filter((org) => org.name.toLowerCase().includes(orgSearch.toLowerCase()))
    }, [orgSearch, organizationOptions])

    const members = useMemo<OrganizationMember[]>(() => {
        const list = ((membersData as { results?: OrganizationMember[] } | undefined)?.results) || []
        return list.filter((member) => member.role === OrganizationMemberRole.MEMBER)
    }, [membersData])

    const projects = useMemo<TimeProject[]>(() => {
        return ((projectsData as { results?: TimeProject[] } | undefined)?.results) || []
    }, [projectsData])

    const filteredGroupedBy = useMemo(() => {
        if (!groupSearch) return groupedByOptions
        return groupedByOptions.filter((item) => item.name.toLowerCase().includes(groupSearch.toLowerCase()))
    }, [groupSearch])

    const selectedOrganization = useMemo(
        () => organizationOptions.find((org) => org.id === activeOrgId) || null,
        [organizationOptions, activeOrgId]
    )

    const selectedMember = useMemo(
        () => members.find((member) => member.userId === selectedMemberId) || null,
        [members, selectedMemberId]
    )

    const selectedProject = useMemo(
        () => projects.find((project) => project.id === selectedProjectId) || null,
        [projects, selectedProjectId]
    )

    const fromDate = dateRange?.from || subDays(new Date(), 13)
    const toDate = dateRange?.to || fromDate

    const effectiveUserId = isMember ? (account?.id || undefined) : (selectedMemberId || undefined)

    const aggregatedQuery = useMemo(() => ({
        userId: effectiveUserId,
        organizationId: effectiveUserId ? undefined : orgId,
        projectId: selectedProjectId || undefined,
        startDate: toDayStartIso(fromDate),
        endDate: toDayEndIso(toDate),
        groupBy: groupedBy?.id || "day",
        splitByProject: true,
    }), [effectiveUserId, orgId, selectedProjectId, fromDate, toDate, groupedBy])

    const { data: sessionsData, isLoading: isLoadingAggregates } = useGetAggregatedSessions(aggregatedQuery)

    const aggregatedRows = useMemo(() => (sessionsData || []) as AggregatedSessions[], [sessionsData])

    const membersByUserId = useMemo(() => {
        const map = new Map<string, string>()
        members.forEach((member) => {
            map.set(member.userId, member.user?.name || "Unknown")
        })
        return map
    }, [members])

    const totalTrackedHours = useMemo(
        () => aggregatedRows.reduce((sum, row) => sum + (row.duration || 0), 0),
        [aggregatedRows]
    )

    const averageActivity = useMemo(() => {
        const totalDuration = aggregatedRows.reduce((sum, row) => sum + (row.duration || 0), 0)
        if (!totalDuration) return 0
        const weighted = aggregatedRows.reduce((sum, row) => sum + ((row.activityRate || 0) * (row.duration || 0)), 0)
        return Math.round(weighted / totalDuration)
    }, [aggregatedRows])

    const totalSpent = useMemo(
        () => aggregatedRows.reduce((sum, row) => sum + (row.totalSpent || 0), 0),
        [aggregatedRows]
    )

    const chartData = useMemo<TimeChartRow[]>(() => {
        const byBucket = new Map<string, TimeChartRow>()

        aggregatedRows.forEach((row) => {
            const key = row.bucketKey || row.day
            const label = row.bucketLabel || format(new Date(row.day), "MMM d, yyyy")
            const manualFromBreakdown = (row.breakdown || []).reduce((sum, session) => {
                if (!session.isManual) return sum
                return sum + ((session.duration || 0) / (1000 * 60 * 60))
            }, 0)
            const trackedDuration = Math.max(0, (row.duration || 0) - manualFromBreakdown)
            const existing = byBucket.get(key)
            if (existing) {
                existing.tracked += trackedDuration
                existing.manual += manualFromBreakdown
                return
            }

            byBucket.set(key, {
                day: label,
                tracked: trackedDuration,
                manual: manualFromBreakdown,
                sortAt: row.startTime || 0,
            })
        })

        return Array.from(byBucket.values()).sort((a, b) => a.sortAt - b.sortAt)
    }, [aggregatedRows])

    const tableRows = useMemo<TimeReportRow[]>(() => {
        return aggregatedRows
            .slice()
            .sort((a, b) => (a.startTime || 0) - (b.startTime || 0))
            .map((row, index) => ({
                id: `${row.bucketKey || row.day}-${row.projectId}-${row.userId}-${index}`,
                date: row.bucketLabel || format(new Date(row.day), "EEE, MMM d, yyyy"),
                member: membersByUserId.get(row.userId) || account?.name || "-",
                project: row.projectName || "-",
                totalHours: formatHoursToClock(row.duration || 0),
                activity: `${Math.round(row.activityRate || 0)}%`,
                totalEarned: `$${(row.totalSpent || 0).toFixed(2)}`,
            }))
    }, [aggregatedRows, membersByUserId, account?.name])

    const totalRowCount = tableRows.length

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        return tableRows.slice(start, start + rowsPerPage)
    }, [page, rowsPerPage, tableRows])

    const columns = useMemo<TableColumn<TimeReportRow>[]>(() => {
        const totalAmountHeader = canViewMemberFilter ? "Total spent" : "Total earned"

        const base: TableColumn<TimeReportRow>[] = [
            { header: "Date", key: "date", sortable: true, width: "260px", className: "font-medium" },
            { header: "Project", key: "project", width: "220px" },
            { header: "Total hours", key: "totalHours", width: "140px" },
            { header: "Activity %", key: "activity", width: "120px" },
            { header: totalAmountHeader, key: "totalEarned", width: "150px" },
        ]

        if (canViewMemberFilter) {
            base.splice(1, 0, { header: "Member", key: "member", width: "180px" })
        }

        return base
    }, [canViewMemberFilter])

    return (
        <div className="flex flex-col h-full w-full bg-muted/20">
            <PageHeader
                title="Time Reports"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Reports", href: `/dashboard/${params?.orgId}/reports`, active: false },
                    { label: "Time Reports", href: `/dashboard/${params?.orgId}/reports/time`, active: true },
                ]}
            />

            <div className="border-b bg-white px-4 py-4 lg:px-6 lg:py-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {canViewOrgFilter && (
                            <div className="w-[220px]">
                                <SelectControlled<OrganizationOption>
                                    mode="single"
                                    value={selectedOrganization}
                                    onChange={(organization) => {
                                        if (!organization || organization.id === orgId) return
                                        router.push(`/dashboard/${organization.id}/reports/time`)
                                    }}
                                    onSearch={setOrgSearch}
                                    items={filteredOrganizations}
                                    getId={(item) => item.id}
                                    getLabel={(item) => item.name}
                                    placeholder="Organization"
                                    searchable
                                    buttonClassName="h-10"
                                />
                            </div>
                        )}

                        {canViewMemberFilter && (
                            <div className="w-[220px]">
                                <SelectControlled<OrganizationMember>
                                    mode="single"
                                    value={selectedMember}
                                    onChange={(member) => {
                                        setSelectedMemberId(member?.userId || null)
                                        setPage(1)
                                    }}
                                    onSearch={setMemberSearch}
                                    items={members}
                                    isLoading={isLoadingMembers}
                                    getId={(item) => item.userId}
                                    getLabel={(item) => item.user.name}
                                    placeholder="All members"
                                    searchable
                                    buttonClassName="h-10"
                                />
                            </div>
                        )}

                        <div className="w-[220px]">
                            <SelectControlled<TimeProject>
                                mode="single"
                                value={selectedProject}
                                onChange={(project) => {
                                    setSelectedProjectId(project?.id || null)
                                    setPage(1)
                                }}
                                onSearch={setProjectSearch}
                                items={projects}
                                isLoading={isLoadingProjects}
                                getId={(item) => item.id}
                                getLabel={(item) => item.name}
                                placeholder="All projects"
                                searchable
                                buttonClassName="h-10"
                            />
                        </div>

                        <DatePickerWithRange
                            date={dateRange}
                            setDate={setDateRange}
                            className="[&>button]:h-10 [&>button]:w-[340px]"
                        />

                        <span className="text-sm font-medium text-foreground">PST</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="icon" className="h-10 w-10 text-primary border-border">
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-10 text-primary border-border">
                            <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-10 text-primary border-border">
                            <Timer className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="h-10 gap-2 border-border text-primary">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button className="h-10 px-5 gap-2">
                            <Save className="h-4 w-4" />
                            Save
                        </Button>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Data grouped by</p>
                    <div className="w-[190px]">
                        <SelectControlled<GroupByOption>
                            mode="single"
                            value={groupedBy}
                            onChange={(value) => {
                                setGroupedBy(value)
                                setPage(1)
                            }}
                            onSearch={setGroupSearch}
                            items={filteredGroupedBy}
                            getId={(item) => item.id}
                            getLabel={(item) => item.name}
                            searchable
                            buttonClassName="h-10"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 lg:p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard title="Total time" value={formatHoursToClock(totalTrackedHours)} />
                    <MetricCard title="Average activity" value={`${averageActivity}%`} />
                    <MetricCard title="Total spent" value={`$${totalSpent.toFixed(2)}`} />
                </div>

                <Card className="py-0 gap-0 border-border">
                    <CardContent className="px-0 py-0">
                        <div className="flex justify-end gap-4 px-6 pt-5 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#000000" }} />
                                Tracked
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#10B981" }} />
                                Manual
                            </span>
                        </div>
                        <div className="h-[392px] w-full pt-2 pr-3 pb-6">
                            <ChartContainer className="aspect-auto h-full w-full" config={chartConfig}>
                                <BarChart data={chartData} barGap={10} margin={{ top: 12, right: 16, left: 4, bottom: 24 }}>
                                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border)" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={12}
                                        interval={0}
                                        angle={-12}
                                        textAnchor="end"
                                        height={56}
                                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => `${value.toFixed(1)}h`}
                                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="tracked" fill="var(--color-tracked)" radius={[6, 6, 0, 0]} maxBarSize={24} />
                                    <Bar dataKey="manual" fill="var(--color-manual)" radius={[6, 6, 0, 0]} maxBarSize={24} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="py-0 gap-0 border-border overflow-hidden">
                    <CardContent className="px-0 py-0">
                        <Table
                            data={paginatedRows}
                            columns={columns}
                            loading={isLoadingAggregates}
                            emptyMessage="No time report entries found for the selected filters"
                            sortable
                            hover
                            compact
                            bordered={false}
                            minTableWidth={canViewMemberFilter ? "1300px" : "1120px"}
                            headerClassName="h-12 border-b border-border bg-muted/30 text-muted-foreground text-sm font-semibold normal-case tracking-normal"
                            rowClassName="border-b border-border/70 last:border-0"
                        />

                        <div className="border-t border-border px-2">
                            <TablePagination
                                component="div"
                                count={totalRowCount}
                                page={page}
                                onPageChange={(_, nextPage) => setPage(nextPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(Number(event.target.value))
                                    setPage(1)
                                }}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                showFirstButton
                                showLastButton
                                className="border-0 p-0"
                            />
                        </div>
                    </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground">
                    Showing {selectedProject?.name || "all projects"}
                    {canViewMemberFilter ? ` for ${selectedMember?.user.name || "all members"}` : ""}
                    {selectedOrganization ? ` in ${selectedOrganization.name}` : ""}
                    {` from ${format(fromDate, "MMM d, yyyy")} to ${format(toDate, "MMM d, yyyy")}.`}
                </p>
            </div>
        </div>
    )
}
