import { useMutation, useQuery } from "@tanstack/react-query";
import http from "./base";
import { routes } from "./routes";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import {
    IWorkBreakPolicy,
    CreateWorkBreakPolicyPayload,
    UpdateWorkBreakPolicyPayload,
    GetWorkBreakPoliciesParams
} from "@/interfaces/work-break.interfaces";

export const useGetWorkBreakPolicies = (organizationId: string, params: GetWorkBreakPoliciesParams = {}) => {
    return useQuery<{ results: IWorkBreakPolicy[], totalResults: number, limit: number, page: number, totalPages: number }>({
        queryKey: ["work-break-policies", organizationId, params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.workBreaks(organizationId),
                query: params,
            });
            return data;
        },
        enabled: !!organizationId,
    });
}

export const useCreateWorkBreakPolicy = (organizationId: string) => {
    return useMutation({
        mutationFn: async (payload: CreateWorkBreakPolicyPayload) => {
            return await http.post({
                url: routes.organization.workBreaks(organizationId),
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work-break-policies", organizationId] });
            toast.success("Work break policy created");
        },
        onError: (error: any) => {
            console.error("Failed to create work break policy:", error);
            toast.error(`Failed to create work break policy: ${error.message || "Unknown error"}`);
        },
    });
}

export const useUpdateWorkBreakPolicy = (organizationId: string) => {
    return useMutation({
        mutationFn: async (payload: { policyId: string } & UpdateWorkBreakPolicyPayload) => {
            const { policyId, ...body } = payload;
            return await http.patch({
                url: routes.organization.workBreak(organizationId, policyId),
                body: body,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work-break-policies", organizationId] });
            toast.success("Work break policy updated");
        },
        onError: (error: any) => {
            console.error("Failed to update work break policy:", error);
            toast.error(`Failed to update work break policy: ${error.message || "Unknown error"}`);
        },
    });
}

export const useDeleteWorkBreakPolicy = (organizationId: string) => {
    return useMutation({
        mutationFn: async (policyId: string) => {
            return await http.delete({
                url: routes.organization.workBreak(organizationId, policyId),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work-break-policies", organizationId] });
            toast.success("Work break policy deleted");
        },
        onError: (error: any) => {
            console.error("Failed to delete work break policy:", error);
            toast.error(`Failed to delete work break policy: ${error.message || "Unknown error"}`);
        },
    });
}
