export interface IWorkBreakPolicy {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    duration: number;
    paid: boolean;
    enabled: boolean;
    projectIds: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateWorkBreakPolicyPayload {
    name: string;
    description: string;
    duration: number;
    paid?: boolean;
    enabled?: boolean;
    projectIds: string[];
}

export interface UpdateWorkBreakPolicyPayload {
    name?: string;
    description?: string;
    duration: number;
    paid?: boolean;
    enabled?: boolean;
    projectIds?: string[];
}

export interface GetWorkBreakPoliciesParams {
    search?: string;
    sortBy?: string;
    limit?: number;
    page?: number;
    is_enabled?: boolean;
    projectId?: string;
}
