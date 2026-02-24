"use client"

import { PageHeader } from "@/components/page-header";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, Target, Activity as ActivityIcon, Monitor, MousePointer2, Keyboard, Search, Image as LucideImage, Settings2, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetAggregatedSessions } from "@/services/sessions.services";
import { useAuthStore } from "@/stores/auth.store";
import { useState, useMemo } from "react";
import { endOfDay, startOfDay, format, startOfHour, endOfHour, isWithinInterval, subDays, addDays } from "date-fns";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { OrganizationMember, OrganizationMemberRole } from "@/interfaces/organizations.interfaces";
import { useGetOrganizationMembers } from "@/services/organization.services";
import { useGetProjects } from "@/services/projects.services";
import { SelectControlled } from "@/components/ui/select-controlled";
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionBreakdown } from "@/interfaces/sessions.interfaces";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ActivityPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { account } = useAuthStore();
    const { activeOrg } = useWorkspace();
    const [orgSearch, setOrgSearch] = useState("");
    const [projectSearch, setProjectSearch] = useState("");
    const userIdFromUrl = searchParams.get("userId");
    const projectIdFromUrl = searchParams.get("projectId");

    const isPrivileged = activeOrg?.role === OrganizationMemberRole.OWNER || activeOrg?.role === OrganizationMemberRole.MANAGER;

    const { data: membersData, isLoading: isLoadingMembers } = useGetOrganizationMembers({
        organizationId: params?.orgId as string,
        query: {
            search: orgSearch,
            limit: 200,
            page: 1
        }
    });

    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({
        organizationId: params?.orgId as string,
        userId: account?.id || "",
        query: {
            search: projectSearch,
            limit: 200,
            page: 1
        }
    });

    const members = ((membersData as any)?.results || []).filter((m: OrganizationMember) => m.role === OrganizationMemberRole.MEMBER);
    const projects = ((projectsData as any)?.results || []);
    const selectedMember = members.find((m: OrganizationMember) => m.userId === userIdFromUrl) || null;
    const selectedProject = projects.find((p: any) => p.id === projectIdFromUrl) || null;

    const [date, setDate] = useState<Date>(new Date())

    const effectiveUserId = (isPrivileged && userIdFromUrl) ? userIdFromUrl : (account?.id || "");

    const { data, isLoading: sessionsLoading } = useGetAggregatedSessions({
        userId: effectiveUserId,
        startDate: format(date, "yyyy-MM-dd") + "T00:00:00.000Z",
        endDate: format(date, "yyyy-MM-dd") + "T23:59:59.999Z",
        projectId: projectIdFromUrl || undefined
    })

    const aggregated = data?.at(-1);
    const rawBreakdown = aggregated?.breakdown || [];
    const screenshots = aggregated?.screenshots || [];

    const totalDuration = aggregated?.duration || 0;
    const avgActivity = aggregated?.activityRate || 0;

    const formatDuration = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours % 1) * 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const formatDurationColon = (hours: number) => {
        const totalSeconds = Math.round(hours * 3600);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Group by hour
    const hourlyGroups = useMemo(() => {
        const groups: Record<number, { sessions: SessionBreakdown[], totalHours: number }> = {};
        rawBreakdown.forEach((session) => {
            const hour = new Date(session.startTime).getHours();
            if (!groups[hour]) groups[hour] = { sessions: [], totalHours: 0 };
            groups[hour].sessions.push(session);
            groups[hour].totalHours += session.duration / 60;
        });
        // Sort sessions within each hour ASC
        Object.keys(groups).forEach(h => {
            groups[Number(h)].sessions.sort((a, b) => a.startTime - b.startTime);
        });
        return groups;
    }, [rawBreakdown]);

    const handlePrevDay = () => setDate(subDays(date, 1));
    const handleNextDay = () => setDate(addDays(date, 1));

    const sortedHours = Object.keys(hourlyGroups).map(Number).sort((a, b) => b - a);

    return (
        <div className="flex flex-col h-full w-full bg-slate-50/50">
            <PageHeader
                title="Activity"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Activity", href: `/dashboard/${params?.orgId}/activity`, active: true }
                ]}
            />

            {/* Custom Toolbar based on image */}
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
                            onSelect={(d) => d && setDate(d)}
                            classname="h-9 text-sm"
                            maxDate={new Date()}
                        />
                    </div>

                    <div className="flex items-center gap-1 px-3 h-9 border rounded-md bg-white text-sm font-medium text-slate-600">
                        WAT <ChevronRight className="h-3 w-3 rotate-90" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isPrivileged && (
                        <div className="w-64">
                            <SelectControlled<OrganizationMember>
                                mode="single"
                                value={selectedMember}
                                onChange={(val: OrganizationMember | null) => {
                                    const nextParams = new URLSearchParams(searchParams.toString());
                                    if (val) {
                                        nextParams.set("userId", val.userId);
                                    } else {
                                        nextParams.delete("userId");
                                    }
                                    router.push(`?${nextParams.toString()}`);
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
                        <SelectControlled<any>
                            mode="single"
                            value={selectedProject}
                            onChange={(val: any | null) => {
                                const nextParams = new URLSearchParams(searchParams.toString());
                                if (val) {
                                    nextParams.set("projectId", val.id);
                                } else {
                                    nextParams.delete("projectId");
                                }
                                router.push(`?${nextParams.toString()}`);
                            }}
                            onSearch={setProjectSearch}
                            items={projects}
                            isLoading={isLoadingProjects}
                            getId={(item: any) => item.id}
                            getLabel={(item: any) => item.name}
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

                    <Button variant="outline" size="sm" className="h-9 gap-2 text-primary border-primary/20 hover:bg-primary/5 font-semibold px-4">
                        Filters
                    </Button>

                    <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
                        <Settings2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="p-4 lg:p-6 space-y-8 overflow-y-auto flex-1">
                {sessionsLoading ? (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                        </div>
                        {[1, 2].map(i => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {[1, 2, 3, 4, 5].map(j => <Skeleton key={j} className="h-64 rounded-xl" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedHours.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Total Time"
                                value={formatDuration(totalDuration)}
                            />
                            <MetricCard
                                title="Avg. Activity"
                                value={`${Math.round(avgActivity)}%`}
                            />
                        </div>

                        <div className="space-y-12 pb-10">
                            {sortedHours.map((hour) => {
                                const group = hourlyGroups[hour];
                                const hourDate = new Date(date);
                                hourDate.setHours(hour, 0, 0, 0);
                                const endHourDate = new Date(hourDate);
                                endHourDate.setHours(hour + 1, 0, 0, 0);

                                return (
                                    <div key={hour} className="relative pl-8 border-l-2 border-slate-200 ml-2">
                                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-slate-300 z-1" />

                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="text-sm font-bold text-slate-600">
                                                {format(hourDate, "h:mm a")} - {format(endHourDate, "h:mm a")}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                                Total time worked: <span className="text-slate-600 font-bold">{formatDurationColon(group.totalHours)}</span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                            {group.sessions.map((session: SessionBreakdown) => {
                                                const screenshot = screenshots.find(s => s.sessionUuid === session.uuid);
                                                const activityColor = session.activity > 70 ? "bg-emerald-500" : session.activity > 40 ? "bg-amber-500" : "bg-rose-500";

                                                return (
                                                    <Card key={session.id} className="group overflow-hidden border-slate-200 shadow-none hover:border-slate-300 transition-all rounded-lg bg-white p-0 gap-0">
                                                        <CardContent className="p-0 flex flex-col h-full">
                                                            {/* Project Badge */}
                                                            <div className="p-2 flex flex-col items-center justify-center text-center gap-1">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-slate-100 px-2 py-0.5 rounded shrink-0 max-w-full truncate">
                                                                    {session.project.name}
                                                                </span>
                                                            </div>

                                                            {/* Screenshot Area */}
                                                            <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                                                                {screenshot ? (
                                                                    <img
                                                                        src={screenshot.url}
                                                                        alt="Session screenshot"
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    />
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-1.5 opacity-30">
                                                                        <LucideImage className="h-6 w-6 text-slate-400" />
                                                                        <span className="text-[10px] font-medium text-slate-500">No screenshot</span>
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                                            </div>

                                                            {/* Session Details */}
                                                            <div className="px-3 pb-2 space-y-1">
                                                                <div className="text-center">
                                                                    <span className="text-[10px] font-bold text-slate-600">
                                                                        {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                                                                    </span>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full ${activityColor} transition-all duration-700 ease-out`}
                                                                            style={{ width: `${session.activity}%` }}
                                                                        />
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <span className="text-[10px] font-bold text-slate-500">
                                                                            {Math.round(session.activity)}% of {Math.round(session.duration)} minutes
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-muted/40 p-6 rounded-full mb-6">
                            <Search className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">No activity records found</h3>
                        <p className="text-muted-foreground max-w-sm mt-2 text-[15px]">
                            {selectedMember
                                ? `${selectedMember?.user.name} hasn't logged any work sessions for this date.`
                                : isPrivileged
                                    ? "No activity found for your account. You can select a team member from the filter above to view their logs."
                                    : "You haven't logged any work sessions for this date yet."}
                        </p>
                        <Button
                            variant="outline"
                            className="mt-8 h-9 text-xs font-medium rounded-lg"
                            onClick={() => setDate(new Date())}
                        >
                            Reset to Today
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
