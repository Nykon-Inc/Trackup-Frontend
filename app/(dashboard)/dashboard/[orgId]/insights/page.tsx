"use client"

import { PageHeader } from "@/components/page-header"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { useGetInsightsToReview, useGetOrgInsights } from "@/services/ai.services";
import { IInsightReviewSummary, IOrgHourlyInsight } from "@/interfaces/ai.interfaces";
import { useGetProjects } from "@/services/projects.services";
import { SelectControlled } from "@/components/ui/select-controlled";
import { useAuthStore } from "@/stores/auth.store";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { format, startOfDay } from 'date-fns';
import { CustomTabs } from "@/components/custom-tabs";
import Overview from "./_components/Overview";
import StaffToReview from "./_components/StaffToReview";
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar";
import JobTrackerRefresh from "./_components/JobTrackerRefresh";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lightbulb, Lock, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const DUMMY_INSIGHTS: IOrgHourlyInsight[] = [
    {
        id: "1",
        organizationId: "org-1",
        batchId: "batch-1",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        executiveSummary: "Team output remains strong with high role-alignment. Most members are maintaining consistent focus blocks despite increased context switching in the afternoon.",
        integrityStatus: 'stable',
        distribution: { sustained: 75, fragmented: 15, idle: 10 },
        signals: { fragmentedCount: 2, idleCount: 1 },
        stats: { totalAnalyzedHours: 1240, staffCount: 45, inconsistentScreenshotsCount: 3 },
        flaggedStaff: []
    }
];

const DUMMY_STAFF_TO_REVIEW: IInsightReviewSummary[] = [
    {
        userId: "u-1",
        projectId: "p-1",
        count: 1,
        latestInsight: {
            id: "ins-1",
            userId: "u-1",
            organizationId: "org-1",
            projectId: "p-1",
            batchId: "b-1",
            dayCode: "2024-01-01",
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            notes: "",
            user: { name: "Alex Rivera", email: "alex@example.com", avatar: "" } as any,
            project: { name: "Mobile App Refactor" } as any,
            aiResult: { activity_pattern: "Fragmented Work Blocks", primary_activity: "Development" } as any
        } as any
    },
    {
        userId: "u-2",
        projectId: "p-2",
        count: 2,
        latestInsight: {
            id: "ins-2",
            userId: "u-2",
            organizationId: "org-1",
            projectId: "p-2",
            batchId: "b-1",
            dayCode: "2024-01-01",
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            notes: "",
            user: { name: "Sarah Chen", email: "sarah@example.com", avatar: "" } as any,
            project: { name: "Backend Security" } as any,
            aiResult: { activity_pattern: "Extended Idle Windows", primary_activity: "Research" } as any
        } as any
    }
];

