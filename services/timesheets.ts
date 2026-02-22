import { useQuery, useMutation } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";



export const useFetchInternalTimesheets = (params?: any) => {
    return useQuery({
        queryKey: ["internal-timesheets", params],
        queryFn: async () => {
            return await http.get({
                url: routes.timesheets.internalTimesheets,
                query: params,
            });
        },
    });
};

export const useSubmitTimesheet = () => {
    return useMutation({
        mutationFn: async (timesheetId: string) => {
            return await http.post({
                url: `${routes.timesheets.internalTimesheets}/${timesheetId}/submit`,
            });
        },
    });
};