import { Organization } from "./organizations.interfaces";
import { GetAggregatedSessionsResponse } from "./sessions.interfaces";

export interface CreateProjectPayload {
    name: string;
    description?: string;
    organizationId?: string;
    hubstaffProjectId?: string;
    type?: string;
    screenshotsEnabled?: boolean;
    manualTimeEditsEnabled?: boolean;
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
    projectType: "analytics" | "watchtower";
    hubstaffProjectId?: string;
    allowManualTimeEdits?: boolean;
    screenshotsEnabled?: boolean;
}

export interface Project extends IProject {
    id: string;
    organization: Organization
    membersCount?: number;
    totalHours?: number;
    totalSpent?: number;
    members?: {
        name: string;
        avatar?: string;
        email: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectDetails extends Project {
    staffCount: number;
    managerCount: number;
}

export enum ProjectMemberRole {
    OWNER = 'owner',
    MANAGER = 'manager',
    MEMBER = 'member',
    VIEWER = 'viewer'
}

export enum WorkDay {
    MON = 'Mon',
    TUE = 'Tue',
    WED = 'Wed',
    THU = 'Thu',
    FRI = 'Fri',
    SAT = 'Sat',
    SUN = 'Sun',
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
    jobTitle?: string;
    status: string;
    hourlyRate?: number;
    totalHoursWorked?: number;
    amountEarned?: number;
    weeklyLimitHours?: number | null;
    dailyLimitHours?: number | null;
    requiredBreaks?: boolean;
    expectedWeeklyHours?: number | null;
    expectedWorkDays?: WorkDay[];
    notes?: string;
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

export interface ProjectStatsResponse {
    projectId: string;
    membersAssigned: number;
    totalHoursWorked: number;
    totalPayment: number;
}

export interface ProjectMemberProfileResponse {
    project: {
        id: string;
        name: string;
        organizationId: string;
    };
    member: ProjectMember;
    employment: {
        startDate?: string | null;
        birthday?: string | null;
    };
    rangeMetrics: {
        totalHoursWorked: number;
        amountEarned: number;
        avgActivityRate: number;
        totalWorkedThisWeek: number;
        totalWorkedToday: number;
    };
    rawActivity: {
        aggregatedSessions: GetAggregatedSessionsResponse;
    };
}

export interface UpdateProjectMemberProfilePayload {
    role?: ProjectMemberRole;
    hourlyRate?: number;
    weeklyLimitHours?: number | null;
    dailyLimitHours?: number | null;
    requiredBreaks?: boolean;
    expectedWeeklyHours?: number | null;
    expectedWorkDays?: WorkDay[];
    notes?: string;
    startDate?: string | null;
    birthday?: string | null;
}