export default function InsightsPage() {
    const params = useParams();
    const orgId = params?.orgId as string;
    const router = useRouter();
    const queryParams = useSearchParams();
    const { account, organization } = useAuthStore();
    const { activeOrg, isLoading: isLoadingWorkspace } = useWorkspace();

    const [date, setDate] = useState<Date | undefined>(startOfDay(new Date()));
    const [projectSearch, setProjectSearch] = useState("");
    const projectIdFromUrl = queryParams.get("projectId");

    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({
        organizationId: orgId,
        userId: account?.id || "",
        query: {
            search: projectSearch,
            limit: 200,
            page: 1
        }
    });

    const projects = ((projectsData as any)?.results || []);
    const selectedProject = projects.find((p: any) => p.id === projectIdFromUrl) || null;

    const isOwner = activeOrg?.role === "owner";
    const insightsEnabled = !!(activeOrg?.organization?.insightsEnabled || activeOrg?.organization?.enableInsights);
    const insightsDisabled = !isLoadingWorkspace && !insightsEnabled;

    const { data: insights, isLoading } = useGetOrgInsights({
        organizationId: orgId,
        dayCode: date ? format(date, 'yyyy-MM-dd') : undefined,
    });

    const displayInsights = insightsEnabled ? (insights || []) : DUMMY_INSIGHTS;

    const { data: insightsToReview, isLoading: isLoadingReviewers } = useGetInsightsToReview({
        organizationId: orgId,
        dayCode: date ? format(date, 'yyyy-MM-dd') : undefined,
        projectId: projectIdFromUrl || undefined,
        page: 1,
        limit: 20,
    });

    const displayStaffToReview = insightsEnabled ? (insightsToReview?.results || []) : DUMMY_STAFF_TO_REVIEW;

    const tab = queryParams.get("tab") || "overview";

    const isManagerOrOwner = ["owner", "manager"].includes(activeOrg?.role || "");

    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden">
            <PageHeader
                title="Insights"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${orgId}`, active: false },
                    { label: "Insights", href: `/dashboard/${orgId}/insights`, active: true }
                ]}
            />

            {insightsDisabled && (
                <div className="absolute inset-x-0 bottom-0 top-[64px] z-100 flex items-start justify-center p-4">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
                    <div className="max-w-md mt-32 w-full bg-white border border-border shadow-2xl rounded-xl p-10 text-center animate-in fade-in zoom-in duration-500 relative z-10">
                        <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                            {isOwner ? <Lightbulb className="h-10 w-10 text-primary" /> : <Lock className="h-10 w-10 text-primary" />}
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-3">
                            {isOwner ? "Enable AI Insights" : "Insights Restricted"}
                        </h2>
                        <p className="text-neutral-500 mb-8 leading-relaxed text-balance">
                            {isOwner
                                ? "To unlock powerful AI-driven analytics and productivity trends, you need to enable the Insights setting in your organization settings."
                                : "Powerful AI-driven analytics are currently disabled for this organization. Please contact your organization owner to enable this feature."
                            }
                        </p>
                        <div className="flex flex-col gap-3">
                            {isOwner ? (
                                <Button asChild size="lg" className="w-full font-bold shadow-lg shadow-primary/20">
                                    <Link href={`/dashboard/${orgId}/settings`}>
                                        Go to Settings
                                    </Link>
                                </Button>
                            ) : (
                                <div className="p-4 bg-muted rounded-xl flex items-center gap-3 text-left">
                                    <UserCog className="h-5 w-5 text-muted-foreground" />
                                    <div className="text-xs">
                                        <p className="font-bold text-neutral-900 uppercase tracking-wider">Contact Admin</p>
                                        <p className="text-neutral-500">Only organization owners can manage this setting.</p>
                                    </div>
                                </div>
                            )}
                            <Button asChild variant="ghost" size="sm" className="w-full text-neutral-400 hover:text-neutral-600">
                                <Link href={`/dashboard/${orgId}`}>
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className={cn("flex flex-col flex-1 w-full transition-all duration-1000", insightsDisabled && "blur-[1.5px] opacity-90 select-none pointer-events-none")}>
                <div className="border-b px-4 py-2 flex items-center justify-between gap-4 sticky top-12 z-20 bg-white shrink-0">
                    <div className="flex gap-2">
                        {isManagerOrOwner && <JobTrackerRefresh orgId={orgId} date={date} />}
                        <DatePickerCalendar
                            onSelect={(date) => {
                                setDate(date!)
                            }}
                            selected={date}
                            maxDate={new Date()}
                        />

                        {tab === "staff-to-review" && (
                            <div className="w-64">
                                <SelectControlled<any>
                                    mode="single"
                                    value={selectedProject}
                                    onChange={(val: any | null) => {
                                        const nextParams = new URLSearchParams(queryParams.toString());
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
                        )}
                    </div>
                </div>
                <div className="px-4 lg:px-6 pt-4">
                    <CustomTabs
                        persistInRoute
                        tabs={[
                            { label: "Overview", value: "overview" },
                            { label: "Staff to Review", value: "staff-to-review" },
                            { label: "Trends", value: "trends" }
                        ]}
                        defaultValue={tab}
                    />
                </div>

                <div className="p-4 lg:p-6 flex flex-col gap-6">
                    {tab === "overview" && <Overview insights={displayInsights} isLoading={isLoading && insightsEnabled} />}
                    {tab === "staff-to-review" && <StaffToReview staffToReview={displayStaffToReview} isLoading={isLoadingReviewers && insightsEnabled} />}
                    {/* {tab === "trends" && <Trends insights={displayInsights} />} */}
                </div>
            </div>
        </div>
    )
}
