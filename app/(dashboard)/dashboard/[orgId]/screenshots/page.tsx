"use client"

import { PageHeader } from "@/components/page-header";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter, Image as LucideImage, Search, Settings2 } from "lucide-react";
import { useGetAggregatedSessions } from "@/services/sessions.services";
import { useAuthStore } from "@/stores/auth.store";
import { useState, useMemo } from "react";
import { endOfDay, startOfDay, format, subDays, addDays } from "date-fns";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { OrganizationMember, OrganizationMemberRole } from "@/interfaces/organizations.interfaces";
import { useGetOrganizationMembers } from "@/services/organization.services";
import { useGetProjects } from "@/services/projects.services";
import { SelectControlled } from "@/components/ui/select-controlled";
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionBreakdown } from "@/interfaces/sessions.interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ScreenshotsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { account } = useAuthStore();
    const { activeOrg } = useWorkspace();
    const [orgSearch, setOrgSearch] = useState("");
    const [projectSearch, setProjectSearch] = useState("");
    const [date, setDate] = useState<Date>(new Date());
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

    const members = (membersData as any)?.results || [];
    const projects = (projectsData as any)?.results || [];
    const selectedMember = members.find((m: OrganizationMember) => m.userId === userIdFromUrl) || null;
    const selectedProject = projects.find((p: any) => p.id === projectIdFromUrl) || null;

    const effectiveUserId = (isPrivileged && userIdFromUrl) ? userIdFromUrl : (account?.id || "");

    const { data, isLoading: sessionsLoading } = useGetAggregatedSessions({
        userId: effectiveUserId,
        startDate: startOfDay(date).toISOString(),
        endDate: endOfDay(date).toISOString(),
        projectId: projectIdFromUrl || undefined
    });

    const aggregated = data?.[0];
    const rawBreakdown = aggregated?.breakdown || [];
    const screenshots = aggregated?.screenshots || [];

    const formatDurationColon = (hours: number) => {
        const totalSeconds = Math.round(hours * 3600);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    const hourlyGroups = useMemo(() => {
        const groups: Record<number, { sessions: SessionBreakdown[], totalHours: number }> = {};
        rawBreakdown.forEach((session) => {
            const hour = new Date(session.startTime).getHours();
            if (!groups[hour]) groups[hour] = { sessions: [], totalHours: 0 };
            groups[hour].sessions.push(session);
            groups[hour].totalHours += session.duration / 60;
        });
        Object.keys(groups).forEach(h => {
            groups[Number(h)].sessions.sort((a, b) => a.startTime - b.startTime);
        });
        return groups;
    }, [rawBreakdown]);

    const sortedHours = Object.keys(hourlyGroups).map(Number).sort((a, b) => b - a);

    const handlePrevDay = () => setDate(subDays(date, 1));
    const handleNextDay = () => setDate(addDays(date, 1));

    return (
        <div className="flex flex-col h-full w-full bg-white">
            <PageHeader
                title="Screenshots"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Screenshots", href: `/dashboard/${params?.orgId}/screenshots`, active: true }
                ]}
            />

            {/* Custom Toolbar based on image */}
            <div className="border-b px-4 py-3 flex items-center justify-between gap-4 sticky top-12 z-20 bg-white">
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

            <div className="p-4 lg:p-8 space-y-12 overflow-y-auto flex-1 max-w-[1600px] mx-auto w-full">
                {sessionsLoading ? (
                    <div className="space-y-12">
                        {[1, 2].map(i => (
                            <div key={i} className="space-y-6">
                                <Skeleton className="h-6 w-64" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {[1, 2, 3, 4].map(j => <Skeleton key={j} className="h-56 rounded-xl" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedHours.length > 0 ? (
                    <div className="space-y-16 pb-20">
                        {sortedHours.map((hour) => {
                            const group = hourlyGroups[hour];
                            const hourDate = new Date(date);
                            hourDate.setHours(hour, 0, 0, 0);
                            const endHourDate = new Date(hourDate);
                            endHourDate.setHours(hour + 1, 0, 0, 0);

                            return (
                                <div key={hour} className="relative pl-10 border-l-2 border-slate-100 ml-2">
                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-slate-200 z-1" />

                                    <div className="flex items-center gap-4 mb-8">
                                        <span className="text-base font-bold text-slate-700">
                                            {format(hourDate, "h:mm a")} - {format(endHourDate, "h:mm a")}
                                        </span>
                                        <span className="text-sm text-slate-400 font-medium">
                                            Total time worked: <span className="text-slate-700 font-bold">{formatDurationColon(group.totalHours)}</span>
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {group.sessions.map((session) => {
                                            const sessionScreenshots = screenshots.filter(s => s.sessionUuid === session.uuid);

                                            if (sessionScreenshots.length === 0) {
                                                return (
                                                    <Card key={session.id} className="border-slate-100 bg-slate-50 shadow-none rounded-sm border-2 border-dashed">
                                                        <CardContent className="p-0 flex flex-col aspect-video items-center justify-center text-center gap-3">
                                                            <div className="bg-slate-200/50 p-3 rounded-md">
                                                                <LucideImage className="h-8 w-8 text-slate-400" />
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-400">No screenshots</span>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            }

                                            return sessionScreenshots.map((s, idx) => (
                                                <Card key={`${session.id}-${idx}`} className="group overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all rounded-sm bg-white p-0 gap-0">
                                                    <CardContent className="p-0 flex flex-col h-full">
                                                        <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                                            <img
                                                                src={s.url}
                                                                alt="Work capture"
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                                                <Badge className="bg-white/90 hover:bg-white text-slate-800 border-none text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                                                                    {format(new Date(s.timestamp), "h:mm a")}
                                                                </Badge>
                                                                <Badge className="bg-emerald-500/90 text-white border-none text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                                                                    {Math.round(session.activity)}%
                                                                </Badge>
                                                            </div>

                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/90 hover:bg-white border-none shadow-sm">
                                                                    <Search className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="p-2 border-t bg-slate-50/50">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-[11px] font-bold text-slate-600 truncate uppercase tracking-tight">
                                                                    {session.project.name}
                                                                </span>
                                                                <span className="text-[10px] font-medium text-slate-400">
                                                                    {Math.round(session.duration)}m
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-50 p-8 rounded-full mb-8">
                            <LucideImage className="h-12 w-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">No screenshots found</h3>
                        <p className="text-slate-400 max-w-sm mt-3 text-lg">
                            {selectedMember
                                ? `${selectedMember?.user.name} hasn't captured any screenshots on this day.`
                                : "There are no screenshots to display for the selected date."}
                        </p>
                        <Button
                            variant="outline"
                            className="mt-10 h-11 text-sm font-semibold rounded-xl px-8 border-slate-200 hover:bg-slate-50"
                            onClick={() => setDate(new Date())}
                        >
                            Back to Today
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
