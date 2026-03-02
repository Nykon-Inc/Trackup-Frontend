import { useQuery, useMutation } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import {
    IStaffHourlyInsight,
    IOrgHourlyInsight,
    IGetStaffInsightsParams,
    IGetOrgInsightsParams,
    IRunUserInsightsBody,
    IGetInsightsToReviewParams,
    IGetUserProjectInsightsParams,
    IUpdateInsightNotesBody,
    GetInsightsSummaryResponse,
    ITriggerOrgNarrativeBody,
} from "@/interfaces/ai.interfaces";

export const useGetStaffInsights = (params: IGetStaffInsightsParams) => {
    return useQuery({
        queryKey: ["staff-insights", params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.ai.staff,
                query: params,
            });
            return data as IStaffHourlyInsight[];
        },
        enabled: !!params.projectId && !!params.userId,
    });
};

export const useGetOrgInsights = (params: IGetOrgInsightsParams) => {
    return useQuery({
        queryKey: ["org-insights", params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.ai.org,
                query: params,
            });
            return data as IOrgHourlyInsight[];
        },
        enabled: !!params.organizationId,
    });
};

export const useGetInsightsToReview = (params: IGetInsightsToReviewParams) => {
    return useQuery({
        queryKey: ["insights-to-review", params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.ai.insightsToReview,
                query: params,
            });
            return data as GetInsightsSummaryResponse;
        },
        enabled: !!params.organizationId,
    });
};

export const useGetUserProjectInsights = (params: IGetUserProjectInsightsParams) => {
    return useQuery({
        queryKey: ["user-project-insights", params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.ai.userProjectInsights,
                query: params,
            });
            return data;
        },
        enabled: !!params.organizationId && !!params.userId && !!params.projectId,
    });
};

export const useRunUserInsights = () => {
    return useMutation({
        mutationFn: async (body: IRunUserInsightsBody) => {
            return await http.post({
                url: routes.ai.runUserInsights,
                body,
            });
        },
    });
};

export const useUpdateInsightNotes = () => {
    return useMutation({
        mutationFn: async ({ insightId, body }: { insightId: string, body: IUpdateInsightNotesBody }) => {
            return await http.patch({
                url: routes.ai.updateNotes(insightId),
                body,
            });
        },
    });
};

export const useTriggerOrgNarrative = () => {
    return useMutation({
        mutationFn: async (body: ITriggerOrgNarrativeBody) => {
            return await http.post({
                url: routes.ai.triggerOrgNarrative,
                body,
            });
        },
    });
};
