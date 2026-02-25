export interface GetAggregatedSessionsQuery {
    userId: string;
    startDate: string;
    endDate: string;
    projectId?: string;
}

export interface AppUsage {
    appName: string;
    timestamp: number;
    url: string | null;
    windowTitle: string;
    _id: string;
    id: string;
}

export interface Screenshot {
    sessionUuid: string;
    projectId: string;
    timestamp: number;
    userId: string;
    url: string;
    s3Key: string;
    createdAt: string;
    updatedAt: string;
    id: string;
}

export interface SessionBreakdown {
    uuid: string;
    appUsage: AppUsage[];
    createdAt: string;
    deductedSeconds: number;
    endTime: number;
    idleSeconds: number;
    isActive: boolean;
    keyboardEvents: number;
    mouseEvents: number;
    organizationId: string;
    projectId: string;
    startTime: number;
    updatedAt: string;
    userId: string;
    project: {
        name: string;
        id: string;
    };
    id: string;
    activity: number;
    duration: number;
}

export interface AggregatedSessions {
    day: string;
    projectId: string;
    projectName: string;
    userId: string;
    organizationId: string;
    idleSeconds: number;
    startTime: number;
    endTime: number;
    duration: number;
    activityRate: number;
    screenshots: Screenshot[];
    appUsage: AppUsage[];
    breakdown: SessionBreakdown[];
}

export type GetAggregatedSessionsResponse = AggregatedSessions[];
