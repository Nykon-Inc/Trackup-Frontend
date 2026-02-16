"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { Users } from "lucide-react";

export default function ActivityPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Activity"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Activity", href: `/dashboard/${params?.orgId}/activity`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Activity Page</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                    This page is currently under development. Please check back soon!
                </p>
            </div>
        </div>
    )
}
