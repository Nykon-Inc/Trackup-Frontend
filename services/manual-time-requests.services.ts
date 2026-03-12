import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import http from "@/services/base"
import { routes } from "@/services/routes"
import {
    CreateDirectManualTimePayload,
    CreateManualTimeRequestPayload,
    ManualTimeRequestListResponse,
    ManualTimeRequestStatus,
    ReviewManualTimeRequestPayload,
} from "@/interfaces/manual-time-request.interfaces"

type ListManualTimeRequestParams = {
    organizationId: string
    status?: ManualTimeRequestStatus | "all"
    userId?: string
    startDate?: number
    endDate?: number
    page?: number
    limit?: number
    sortBy?: string
    enabled?: boolean
}

const getErrorMessage = (error: unknown, fallback: string) => {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
    ) {
        return (error as { response?: { data?: { message?: string } } }).response?.data?.message as string
    }

    return fallback
}

export const useGetManualTimeRequests = (params: ListManualTimeRequestParams) => {
    return useQuery<ManualTimeRequestListResponse>({
        queryKey: ["manual-time-requests", params],
        queryFn: async () => {
            return await http.get({
                url: routes.organization.manualTimeRequests(params.organizationId),
                query: {
                    ...(params.status && params.status !== "all" ? { status: params.status } : {}),
                    ...(params.userId ? { userId: params.userId } : {}),
                    ...(params.startDate ? { startDate: params.startDate } : {}),
                    ...(params.endDate ? { endDate: params.endDate } : {}),
                    ...(params.page ? { page: params.page } : {}),
                    ...(params.limit ? { limit: params.limit } : {}),
                    ...(params.sortBy ? { sortBy: params.sortBy } : {}),
                },
            })
        },
        enabled: (params.enabled ?? true) && !!params.organizationId,
    })
}

export const useCreateManualTimeRequest = (organizationId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: CreateManualTimeRequestPayload) => {
            return await http.post({
                url: routes.organization.manualTimeRequests(organizationId),
                body: payload,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["manual-time-requests"] })
            queryClient.invalidateQueries({ queryKey: ["internal-timesheets"] })
            queryClient.invalidateQueries({ queryKey: ["owner-timesheets"] })
            queryClient.invalidateQueries({ queryKey: ["aggregated-sessions"] })
            toast.success("Manual time request submitted")
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to submit manual time request"))
        },
    })
}

export const useReviewManualTimeRequest = (organizationId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: { requestId: string } & ReviewManualTimeRequestPayload) => {
            return await http.patch({
                url: routes.organization.manualTimeRequestReview(organizationId, payload.requestId),
                body: {
                    status: payload.status,
                    reason: payload.reason,
                },
            })
        },
        onSuccess: (_, payload) => {
            queryClient.invalidateQueries({ queryKey: ["manual-time-requests"] })
            queryClient.invalidateQueries({ queryKey: ["internal-timesheets"] })
            queryClient.invalidateQueries({ queryKey: ["owner-timesheets"] })
            queryClient.invalidateQueries({ queryKey: ["aggregated-sessions"] })
            toast.success(payload.status === "approved" ? "Manual time approved" : "Manual time rejected")
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to review manual time request"))
        },
    })
}

export const useCreateDirectManualTime = (organizationId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: CreateDirectManualTimePayload) => {
            return await http.post({
                url: routes.organization.manualTimeRequestDirect(organizationId),
                body: payload,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["manual-time-requests"] })
            queryClient.invalidateQueries({ queryKey: ["internal-timesheets"] })
            queryClient.invalidateQueries({ queryKey: ["owner-timesheets"] })
            queryClient.invalidateQueries({ queryKey: ["aggregated-sessions"] })
            toast.success("Manual time added")
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to add manual time"))
        },
    })
}
