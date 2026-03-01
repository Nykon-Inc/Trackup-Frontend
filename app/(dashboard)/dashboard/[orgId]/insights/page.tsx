"use client"

import { PageHeader } from "@/components/page-header"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { useGetInsightsToReview, useGetOrgInsights } from "@/services/ai.services";
import { useGetProjects } from "@/services/projects.services";
import { SelectControlled } from "@/components/ui/select-controlled";
import { useAuthStore } from "@/stores/auth.store";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { format, endOfDay, startOfDay, subDays } from 'date-fns';
import { CustomTabs } from "@/components/custom-tabs";
import Overview from "./_components/Overview";
import StaffToReview from "./_components/StaffToReview";
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar";

export default function InsightsPage() {
    const params = useParams();
    const orgId = params?.orgId as string;
    const router = useRouter();
    const queryParams = useSearchParams();
    const { account } = useAuthStore();

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
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Insights"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${orgId}`, active: false },
                    { label: "Insights", href: `/dashboard/${orgId}/insights`, active: true }
                ]}
            />
            <div className="px-4 lg:px-6 pt-1">
                <div className="mt-1 mb-4 flex gap-2">
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
