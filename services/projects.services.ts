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
    ProjectStatsResponse,
    ProjectMemberProfileResponse,
    UpdateProjectMemberProfilePayload,
    UpdateProjectPayload,
} from "@/interfaces/projects.interfaces";
import { invalidateActivityLogs } from "@/services/activity-logs";

export const useCreateProject = () => {
    return useMutation({
        mutationFn: async ({ organizationId, ...payload }: CreateProjectPayload) => {
            const data = await http.post({
                url: `${routes.organization.index}/${organizationId}/projects`,
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

export const useUpdateProject = () => {
    return useMutation({
        mutationFn: async ({ organizationId, projectId, ...payload }: UpdateProjectPayload & { organizationId: string; projectId: string }) => {
            const data = await http.patch({
                url: `${routes.organization.index}/${organizationId}/projects/${projectId}`,
                body: payload,
            });
            return data as Project;
        },
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            invalidateActivityLogs();
        },
    });
};

export const useDeleteProject = () => {
    return useMutation({
        mutationFn: async ({ organizationId, projectId }: { organizationId: string; projectId: string }) => {
            const data = await http.delete({
                url: `${routes.organization.index}/${organizationId}/projects/${projectId}`,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            invalidateActivityLogs();
        },
    });
};

export const useCreateProjectOnboarding = () => {
    return useMutation({
        mutationFn: async ({ token, organizationId, ...payload }: CreateProjectPayload & { token: string }) => {
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

export const useGetProjects = (payload: { organizationId: string, userId: string, query?: Record<string, unknown> }) => {
    return useQuery({
        queryKey: ["projects", payload.organizationId, payload.userId, payload.query],
        queryFn: async () => {
            const data = await http.get({
                url: `${routes.organization.index}/${payload.organizationId}/projects`,
                query: payload.query,
            });
            return data as GetProjectsResponse;
        },
        enabled: !!payload.organizationId,
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

export const useGetProjectStats = (payload: { organizationId: string; projectId: string }) => {
    return useQuery({
        queryKey: ["project-stats", payload.organizationId, payload.projectId],
        queryFn: async () => {
            const data = await http.get({
                url: `/client/organizations/${payload.organizationId}/projects/${payload.projectId}/stats`,
            });
            return data as ProjectStatsResponse;
        },
        enabled: !!payload.organizationId && !!payload.projectId,
    });
};

export const useInviteUser = (projectId: string, organizationId?: string) => {
    return useMutation({
        mutationFn: async (payload: { members: InviteUserPayload[] }) => {
            const url = organizationId
                ? `${routes.organization.index}/${organizationId}/projects/${projectId}${routes.projects.invite}`
                : `${routes.projects.index}/${projectId}${routes.projects.invite}`;
            const data = await http.post({
                url,
                body: payload,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
        },
    });
};


export const useInviteMembersToProject = () => {
    return useMutation({
        mutationFn: async (payload: { projectId: string; members: InviteUserPayload[], organizationId: string }) => {
            const data = await http.post({
                url: `${routes.organization.index}/${payload.organizationId}/projects/${payload.projectId}${routes.projects.invite}`,
                body: { members: payload.members },
            });
            return data;
        },
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
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
export const useGetProjectMembers = (projectId: string, organizationId: string, query?: GetProjectMembersQuery) => {
    return useQuery({
        queryKey: ["project-members", projectId, query],
        queryFn: async () => {
            const data = await http.get({
                url: `${routes.organization.index}/${organizationId}/projects/${projectId}/${query?.status === "invited" ? "invitations" : "members"}`,
                query,
            });
            return data as GetProjectMembersResponse;
        },
        enabled: !!projectId,
    });
};

export const useGetProjectMemberProfile = (payload: {
    organizationId: string;
    projectId: string;
    userId: string;
    startDate?: string;
    endDate?: string;
}) => {
    return useQuery({
        queryKey: ["project-member-profile", payload],
        queryFn: async () => {
            const data = await http.get({
                url: `${routes.organization.index}/${payload.organizationId}/projects/${payload.projectId}/members/${payload.userId}/profile`,
                query: {
                    startDate: payload.startDate,
                    endDate: payload.endDate,
                },
            });
            return data as ProjectMemberProfileResponse;
        },
        enabled: !!payload.organizationId && !!payload.projectId && !!payload.userId,
    });
};

export const useUpdateProjectMemberProfile = () => {
    return useMutation({
        mutationFn: async (payload: {
            organizationId: string;
            projectId: string;
            userId: string;
            body: UpdateProjectMemberProfilePayload;
        }) => {
            const data = await http.patch({
                url: `${routes.organization.index}/${payload.organizationId}/projects/${payload.projectId}/members/${payload.userId}/profile`,
                body: payload.body,
            });
            return data as ProjectMemberProfileResponse;
        },
        onSuccess: (_, payload) => {
            queryClient.invalidateQueries({ queryKey: ["project-member-profile"] });
            queryClient.invalidateQueries({ queryKey: ["project-members", payload.projectId] });
            queryClient.invalidateQueries({ queryKey: ["project", payload.projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-stats", payload.organizationId, payload.projectId] });
        },
    });
};

export const useAssignProjectMember = () => {
    return useMutation({
        mutationFn: async (payload: {
            organizationId: string;
            projectId: string;
            userId: string;
            role?: "manager" | "member" | "viewer";
        }) => {
            return await http.post({
                url: `${routes.organization.index}/${payload.organizationId}/projects/${payload.projectId}/members`,
                body: {
                    userId: payload.userId,
                    role: payload.role,
                },
            });
        },
        onSuccess: (_, payload) => {
            queryClient.invalidateQueries({ queryKey: ["organization-member"] });
            queryClient.invalidateQueries({ queryKey: ["project-member-profile"] });
            queryClient.invalidateQueries({ queryKey: ["project-members", payload.projectId] });
        },
    });
};

export const useUnassignProjectMember = () => {
    return useMutation({
        mutationFn: async (payload: {
            organizationId: string;
            projectId: string;
            userId: string;
        }) => {
            return await http.delete({
                url: `${routes.organization.index}/${payload.organizationId}/projects/${payload.projectId}/members/${payload.userId}`,
            });
        },
        onSuccess: (_, payload) => {
            queryClient.invalidateQueries({ queryKey: ["organization-member"] });
            queryClient.invalidateQueries({ queryKey: ["project-member-profile"] });
            queryClient.invalidateQueries({ queryKey: ["project-members", payload.projectId] });
        },
    });
};
