"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { ClipboardList } from "lucide-react";

export default function ReportsPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Reports"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Reports", href: `/dashboard/${params?.orgId}/reports`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Reports Page</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                    This page is currently under development. Please check back soon!
                </p>
            </div>
        </div>
    )
}
