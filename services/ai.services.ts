import { useQuery, useMutation } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import {
    IStaffHourlyInsight,
    IOrgHourlyInsight,
    IGetStaffInsightsParams,
    IGetOrgInsightsParams,
    IRunUserInsightsBody
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
