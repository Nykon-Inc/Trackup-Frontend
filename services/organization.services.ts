import { useMutation, useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { OrganizationMember, GetInternalOrganizationsParams, Organization } from "@/interfaces/organizations.interfaces";
import { invalidateActivityLogs } from "@/services/activity-logs";
import { InviteUserPayload, ProjectMemberRole } from "@/interfaces/projects.interfaces";
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

export const useGetInternalOrganization = (organizationId: string) => {
    return useQuery({
        queryKey: ["internal-organization", organizationId],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.internalGet(organizationId),
            });
            return data as Organization;
        },
        enabled: !!organizationId,
    });
};

export interface GetOrganizationUsersParams {
    organizationId: string;
    page?: number;
    limit?: number;
    search?: string;
}

export const useGetOrganizationUsers = (params: GetOrganizationUsersParams) => {
    return useQuery({
        queryKey: ["organization-users", params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.internalUsers(params.organizationId),
                query: {
                    page: params.page,
                    limit: params.limit,
                    search: params.search
                }
            });
            return data;
        },
        enabled: !!params.organizationId,
    });
};

export const useInviteUserToOrganization = (organizationId: string) => {
    return useMutation({
        mutationFn: async (payload: { members: InviteUserPayload[] }) => {
            const data = await http.post({
                url: routes.organization.internalInviteUser(organizationId),
                body: { payload: payload.members },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organization-users", { organizationId }] });
            invalidateActivityLogs();
        },
    });
};
