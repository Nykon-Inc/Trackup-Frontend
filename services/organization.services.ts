import { useMutation, useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { OrganizationMember, GetInternalOrganizationsParams } from "@/interfaces/organizations.interfaces";
import { invalidateActivityLogs } from "@/services/activity-logs";
import { BulkInvitePayload } from "@/interfaces/organizations.interfaces";
import { queryClient } from "@/lib/react-query";

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

export const useBulkInvite = () => {
    return useMutation({
        mutationFn: async (payload: BulkInvitePayload) => {
            const data = await http.post({
                url: routes.organization.bulkInvite(payload.organizationId),
                body: { members: payload.members },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organization-members"] });
        }
    });
};

export const useBulkInviteOnboarding = () => {
    return useMutation({
        mutationFn: async ({ token, ...payload }: BulkInvitePayload & { token: string }) => {
            const data = await http.post({
                url: routes.organization.bulkInvite(payload.organizationId),
                body: { members: payload.members },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            return data;
        },
    });
};

export const useGetHubstaffAuthUrl = () => {
    return useMutation({
        mutationFn: async (organizationId: string) => {
            const data = await http.get({
                url: routes.organization.hubstaffAuth(organizationId),
            });
            return data as { url: string };
        },
    });
};

export const useExchangeHubstaffToken = () => {
    return useMutation({
        mutationFn: async ({ organizationId, code }: { organizationId: string; code: string }) => {
            const data = await http.post({
                url: routes.organization.hubstaffExchangeToken(organizationId),
                body: { code },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-organizations"] });
        }
    });
};

export const useGetHubstaffProjects = (organizationId: string) => {
    return useQuery({
        queryKey: ["hubstaff-projects", organizationId],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.hubstaffProjects(organizationId),
            });
            return data;
        },
        enabled: !!organizationId,
    });
};
