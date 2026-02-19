"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { Camera } from "lucide-react";

export default function ScreenshotsPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Screenshots"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Activity", href: `/dashboard/${params?.orgId}/activity`, active: false },
                    { label: "Screenshots", href: `/dashboard/${params?.orgId}/screenshots`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Camera className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Screenshots</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                    View team screenshots and activity captures here. This feature is coming soon!
                </p>
            </div>
        </div>
    )
}
