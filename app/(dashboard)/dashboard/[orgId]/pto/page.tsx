"use client"
import { use, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PTORequestTable } from '@/components/paid-time-off/pto-requests-table'
import { useWorkspace } from '@/components/providers/workspace-provider'
import { MemberPtoPage } from '@/components/paid-time-off/member-pto-page'
import { PageHeader } from '@/components/page-header'
import { Loader2 } from 'lucide-react'

export default function PTORequestPage({ params }: PageProps<"/dashboard/[orgId]/pto">) {

    const { orgId } = use(params)
    const { activeOrg, isLoading: isWorkspaceLoading } = useWorkspace()

    const [isFormOpen, setIsFormOpen] = useState(false)

    type validRoles = 'member' | 'manager' | 'owner'
    const role = activeOrg?.role as validRoles || 'member';

    const labels: Record<validRoles, { heading: string }> = {
        member: {
            heading: "Request Time Off",
        },
        manager: {
            heading: "PTO Requests",
        },
        owner: {
            heading: "PTO Requests",
        }

    }
    if (isWorkspaceLoading) return <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
    </div>

    return (
        <section className="min-h-screen w-full bg-background">
            <PageHeader
                title={labels[role].heading}
                breadcrumbs={[
                    { label: "dashboard", href: `/dashboard/${orgId}`, active: false },
                    { label: "paid time off", href: `/dashboard/${orgId}/pto`, active: true },
                ]}
                rightElement={<div />}
            />

            <div className='px-5'>

                {role === 'member' && (
                    <Button
                        size="sm"
                        onClick={() => setIsFormOpen(true)}
                        className='ml-auto block mt-4'
                    >
                        + Request Time Off
                    </Button>
                )}
                <div className=" overflow-x-auto">

                    {
                        (role === "manager" || role === "owner")
                            ? <PTORequestTable orgId={orgId} />
                            : <MemberPtoPage orgId={orgId} isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} />
                    }
                </div>
            </div>
        </section>
    )
}
