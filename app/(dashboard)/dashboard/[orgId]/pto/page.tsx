"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { Palmtree } from "lucide-react";

export default function PTOPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Paid Time Off"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Paid Time Off", href: `/dashboard/${params?.orgId}/pto`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Palmtree className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Paid Time Off Page</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                    Manage and request your paid time off or view your team's absence schedule. This page is currently under development.
                </p>
            </div>
        </div>
    )
}
