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
import { AIInsightsOverlay } from "@/components/ai-insights-overlay";

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
                <AIInsightsOverlay orgId={orgId} className="top-[64px]" />
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
