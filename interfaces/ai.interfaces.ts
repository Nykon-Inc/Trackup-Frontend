import { Account } from "./auth.interfaces";
import { Organization } from "./organizations.interfaces";
import { Project } from "./projects.interfaces";

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

export interface IGetInsightsToReviewParams {
    organizationId?: string;
    page?: number;
    limit?: number;
    dayCode?: string;
    projectId?: string;
}

export interface IGetUserProjectInsightsParams {
    organizationId?: string;
    userId: string;
    projectId: string;
    page?: number;
    limit?: number;
    dayCode?: string;
}

export interface IUpdateInsightNotesParams {
    insightId: string;
}

export interface IUpdateInsightNotesBody {
    notes: string;
}

export interface IInsightsToReviewResponse {
    results: IInsightReviewSummary[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
/**
 * Summary of a specific User + Project's flagged activity
 */
export interface IInsightReviewSummary {
    userId: string;
    projectId: string;
    count: number; // Total number of insights for this pair that require review
    latestInsight: IStaffHourlyInsight; // The most recent insight document
}

export interface GetInsightsSummaryResponse {
    results: IInsightReviewSummary[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
/**
 * The individual Insight document (populated)
 */
export interface IStaffHourlyInsight {
    id: string;
    userId: string;
    organizationId: string;
    projectId: string;
    batchId: string;
    dayCode: string; // YYYY-MM-DD
    startTime: string; // ISO Date String
    endTime: string; // ISO Date String
    notes: string;
    project?: Project; // Populated Project document
    organization?: Organization; // Populated Organization document
    createdAt: string;
    updatedAt: string;
    user: Account
}
/**
 * The structure produced by the LLM analysis
 */
export interface IAIAnalysisResult {
    hourly_summary: string;
    primary_activity: string;
    screenshots_reviewed: number;
    activity_pattern: string;
    work_summary: string[];
    time_allocation: Array<{
        activity: string;
        percentage: number;
    }>;
    review_score: number; // 0 to 1
    review_priority: 'low' | 'medium' | 'high';
    primary_signal: string | null; // e.g., "Low activity detected"
    review_evidence: string[]; // Specific reasons for the score
    confidence: number;
    patterns_observed: string[];
}

export interface ITriggerOrgNarrativeBody {
    batchId: string;
    organizationId: string;
}