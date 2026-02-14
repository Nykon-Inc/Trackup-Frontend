import { Account } from "./auth.interfaces";

export interface Organization {
    id: string;
    name: string;
    domain: string;
    status: 'active' | 'disabled'
    onboarding?: {
        currentStep: OnboardingStep;
        completedSteps: OnboardingStep[];
        completedAt?: Date;
    };
    createdAt: string;
    updatedAt: string;
    isHubstaffConnected: boolean;
}



export enum OnboardingStep {
    OWNER_INVITED = 'OWNER_INVITED',
    OWNER_VERIFIED = 'OWNER_VERIFIED',
    PROJECT_CREATED = 'PROJECT_CREATED',
    STAFF_INVITED = 'STAFF_INVITED',
    DESKTOP_CONNECTED = 'DESKTOP_CONNECTED',
}

export interface PermissionOverrides {
    add: string[];
    remove: string[];
}

export interface OrganizationMember {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    permissionOverrides: PermissionOverrides;
    organization: Organization;
    user: Account
}

export enum OrganizationInvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    EXPIRED = 'expired'
}


export enum OrganizationMemberRole {
    OWNER = 'owner',
    MANAGER = 'manager',
    MEMBER = 'member'
}

export interface OrganizationInvitation {
    email: string;
    organizationId: string;
    token: string;
    status: OrganizationInvitationStatus;
    expiresAt: Date;
    role: OrganizationMemberRole;
    birthday?: Date;
    startDate?: Date;
    projectIds?: string[];
    organization: Organization;

    createdAt: string;
    updatedAt: string;
    id: string;
    projects: { projectId: string, role: string }[]; // Or more specific if needed
}

export interface GetInternalOrganizationsParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface BulkInviteMember {
    email: string;
    role: 'manager' | 'member';
    birthday?: string;
    startDate?: string;
    projects?: {
        projectId: string;
        role: 'viewer' | 'member' | 'manager';
    }[];
}

export interface BulkInvitePayload {
    organizationId: string;
    members: BulkInviteMember[];
}
