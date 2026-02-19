"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

export default function TimesheetApprovalsPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Timesheet Approvals"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Timesheets", href: `/dashboard/${params?.orgId}/timesheets`, active: false },
                    { label: "Approvals", href: `/dashboard/${params?.orgId}/timesheets/approvals`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <ClipboardCheck className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Timesheet Approvals</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                    Review and approve timesheet submissions here. This feature is coming soon!
                </p>
            </div>
        </div>
    )
}
