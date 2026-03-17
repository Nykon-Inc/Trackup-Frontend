"use client"

import { PageHeader } from "@/components/page-header"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { useGetInsightsToReview, useGetOrgInsights } from "@/services/ai.services";
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
import { Lightbulb } from "lucide-react";

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

    const { data: insights, isLoading } = useGetOrgInsights({
        organizationId: orgId,
        dayCode: date ? format(date, 'yyyy-MM-dd') : undefined,
    });

    const { data: insightsToReview, isLoading: isLoadingReviewers } = useGetInsightsToReview({
        organizationId: orgId,
        dayCode: date ? format(date, 'yyyy-MM-dd') : undefined,
        projectId: projectIdFromUrl || undefined,
        page: 1,
        limit: 20,
    });
    const tab = queryParams.get("tab") || "overview";

    return (
        <div className="flex flex-col h-full w-full relative">
            {!isLoadingWorkspace && !activeOrg?.organization?.insightsEnabled && (
                <div className="absolute inset-0 z-100 bg-white/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white border border-border shadow-2xl rounded-2xl p-10 text-center animate-in fade-in zoom-in duration-500">
                        <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                            <Lightbulb className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-3">AI Insights is Disabled</h2>
                        <p className="text-neutral-500 mb-8 leading-relaxed text-balance">
                            To unlock powerful AI-driven analytics and productivity trends, you need to enable the <b>Insights</b> setting in your organization settings.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button asChild size="lg" className="w-full font-bold shadow-lg shadow-primary/20">
                                <Link href={`/dashboard/${orgId}/settings`}>
                                    Go to Settings
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="w-full text-neutral-400 hover:text-neutral-600">
                                <Link href={`/dashboard/${orgId}`}>
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <PageHeader
                title="Insights"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${orgId}`, active: false },
                    { label: "Insights", href: `/dashboard/${orgId}/insights`, active: true }
                ]}
            />

            <div className="border-b px-4 py-2 flex items-center justify-between gap-4 sticky top-12 z-20 bg-white shrink-0">
                <div className="flex gap-2">
                    <JobTrackerRefresh orgId={orgId} date={date} />
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
                {tab === "overview" && <Overview insights={insights || []} isLoading={isLoading} />}
                {tab === "staff-to-review" && <StaffToReview staffToReview={insightsToReview?.results || []} isLoading={isLoadingReviewers} />}
                {/* {tab === "trends" && <Trends insights={insights || []} />} */}
            </div>
        </div>
    )
}
