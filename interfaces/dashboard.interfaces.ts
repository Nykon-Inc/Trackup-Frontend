export interface IMemberDashboard {
    role: 'member';
    metrics: {
        worked_week: IMetricWithTrend;
        weekly_activity: IMetricWithTrend;
        earned_week: IMetricValue;
        projects_worked: { value: number };
        today_activity: IMetricWithTrend;
        worked_today: IMetricWithTrend;
        earned_today: IMetricValue;
    };
    blocks: {
        recent_activity: IActivityBlock[];
        weekly_chart: IChartItem[];
        timesheet: ITimesheetItem[];
        project_activity: IProjectActivityItem[];
        apps_urls: {
            appName: string, url: string, hits: number
        }[];
    };
}

export interface IOwnerDashboard {
    role: 'owner' | 'manager';
    metrics: {
        team_activity: IMetricWithTrend;
        worked_week: IMetricWithTrend;
        spent_week: { value: string };
        active_projects: { value: number };
        team_today_activity: IMetricWithTrend;
        team_worked_today: IMetricWithTrend;
        team_spent_today: { value: string };
    };
    blocks: {
        recent_team_activity: ITeamActivityBlock[];
        worked_week_chart: IChartItem[];
        projects_activity: IProjectBudgetItem[];
        members_list: IMemberItem[];
        apps_urls: {
            appName: string, url: string, hits: number
        }[];
    };
}

export interface IMetricValue {
    value: string;
    progress?: number;
}

export interface IMetricWithTrend extends IMetricValue {
    trend: string;
    trend_positive: boolean;
    chart_data: number[];
}

export interface IActivityBlock {
    id: string | number;
    score: number;
    project_name: string;
    timestamp: string;
    screenshot_url: string | null;
}

export interface ITeamActivityBlock {
    id: string | number;
    user_name: string;
    project: string;
    score: number;
    time_ago: string;
    screenshot_url: string | null;
}

export interface IChartItem {
    day: string;
    value: number;
}

export interface ITimesheetItem {
    id: string;
    project: string;
    date: string;
    start: string;
    end: string;
    duration: string;
}

export interface IProjectActivityItem {
    id: string;
    name: string;
    time_spent: string;
    activity_score: number;
}

export interface IProjectBudgetItem {
    id: string;
    name: string;
    hours_spent: number;
    budget_hours: number;
    progress_percent: number;
}

export interface IMemberItem {
    id: string;
    name: string;
    status: 'online' | 'idle' | 'offline';
    activity_score: number;
    hours_this_week: string;
}
