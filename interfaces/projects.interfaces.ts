import { Organization } from "./organizations.interfaces";

export interface CreateProjectPayload {
    name: string;
    description?: string;
    organizationId?: string;
    // Add other fields as necessary
}

export interface InviteUserPayload {
    email: string;
    role: ProjectMemberRole;
}

export enum ProjectStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
}

export interface IProject {
    name: string;
    description: string;
    organizationId: string;
    status: ProjectStatus;
}

export interface Project extends IProject {
    id: string;
    organization: Organization
    createdAt: string;
    updatedAt: string;
}

export interface ProjectDetails extends Project {
    staffCount: number;
    managerCount: number;
    membersCount: number;
}

export enum ProjectMemberRole {
    OWNER = 'owner',
    MANAGER = 'manager',
    MEMBER = 'member',
    VIEWER = 'viewer'
}

export interface GetProjectsResponse {
    results: Project[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
export interface ProjectMember {
    id: string;
    userId: string;
    projectId: string;
    role: ProjectMemberRole;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

export interface ProjectMembership extends ProjectMember {
    project: Project;
}

export interface GetProjectMembersQuery {
    role?: string;
    status?: string;
    sortBy?: string;
    limit?: number;
    page?: number;
    search?: string;
}

export interface GetProjectMembersResponse {
    results: ProjectMember[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
