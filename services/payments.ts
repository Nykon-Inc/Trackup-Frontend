import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { IProcessPaymentBody } from "@/interfaces/payments.interfaces";

export const useFetchPayments = (orgId: string, params?: any) => {
    return useQuery({
        queryKey: ["payments", orgId, params],
        queryFn: async () => {
            return await http.get({
                url: routes.payments.list,
                query: { orgId, ...params },
            });
        },
        enabled: !!orgId,
    });
};

export const useProcessPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: IProcessPaymentBody) => {
            return await http.post({
                url: routes.payments.process,
                body,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
        },
    });
};

export const useMarkPaymentPaid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ timesheetId }: { timesheetId: string }) => {
            return await http.post({
                url: routes.payments.markPaid(timesheetId),
                body: {},
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
        },
    });
};

export const useMarkPaymentUnpaid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ timesheetId }: { timesheetId: string }) => {
            return await http.post({
                url: routes.payments.markUnpaid(timesheetId),
                body: {},
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
        },
    });
};
