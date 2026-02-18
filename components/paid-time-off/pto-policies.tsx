import { FC } from "react"
import { PolicyList } from "./policy-list"
import { Policy, PolicyForm } from "./policy-form"
import { useCreatePtoPolicy, useGetPtoPolicies, useUpdatePtoPolicy } from "@/services/paid-time-off.services"
import { IPTOPolicy } from "@/interfaces/paid-time-offs.interfaces"


type Props = {
    policies: IPTOPolicy[]
    organizationId: string
    editPolicy: Policy | null
    setEditPolicy: React.Dispatch<React.SetStateAction<Policy | null>>
    isFormOpen: boolean
    setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const PtoPolicies: FC<Props> = ({ policies, organizationId, editPolicy, setEditPolicy, isFormOpen, setIsFormOpen }) => {
    const { mutate: createPolicy } = useCreatePtoPolicy()
    const { mutate: updatePolicy } = useUpdatePtoPolicy()


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

    return (
        <div className="space-y-5 mt-5">
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