import { useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import {
    GetAggregatedSessionsQuery,
    GetAggregatedSessionsResponse,
} from "@/interfaces/sessions.interfaces";

export const useGetAggregatedSessions = (query: GetAggregatedSessionsQuery) => {
    return useQuery({
        queryKey: ["aggregated-sessions", query],
        queryFn: async () => {
            const data = await http.get({
                url: `client${routes.sessions.index}${routes.sessions.aggregated}`,
                query,
            });
            return data as GetAggregatedSessionsResponse;
        },
        enabled: (!!query.userId || !!query.organizationId) && !!query.startDate && !!query.endDate,
    });
};
