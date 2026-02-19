"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { Clock } from "lucide-react";

export default function ViewEditTimesheetsPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="View & Edit Timesheets"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Timesheets", href: `/dashboard/${params?.orgId}/timesheets`, active: false },
                    { label: "View & Edit", href: `/dashboard/${params?.orgId}/timesheets/view-edit`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">View & Edit Timesheets</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                    Manage and edit your project timesheets here. This feature is coming soon!
                </p>
            </div>
        </div>
    )
}
