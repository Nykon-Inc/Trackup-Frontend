"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import DashboardView from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Dashboard"
                breadcrumbs={[
                    { label: "Overview", href: `/${params?.orgId}`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 h-full">
                <DashboardView />
            </div>
        </div>
    )
}
