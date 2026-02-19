export interface IPTOPolicy {
    id: string;
    name: string;
    maxDaysPerYear: number;
    effectiveDate: string;
    description: string;
    enabled: boolean;
}

export interface IPTORequest {
    id: string;
    policyId: {
        id: string;
        name: string;
    };
    startDate: string;
    endDate: string;
    totalDays: number
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    createdAt: string;
    userId: {
        name: string;
        email: string;
    }
}

export interface IPTORequestPayload {
    startDate: string
    endDate: string
    reason?: string
    policyId: string
    isHalfStartDay: boolean
    isHalfEndDay: boolean
}

export enum PTOPOLICY_STATUS {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}