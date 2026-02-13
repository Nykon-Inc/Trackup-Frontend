
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
}

export interface GetInternalOrganizationsParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface BulkInvitePayload {
    organizationId: string;
    members: {
        email: string;
        role: string;
    }[];
}
