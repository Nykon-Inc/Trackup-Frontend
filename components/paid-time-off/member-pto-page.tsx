import { useCreatePtoRequest, useGetPtoPolicies } from "@/services/paid-time-off.services"
import { PolicyOverview } from "./policy-overview"
import { RequestHistory } from "./pto-request-history"
import { PTORequestForm } from "./pto-request.form"
import { IPTORequestPayload } from "@/interfaces/paid-time-offs.interfaces"

type Props = {
    orgId: string
    isFormOpen: boolean
    setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const MemberPtoPage: React.FC<Props> = ({ orgId, isFormOpen, setIsFormOpen }) => {
    const { mutate: createRequest, isPending: isSubmitting } = useCreatePtoRequest(orgId)
    const { data: policies } = useGetPtoPolicies(orgId, true)

    const handleSubmitRequest = (requestData: {
        policyId: string
        startDate: string
        endDate: string
        days: number
        reason: string
        isStartHalfDay: boolean
        isEndHalfDay: boolean
    }, resetForm: () => void) => {
        const newRequest: IPTORequestPayload = {
            startDate: requestData.startDate,
            endDate: requestData.endDate,
            reason: requestData.reason,
            policyId: requestData.policyId,
            isHalfStartDay: requestData.isStartHalfDay || false,
            isHalfEndDay: requestData.isEndHalfDay || false,
        }
        createRequest(newRequest, { onSuccess: () => { resetForm(), setIsFormOpen(false) } })
    }

    return (
        <div>
            <PolicyOverview policies={policies || []} />
            <div className="mb-8">
                <PTORequestForm
                    policies={policies || []}
                    onSubmit={handleSubmitRequest}
                    isSubmitting={isSubmitting}
                    isFormOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                />
            </div>
            <RequestHistory organizationId={orgId} />
        </div>
    )
}