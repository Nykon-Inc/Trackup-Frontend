import { useMutation, useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { OrganizationMember, GetInternalOrganizationsParams } from "@/interfaces/organizations.interfaces";
import { invalidateActivityLogs } from "@/services/activity-logs";
import { BulkInvitePayload } from "@/interfaces/organizations.interfaces";
import { queryClient } from "@/lib/react-query";
import { LoginResultInterface } from "@/interfaces/auth.interfaces";
import { cookieKey, useAuthStore } from "@/stores/auth.store";
import { setCookie } from "nookies";

export const useGetMyOrganizations = (key?: string) => {
    return useQuery({
        queryKey: ["my-organizations", key],
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
            queryClient.invalidateQueries({ queryKey: ["organization-invitations"] });
        }
    });
};

export const useBulkInviteOnboarding = () => {
    return useMutation({
        mutationFn: async ({ token, organizationId, members }: BulkInvitePayload & { token: string }) => {
            const data = await http.post({
                url: routes.organization.bulkInvite(organizationId),
                body: { members },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            return data;
        },
    });
};

export const useAcceptInvitation = () => {
    const { setAccount, setAccess, setOrganization, setPermissions } = useAuthStore();
    return useMutation({
        mutationFn: async ({ organizationId, token }: { organizationId: string, token: string }) => {
            const data = await http.post({
                url: routes.organization.acceptInvitation(organizationId),
                body: {},
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            return data as LoginResultInterface;
        },
        onSuccess: (data) => {
            setAccount(data.account);
            setAccess(data.credentials);
            if (data.account.accountType === "client" && data.organization) {
                setOrganization(data.organization);
            }
            if (data.account.accountType === "internal" && data.permissions) {
                setPermissions(data.permissions);
                setCookie(null, "PERMISSIONS", JSON.stringify(data.permissions), {
                    path: "/",
                });
            }
            setCookie(null, cookieKey, data.credentials.access.token, {
                path: "/",
            });
            queryClient.invalidateQueries({ queryKey: ["my-organizations"] });
        },
    });
};

export const useRejectInvitation = () => {
    return useMutation({
        mutationFn: async ({ organizationId, token }: { organizationId: string, token: string }) => {
            const data = await http.post({
                url: routes.organization.rejectInvitation(organizationId),
                body: {},
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-organizations"] });
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

export interface GetOrganizationMembersParams {
    organizationId: string;
    query?: {
        search?: string;
        page?: number;
        limit?: number;
    };
}

export const useGetOrganizationMembers = (params: GetOrganizationMembersParams) => {
    return useQuery({
        queryKey: ["organization-members", params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.members(params.organizationId),
                query: params.query,
            });
            return data;
        },
        enabled: !!params.organizationId,
    });
};

export const useGetOrganizationInvitations = (params: GetOrganizationMembersParams) => {
    return useQuery({
        queryKey: ["organization-invitations", params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.invitations(params.organizationId),
                query: params.query,
            });
            return data;
        },
        enabled: !!params.organizationId,
    });
};
