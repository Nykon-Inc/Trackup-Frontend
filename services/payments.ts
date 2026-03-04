import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { IProcessPaymentBody } from "@/interfaces/payments.interfaces";

export const useFetchPaymentBatches = (orgId: string, params?: any) => {
    return useQuery({
        queryKey: ["payment-batches", orgId, params],
        queryFn: async () => {
            return await http.get({
                url: routes.payments.batches,
                query: { orgId, ...params },
            });
        },
        enabled: !!orgId,
    });
};

export const useFetchPaymentBatch = (orgId: string, batchId: string) => {
    return useQuery({
        queryKey: ["payment-batch", orgId, batchId],
        queryFn: async () => {
            return await http.get({
                url: routes.payments.batchDetail(batchId),
                query: { orgId },
            });
        },
        enabled: !!orgId && !!batchId,
    });
};

export const useFetchPayments = (orgId: string, params?: any, enabled = true) => {
    return useQuery({
        queryKey: ["payments", orgId, params],
        queryFn: async () => {
            return await http.get({
                url: routes.payments.list,
                query: { orgId, ...params },
            });
        },
        enabled: !!orgId && enabled,
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

export const useCreatePaymentBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: import("@/interfaces/payments.interfaces").ICreateBatchBody) => {
            return await http.post({
                url: routes.payments.batches,
                body,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-batches"] });
        },
    });
};
