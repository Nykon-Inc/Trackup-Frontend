import { useMutation, useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { queryClient } from "@/lib/react-query";

import { SetupSessionPayload, SetupSessionResponse, StripePaymentMethod } from "@/interfaces/billing.interfaces";

export const useCreateSetupSession = () => {
    return useMutation({
        mutationFn: async (payload: SetupSessionPayload) => {
            const data = await http.post({
                url: routes.billing.setupSession,
                body: payload,
            });
            return data as SetupSessionResponse;
        },
    });
};

export const useGetPaymentMethods = (organizationId: string) => {
    return useQuery({
        queryKey: ["payment-methods", organizationId],
        queryFn: async () => {
            const data = await http.get({
                url: routes.billing.paymentMethods(organizationId),
            });
            return data as StripePaymentMethod[];
        },
        enabled: !!organizationId,
    });
};

export const useSetDefaultPaymentMethod = () => {
    return useMutation({
        mutationFn: async ({ organizationId, paymentMethodId }: { organizationId: string, paymentMethodId: string }) => {
            return await http.post({
                url: routes.billing.setDefaultPaymentMethod(organizationId, paymentMethodId),
                body: {},
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["payment-methods", variables.organizationId] });
        },
    });
};

export const useDeletePaymentMethod = () => {
    return useMutation({
        mutationFn: async ({ organizationId, paymentMethodId }: { organizationId: string, paymentMethodId: string }) => {
            return await http.delete({
                url: routes.billing.deletePaymentMethod(organizationId, paymentMethodId),
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["payment-methods", variables.organizationId] });
        },
    });
};
