import { FC } from "react"
import { PolicyList } from "./policy-list"
import { Policy, PolicyForm } from "./policy-form"
import { useCreatePtoPolicy, useUpdatePtoPolicy } from "@/services/paid-time-off.services"
import { IPTOPolicy } from "@/interfaces/paid-time-offs.interfaces"
import { ITablePagination } from "@/interfaces/common.interface"


type Props = {
    policies: IPTOPolicy[]
    organizationId: string
    editPolicy: IPTOPolicy | null
    setEditPolicy: React.Dispatch<React.SetStateAction<IPTOPolicy | null>>
    isFormOpen: boolean
    setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>
    pagination: ITablePagination
}

export const PtoPolicies: FC<Props> = (props) => {
    const {
        policies,
        organizationId,
        editPolicy,
        setEditPolicy,
        isFormOpen,
        setIsFormOpen,
        pagination,
    } = props
    const { mutate: createPolicy } = useCreatePtoPolicy()
    const { mutate: updatePolicy } = useUpdatePtoPolicy()


    const closeForm = () => {
        setIsFormOpen(false)
        setEditPolicy(null)
    }

    const handleEditPolicy = (policy: IPTOPolicy) => {
        setEditPolicy(policy)
        setIsFormOpen(true)
    }

    const onSubmit = (policy: Omit<Policy, "id" | "userCount">, resetForm: () => void) => {
        if (editPolicy?.id) {
            updatePolicy(
                { ...policy, organizationId, id: editPolicy.id },
                { onSuccess: closeForm }
            );
        } else {
            createPolicy({ ...(policy), organizationId }, { onSuccess: () => { resetForm(); closeForm() } })
        }
    }

    const handlePolicyToggle = (policy: IPTOPolicy) => {
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
                policies={policies || []}
                onEdit={handleEditPolicy}
                onToggleActive={handlePolicyToggle}
                pagination={{
                    onPageChange: pagination.onPageChange,
                    onRowsPerPageChange: pagination.onRowsPerPageChange,
                    page: pagination.page,
                    rowsPerPage: pagination.rowsPerPage,
                    totalResults: pagination.totalResults
                }}
            />
        </div>
    )
}