import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import http from "@/services/base";
import { routes } from "./routes";
import { ActivityLogAction, ActivityLogType, ActivityTargetType, IActivityLog } from "@/interfaces/activities";

type PaginatedActivityLogs = {
    results: IActivityLog[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
};

export type ActivityLogQuery = {
    actorId?: string;
    projectId?: string;
    type?: ActivityLogType;
    action?: ActivityLogAction;
    targetType?: ActivityTargetType;
    targetId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
};

export const useFetchLatestActivityLogs = () => {
    return useQuery({
        queryKey: ["activity-logs", "latest"],
        queryFn: async () => {
            const data = await http.get({ url: routes.activityLogs.latest });
            return data.results as IActivityLog[];
        },
    });
};

export const useGetOrganizationActivityLogs = (organizationId: string, query: ActivityLogQuery) => {
    return useQuery({
        queryKey: ["activity-logs", "organization", organizationId, query],
        queryFn: async () => {
            const data = await http.get({
                url: routes.activityLogs.organization(organizationId),
                query,
            });
            return data as PaginatedActivityLogs;
        },
        enabled: !!organizationId,
    });
};

export const invalidateActivityLogs = () => {
    return queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
};
