"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { Globe } from "lucide-react";

export default function AppsUrlsPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Apps & URLs"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Activity", href: `/dashboard/${params?.orgId}/activity`, active: false },
                    { label: "Apps & URLs", href: `/dashboard/${params?.orgId}/apps-urls`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Globe className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Apps & URLs</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                    Track application usage and website visits here. This feature is coming soon!
                </p>
            </div>
        </div>
    )
}
