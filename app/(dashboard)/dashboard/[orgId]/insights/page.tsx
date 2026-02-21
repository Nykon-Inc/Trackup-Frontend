"use client"

import { PageHeader } from "@/components/page-header"
import { useParams, useSearchParams } from "next/navigation";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { useGetOrgInsights } from "@/services/ai.services";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { format, endOfDay, startOfDay } from 'date-fns';
import { CustomTabs } from "@/components/custom-tabs";
import Overview from "./_components/Overview";

export default function InsightsPage() {
    const params = useParams();
    const orgId = params?.orgId as string;
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
    });

    const { data: insights, isLoading } = useGetOrgInsights({
        organizationId: orgId,
        dayCode: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
    });

    const queryParams = useSearchParams();
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

            <div className="px-4 lg:px-6 pt-6">
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
                {tab === "overview" && <Overview insights={insights || []} />}
                {/* {tab === "staff-to-review" && <StaffToReview insights={insights || []} />}
                {tab === "trends" && <Trends insights={insights || []} />} */}
            </div>
        </div>
    )
}
