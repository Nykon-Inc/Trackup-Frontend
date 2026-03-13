export type ManualTimeRequestStatus = "pending" | "approved" | "rejected"

export interface ManualTimeRequestUser {
    id: string
    name: string
    email?: string
}

export interface ManualTimeRequestProject {
    id: string
    name: string
}

export interface ManualTimeRequest {
    id: string
    userId: string | ManualTimeRequestUser
    projectId: string | ManualTimeRequestProject
    organizationId: string
    startTime: number
    endTime: number
    reason?: string
    status: ManualTimeRequestStatus
    approvedBy?: string | ManualTimeRequestUser
    approvedAt?: string
    rejectionReason?: string
    createdAt: string
    updatedAt: string
}

export interface ManualTimeRequestListResponse {
    results: ManualTimeRequest[]
    page: number
    limit: number
    totalPages: number
    totalResults: number
}

export interface CreateManualTimeRequestPayload {
    projectId: string
    startTime: number
    endTime: number
    reason?: string
}

export interface CreateDirectManualTimePayload extends CreateManualTimeRequestPayload {
    userId: string
}

export interface ReviewManualTimeRequestPayload {
    status: "approved" | "rejected"
    reason?: string
}
