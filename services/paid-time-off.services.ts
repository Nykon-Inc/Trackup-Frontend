import { useMutation, useQuery } from "@tanstack/react-query"
import http from "./base"
import { routes } from "./routes"
import { IPTOPolicy, IPTORequest } from "@/interfaces/paid-time-offs.interfaces"
import { queryClient } from "@/lib/react-query"
import { toast } from "sonner"


export type paginatedResponse<T> = {
    results: T[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

export const useCreatePtoPolicy = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            return await http.post({
                url: routes.organization.pTOPolicy(payload.organizationId),
                body: payload,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pto-policies"] })
            toast.success("Policy created");
        },
        onError: (error) => {
            toast.error("Failed to create policy");
        }

    })
}
export const useUpdatePtoPolicy = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            return await http.patch({
                url: routes.organization.updatePTOPolicy(payload.organizationId, payload.id),
                body: payload,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pto-policies"] })
            toast.success("Policy updated");
        },
        onError: (error) => {
            toast.error("Failed to update policy");
        }

    })
}

export const useGetPtoPolicies = (payload: { organizationId: string, query?: Record<string, any>, enabled?: boolean }) => {
    return useQuery<paginatedResponse<IPTOPolicy>>({
        queryKey: ["pto-policies", payload.organizationId, payload.query],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.pTOPolicy(payload.organizationId),
                query: {
                    ...payload.query,
                    is_enabled:
                        payload.query?.status !== "all"
                            ? payload.query?.status === "active"
                            : undefined,
                },
            })

            return data
        },
        enabled: payload.enabled ?? true,
    })
}

/* PTO Requests */

export const useGetMyUsedHours = ({ orgId, policyId, projectId }: { orgId: string, policyId: string, projectId: string }) => {
    return useQuery<{ usedHours: number }>({
        queryKey: ["my-used-hours"],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.ptoRequests(orgId) + "/me/used-hours",
                query: {
                    policyId,
                    projectId
                },
            })
            return data
        },
        enabled: !!orgId && !!policyId && !!projectId,
    })
}

export const useCreatePtoRequest = (organizationId: string) => {
    return useMutation({
        mutationFn: async (payload: any) => {
            return await http.post({
                url: routes.organization.ptoRequests(organizationId),
                body: payload,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pto-requests"] })
            toast.success("Request submitted");
        },
        onError: (error) => {
            toast.error("Failed to submit request");
        }

    })
}
export const useGetPTORequests = (organizationId: string, status?: 'all' | 'pending' | 'approved' | 'rejected') => {
    return useQuery<paginatedResponse<IPTORequest>>({
        queryKey: ["pto-requests", organizationId, status],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.ptoRequests(organizationId),
                query: { ...(status && status !== 'all' && { status }) },
            })
            return data
        },
    });
}
export const useGetOwnPtoRequests = (organizationId: string) => {
    return useQuery<paginatedResponse<IPTORequest>>({
        queryKey: ["pto-requests"],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.ptoRequests(organizationId) + "/me",
            })

            return data
        },
    })
}

export const useUpdatePTORequest = (organizationId: string) => {
    return useMutation({
        mutationFn: async (payload: { status: string, requestId: string }) => {
            return await http.patch({
                url: routes.organization.reviewPtoRequest(organizationId, payload.requestId),
                body: payload,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pto-requests"] })
            toast.success("Request updated");
        },
        onError: (error) => {
            toast.error("Failed to update request");
        }

    })
}