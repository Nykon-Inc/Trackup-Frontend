import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (timesheetId: string) => {
            return await http.post({
                url: `${routes.timesheets.internalTimesheets}/${timesheetId}/submit`,
                body: {},
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["internal-timesheets"] });
        },
    });
};

export const useFetchTimesheetSessions = (timesheetId: string | undefined) => {
    return useQuery({
        queryKey: ["timesheet-sessions", timesheetId],
        queryFn: async () => {
            return await http.get({
                url: timesheetId ? routes.timesheets.sessions(timesheetId) : "",
            });
        },
        enabled: !!timesheetId,
    });
};