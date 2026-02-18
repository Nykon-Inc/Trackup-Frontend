"use client"
import { use, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PTORequestTable } from '@/components/paid-time-off/pto-requests-table'
import { useWorkspace } from '@/components/providers/workspace-provider'
import { MemberPtoPage } from '@/components/paid-time-off/member-pto-page'

export default function PTORequestPage({ params }: PageProps<"/dashboard/[orgId]/pto">) {

    const { orgId } = use(params)
    const { activeOrg, isLoading: isWorkspaceLoading } = useWorkspace()

    const [isFormOpen, setIsFormOpen] = useState(false)

    if (!activeOrg) {
        return <div>No organization selected</div>
    }

    type validRoles = 'member' | 'manager' | 'owner'
    const role = activeOrg?.role as validRoles || 'member';

    const labels: Record<validRoles, { heading: string; description: string }> = {
        member: {
            heading: "Request Time Off",
            description: "Submit and track your PTO requests"
        },
        manager: {
            heading: "PTO Requests",
            description: "Review and manage employee time-off requests"
        },
        owner: {
            heading: "PTO Requests",
            description: "Review and manage employee time-off requests"
        }

    }

    return (
        <section className="min-h-screen w-full bg-background">
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{labels[role].heading}</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Submit and track your PTO requests
                        </p>
                    </div>

                    {role === 'member' && (
                        <Button onClick={() => setIsFormOpen(true)}>+ Request Time Off</Button>
                    )}
                </div>
                {
                    role === "manager"
                        ? <PTORequestTable orgId={orgId} />
                        : <MemberPtoPage orgId={orgId} isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} />
                }
            </div>
        </section>
    )
}
