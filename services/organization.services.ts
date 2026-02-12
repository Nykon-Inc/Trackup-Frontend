import { useMutation, useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { OrganizationMember, GetInternalOrganizationsParams } from "@/interfaces/organizations.interfaces";
import { invalidateActivityLogs } from "@/services/activity-logs";

export const useGetMyOrganizations = () => {
    return useQuery({
        queryKey: ["my-organizations"],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.me,
            });
            // Assuming the API returns a list of organizations or organization members
            // If it returns a paginated response, we might need to adjust.
            // Based on auth.store, it seems simple for now. 
            // We'll return it as is.
            return data as OrganizationMember[];
        },
    });
};

export const useCreateInternalOrganization = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const data = await http.post({
                url: routes.organization.internalCreate,
                body: payload,
            });
            return data;
        },
        onSuccess: () => {
            invalidateActivityLogs();
        }
    });
};



export const useGetInternalOrganizations = (params: GetInternalOrganizationsParams = {}) => {
    return useQuery({
        queryKey: ["internal-organizations", params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.internalCreate,
                query: {
                    page: params.page,
                    limit: params.limit,
                    search: params.search
                }
            });
            return data;
        },
    });
};
export const useDisableOrganization = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const data = await http.delete({
                url: routes.organization.internalDetail(id),
            });
            return data;
        },
        onSuccess: () => {
            invalidateActivityLogs();
        }
    });
};

export const useEnableOrganization = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const data = await http.patch({
                url: routes.organization.internalEnable(id),
                body: {},
            });
            return data;
        },
        onSuccess: () => {
            invalidateActivityLogs();
        }
    });
};

export const useResendOrganizationInvite = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const data = await http.post({
                url: routes.organization.internalResendInvite(id),
                body: {},
            });
            return data;
        },
        onSuccess: () => {
            invalidateActivityLogs();
        }
    });
};
