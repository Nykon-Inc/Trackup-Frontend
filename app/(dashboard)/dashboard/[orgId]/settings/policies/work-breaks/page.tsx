"use client"

import { useState, use, useMemo } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { DebouncedSearch } from "@/components/ui/debounced-search"
import WorkBreakTable from "./_components/table"
import { WorkBreakForm } from "./_components/form"
import {
    useGetWorkBreakPolicies,
    useCreateWorkBreakPolicy,
    useUpdateWorkBreakPolicy,
    useDeleteWorkBreakPolicy
} from "@/services/work-break.services"
import { IWorkBreakPolicy } from "@/interfaces/work-break.interfaces"

export default function WorkBreaksPolicyPage({ params }: any) {
    const { orgId } = use(params) as { orgId: string }

    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageLimit] = useState(10)

    const { data: policiesData, isLoading } = useGetWorkBreakPolicies(orgId, {
        search,
        page,
        limit: pageLimit,
    })

    const { mutate: createPolicy, isPending: isCreating } = useCreateWorkBreakPolicy(orgId)
    const { mutate: updatePolicy, isPending: isUpdating } = useUpdateWorkBreakPolicy(orgId)
    const { mutate: deletePolicy } = useDeleteWorkBreakPolicy(orgId)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingPolicy, setEditingPolicy] = useState<IWorkBreakPolicy | null>(null)

    const handleEdit = (policy: IWorkBreakPolicy) => {
        setEditingPolicy(policy)
        setModalOpen(true)
    }

    const handleDelete = (policyId: string) => {
        if (confirm("Are you sure you want to delete this policy?")) {
            deletePolicy(policyId)
        }
    }

    const handleToggleEnabled = (policyId: string, enabled: boolean) => {
        updatePolicy({ policyId, duration: 0, enabled }) // duration is required by schema, but it should be existing one. 
        // Wait, update mutation in work-break.services.ts requires duration per schema.
        // Let's fix the service to allow partial updates if possible, or pass the full policy.
    }

    const handleSave = (payload: any) => {
        if (editingPolicy) {
            updatePolicy(
                { policyId: editingPolicy.id, ...payload },
                { onSuccess: () => setModalOpen(false) }
            )
        } else {
            createPolicy(payload, {
                onSuccess: () => setModalOpen(false)
            })
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Work Breaks Policy"
                breadcrumbs={[
                    { label: "settings", href: `/dashboard/${orgId}/settings`, active: false },
                    { label: "policies", href: `/dashboard/${orgId}/settings/policies`, active: false },
                    { label: "work breaks", active: true },
                ]}
            />

            <div className="px-5">
                <div className="flex items-center gap-2 mb-3 justify-between">
                    <DebouncedSearch
                        placeholder="Search policies..."
                        onSearch={setSearch}
                    />
                    <Button onClick={() => {
                        setEditingPolicy(null)
                        setModalOpen(true)
                    }}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Policy
                    </Button>
                </div>
                <WorkBreakTable
                    data={policiesData?.results || []}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleEnabled={(id, enabled) => {
                        const policy = (policiesData?.results || []).find(p => p.id === id)
                        if (policy) {
                            updatePolicy({ policyId: id, ...policy, enabled })
                        }
                    }}
                />
            </div>

            <WorkBreakForm
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open)
                    if (!open) setEditingPolicy(null)
                }}
                orgId={orgId}
                editingPolicy={editingPolicy}
                onSave={handleSave}
                isSubmitting={isCreating || isUpdating}
            />
        </div>
    )
}
