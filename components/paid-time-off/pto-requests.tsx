import { useState } from "react"
import { PTORequest, PTORequestTable } from "./pto-requests-table"

export const PTORequests = () => {
    const [ptoRequests, setPtoRequests] = useState<PTORequest[]>([
        {
            id: '1',
            employeeName: 'Sarah Johnson',
            policyName: 'Annual Leave',
            startDate: '2024-03-15',
            endDate: '2024-03-22',
            days: 6,
            status: 'pending',
        },
        {
            id: '2',
            employeeName: 'Michael Chen',
            policyName: 'Sick Leave',
            startDate: '2024-03-10',
            endDate: '2024-03-11',
            days: 2,
            status: 'approved',
        },
        {
            id: '3',
            employeeName: 'Emily Rodriguez',
            policyName: 'Annual Leave',
            startDate: '2024-04-01',
            endDate: '2024-04-05',
            days: 5,
            status: 'pending',
        },
        {
            id: '4',
            employeeName: 'David Kim',
            policyName: 'Personal Days',
            startDate: '2024-03-08',
            endDate: '2024-03-08',
            days: 1,
            status: 'rejected',
        },
        {
            id: '5',
            employeeName: 'Jessica Martinez',
            policyName: 'Annual Leave',
            startDate: '2024-05-20',
            endDate: '2024-05-24',
            days: 5,
            status: 'pending',
        },
    ])

    const handleApproveRequest = (requestId: string) => {
        setPtoRequests((prev) =>
            prev.map((r) =>
                r.id === requestId
                    ? {
                        ...r,
                        status: 'approved' as const,
                    }
                    : r,
            ),
        )
    }
    const handleRejectRequest = (requestId: string) => {
        setPtoRequests((prev) =>
            prev.map((r) =>
                r.id === requestId
                    ? {
                        ...r,
                        status: 'rejected' as const,
                    }
                    : r,
            ),
        )
    }
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">PTO Requests</h2>
                <p className="text-muted-foreground mt-1">
                    Review and manage employee time-off requests
                </p>
            </div>

            <PTORequestTable
                requests={ptoRequests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
            />
        </div>
    )
}