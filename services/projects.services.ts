import { useMutation, useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { queryClient } from "@/lib/react-query";
import {
    CreateProjectPayload,
    InviteUserPayload,
    Project,
    GetProjectsResponse,
    ProjectDetails,
    GetProjectMembersResponse,
    GetProjectMembersQuery,
} from "@/interfaces/projects.interfaces";
import { invalidateActivityLogs } from "@/services/activity-logs";

export const useCreateProject = () => {
    return useMutation({
        mutationFn: async (payload: CreateProjectPayload) => {
            const data = await http.post({
                url: routes.projects.index,
                body: payload,
            });
            return data as Project;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            invalidateActivityLogs();
        },
    });
};


export const useCreateProjectOnboarding = () => {
    return useMutation({
        mutationFn: async ({ token, organizationId, ...payload }: CreateProjectPayload & { token: string, organizationId: string }) => {
            const data = await http.post({
                url: `${routes.organization.index}/${organizationId}/projects`,
                body: payload,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            return data as Project;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            invalidateActivityLogs();
        },
    });
};


export const useCreateProjectInternal = () => {
    return useMutation({
        mutationFn: async (payload: CreateProjectPayload) => {
            const data = await http.post({
                url: routes.projects.meInternal,
                body: payload,
            });
            return data as Project;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            invalidateActivityLogs();
        },
    });
};

export const useGetInternalProjects = (query?: Record<string, any>) => {
    return useQuery({
        queryKey: ["internal-projects", query],
        queryFn: async () => {
            const data = await http.get({
                url: routes.projects.meInternal,
                query,
            });
            return data as GetProjectsResponse;
        },
    });
};

export const useGetInternalProject = (projectId: string) => {
    return useQuery({
        queryKey: ["internal-project", projectId],
        queryFn: async () => {
            const data = await http.get({
                url: `${routes.projects.meInternal}/${projectId}`,
            });
            return data as ProjectDetails;
        },
        enabled: !!projectId,
    });
};

export const useGetProjects = (payload: { organizationId: string, query?: Record<string, any> }) => {
    return useQuery({
        queryKey: ["projects", payload.organizationId, payload.query],
        queryFn: async () => {
            const data = await http.get({
                url: `${routes.organization.index}/${payload.organizationId}/projects`,
                query: payload.query,
            });
            return data as GetProjectsResponse;
        },
    });
};

export const useGetProject = (payload: { organizationId: string, projectId: string }) => {
    return useQuery({
        queryKey: ["project", payload.projectId],
        queryFn: async () => {
            const data = await http.get({
                url: `${routes.organization.index}/${payload.organizationId}/projects/${payload.projectId}`,
            });
            return data as ProjectDetails;
        },
        enabled: !!payload.projectId,
    });
};

export const useInviteUser = (projectId: string) => {
    return useMutation({
        mutationFn: async (payload: { members: InviteUserPayload[] }) => {
            const data = await http.post({
                url: `${routes.projects.index}/${projectId}${routes.projects.invite}`,
                body: payload,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-members", projectId, { status: "invited" }] });
        },
    });
};


export const useResendInviteUser = () => {
    return useMutation({
        mutationFn: async ({ projectId, ...payload }: { members: InviteUserPayload[], projectId: string }) => {
            const data = await http.post({
                url: `${routes.projects.index}/${projectId}${routes.projects.invite}`,
                body: payload,
            });
            return data;
        },
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-members", projectId, { status: "invited" }] });
        },
    });
};
export const useGetProjectMembers = (projectId: string, query?: GetProjectMembersQuery) => {
    return useQuery({
        queryKey: ["project-members", projectId, query],
        queryFn: async () => {
            const data = await http.get({
                url: `${routes.projects.index}/${projectId}/${query?.status === "invited" ? "invitations" : "members"}`,
                query,
            });
            return data as GetProjectMembersResponse;
        },
        enabled: !!projectId,
    });
};
