import { useState } from "react"
import { PolicyList } from "./policy-list"
import { Button } from "../ui/button"
import { Loader2, PlusIcon } from "lucide-react"
import { Policy, PolicyForm } from "./policy-form"
import { useCreatePtoPolicy, useGetPtoPolicies, useUpdatePtoPolicy } from "@/services/paid-time-off.services"

export const PtoPolicies = ({ organizationId }: { organizationId: string }) => {
    const { mutate: createPolicy } = useCreatePtoPolicy()
    const { mutate: updatePolicy } = useUpdatePtoPolicy()

    const { data: policies, isPending } = useGetPtoPolicies(organizationId)

    const [editPolicy, setEditPolicy] = useState<Policy | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)

    const handleNewPolicy = () => {
        setEditPolicy(null)
        setIsFormOpen(true)
    }
    const closeForm = () => {
        setIsFormOpen(false)
        setEditPolicy(null)
    }

    const handleEditPolicy = (policy: Policy) => {
        setEditPolicy(policy)
        setIsFormOpen(true)
    }

    const onSubmit = (policy: Omit<Policy, "id" | "userCount">) => {
        if (editPolicy?.id) {
            updatePolicy(
                { ...policy, organizationId, id: editPolicy.id },
                { onSuccess: closeForm }
            );
        } else {
            createPolicy({ ...(policy), organizationId }, { onSuccess: closeForm })
        }
    }

    const handlePolicyToggle = (policy: Policy) => {
        updatePolicy({ enabled: !policy.enabled, organizationId, id: policy.id })
    }

    if (isPending) {
        return <div className="flex justify-center items-center h-screen">

            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    }
    return (
        <div className="space-y-5 mt-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        PTO Policies
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Manage time-off policies for your organization
                    </p>
                </div>
                <Button variant="default" onClick={handleNewPolicy}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Policy
                </Button>
            </div>


            <PolicyForm
                open={isFormOpen}
                onClose={closeForm}
                onSave={onSubmit}
                policy={editPolicy}
            />


            <PolicyList
                policies={policies?.map(e => ({ ...e, userCount: 0 })) || []}
                onEdit={handleEditPolicy}
                onToggleActive={handlePolicyToggle}
            />
        </div>
    )
}