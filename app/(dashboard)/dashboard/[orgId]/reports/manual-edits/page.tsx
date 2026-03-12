"use client"

import { useParams } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { OrganizationMemberRole } from "@/interfaces/organizations.interfaces"
import { ManualTimeRequestsTable } from "@/components/manual-time/manual-time-requests-table"

export default function ManualEditsPage() {
    const params = useParams()
    const orgId = params?.orgId as string
    const { activeOrg } = useWorkspace()

    const isManagerOrOwner =
        activeOrg?.role === OrganizationMemberRole.OWNER ||
        activeOrg?.role === OrganizationMemberRole.MANAGER

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Manual Time Edits"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Reports", href: `/dashboard/${params?.orgId}/reports`, active: false },
                    { label: "Manual Edits", href: `/dashboard/${params?.orgId}/reports/manual-edits`, active: true },
                ]}
            />

            <div className="p-4 lg:p-6 overflow-auto">
                {!isManagerOrOwner ? (
                    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                        You do not have permission to review manual time edits.
                    </div>
                ) : (
                    <ManualTimeRequestsTable organizationId={orgId} />
                )}
            </div>
        </div>
    )
}
