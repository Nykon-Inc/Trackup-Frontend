import { useCreatePtoRequest, useGetPtoPolicies } from "@/services/paid-time-off.services"
import { RequestHistory } from "./pto-request-history"
import { PTORequestForm } from "./pto-request-form/pto-request-form"
import { IPTORequestPayload } from "@/interfaces/paid-time-offs.interfaces"

type Props = {
    orgId: string
    isFormOpen: boolean
    setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const MemberPtoPage: React.FC<Props> = ({ orgId, isFormOpen, setIsFormOpen }) => {
    const { mutate: createRequest, isPending: isSubmitting } = useCreatePtoRequest(orgId)

    const handleSubmitRequest = (requestData: {
        projectId: string;
        policyId: string;
        excludeWeekends: boolean;
        excludeHolidays: boolean;
        days: { date: string; hours: number; }[];
        reason: string;
        files: File[];
        startTime: string;
        endTime: string;
    }, resetForm: () => void) => {
        const newRequest = {
            reason: requestData.reason,
            policyId: requestData.policyId,
            projectId: requestData.projectId,
            excludeWeekends: requestData.excludeWeekends,
            excludeHolidays: requestData.excludeHolidays,
            days: requestData.days,
            startTime: requestData.startTime,
            endTime: requestData.endTime,

        }
        createRequest(newRequest, { onSuccess: () => { resetForm(), setIsFormOpen(false) } })
    }

    return (
        <div>
            <div className="mb-8">
                <PTORequestForm
                    onSubmit={handleSubmitRequest}
                    holidays={[]}
                    isSubmitting={isSubmitting}
                    isFormOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                />
            </div>
            <RequestHistory organizationId={orgId} />
        </div>
    )
}