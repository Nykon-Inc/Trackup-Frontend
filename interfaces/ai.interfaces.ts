export interface IStaffHourlyInsight {
    id: string;
    userId: string;
    organizationId: string;
    batchId: string;
    projectId: string;
    startTime: string;
    endTime: string;
    hourlyData: {
        user_id: string;
        project_id: string;
        start: string;
        end: string;
        slots: {
            time_slot: string;
            overall: number;
            keyboard: number;
            mouse: number;
            screenshots: {
                app: string;
                recordedAtMs: number;
                full_url: string;
            }[];
        }[];
        summary: {
            avg_activity: number;
            min_activity: number;
            max_activity: number;
            avg_keyboard: number;
            avg_mouse: number;
            screenshot_count: number;
            unique_screens: number;
            repeated_screen_ratio: number;
        };
    };
    aiResult: {
        hourly_summary: string;
        primary_activity: string;
        screenshots_reviewed: number;
        activity_pattern: string;
        work_summary: string[];
        time_allocation: {
            activity: string;
            percentage: number;
        }[];
        review_score: number;
        review_evidence: string[];
        review_priority: "low" | "medium" | "high";
        confidence: number;
        patterns_observed: string[];
    };
}

export interface IOrgHourlyInsight {
    id: string;
    organizationId: string;
    batchId: string;
    startTime: string;
    endTime: string;
    executiveSummary: string;
    integrityStatus: 'stable' | 'warning' | 'critical';
    distribution: {
        sustained: number;
        fragmented: number;
        idle: number;
    };
    signals: {
        fragmentedCount: number;
        idleCount: number;
    };
    stats: any;
    flaggedStaff: string[];
}

export interface IGetStaffInsightsParams {
    projectId: string;
    userId: string;
    startDate?: string;
    endDate?: string;
}

export interface IGetOrgInsightsParams {
    organizationId?: string;
    dayCode?: string;
    startDate?: string;
    endDate?: string;
}

export interface IRunUserInsightsBody {
    userId: string;
    projectId: string;
    startTime?: string;
    endTime?: string;
}
