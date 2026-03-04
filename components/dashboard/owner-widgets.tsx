import React from "react";
import { MetricCard, SparkLine } from "./metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical, Info, ChevronRight, Image as ImageIcon, Users, FolderOpen, UserCircle2, LayoutPanelTop } from "lucide-react";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import { IOwnerDashboard } from "@/interfaces/dashboard.interfaces";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
    day: {
        label: "Day",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export const OWNER_WIDGET_CONFIG = [
    { id: "stats_team_activity", label: "Team Activity", group: "Metric Cards" },
    { id: "stats_worked_week", label: "Worked This Week", group: "Metric Cards" },
    { id: "stats_spent_week", label: "Spent This Week", group: "Metric Cards" },
    { id: "stats_active_projects", label: "Active Projects", group: "Metric Cards" },
    { id: "stats_team_today_activity", label: "Team Today Activity", group: "Metric Cards" },
    { id: "stats_team_worked_today", label: "Team Worked Today", group: "Metric Cards" },
    { id: "stats_team_spent_today", label: "Team Spent Today", group: "Metric Cards" },
    { id: "block_recent_team_activity", label: "Recent Team Activity", group: "Content Blocks" },
    { id: "block_worked_week_chart", label: "Worked This Week Chart", group: "Content Blocks" },
    { id: "block_projects_activity", label: "Projects Activity", group: "Content Blocks" },
    { id: "block_members_list", label: "Members List", group: "Content Blocks" },
    { id: "block_apps_urls", label: "Apps & URLs", group: "Content Blocks" },
];

interface OwnerWidgetsProps {
    data: IOwnerDashboard;
    isLoading?: boolean;
    visibleWidgets?: string[];
    onVisibilityChange: (id: string, isVisible: boolean) => void;
}

export function OwnerWidgets({ data, isLoading, visibleWidgets, onVisibilityChange }: OwnerWidgetsProps) {
    if (isLoading) {
        return <OwnerWidgetsSkeleton />;
    }

    const isVisible = (id: string) => !visibleWidgets || visibleWidgets.includes(id);

    return (
        <div className="space-y-6">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {isVisible("stats_team_activity") && (
                    <MetricCard
                        title="TEAM ACTIVITY"
                        value={data.metrics.team_activity.value}
                        trend={data.metrics.team_activity.trend}
                        trendPositive={data.metrics.team_activity.trend_positive}
                        chart={<SparkLine data={data.metrics.team_activity.chart_data} color="green" />}
                        onRemove={() => onVisibilityChange("stats_team_activity", false)}
                    />
                )}
                {isVisible("stats_worked_week") && (
                    <MetricCard
                        title="WORKED THIS WEEK"
                        value={data.metrics.worked_week.value}
                        trend={data.metrics.worked_week.trend}
                        trendPositive={data.metrics.worked_week.trend_positive}
                        chart={<SparkLine data={data.metrics.worked_week.chart_data} color="blue" />}
                        onRemove={() => onVisibilityChange("stats_worked_week", false)}
                    />
                )}
                {isVisible("stats_spent_week") && (
                    <MetricCard
                        title="SPENT THIS WEEK"
                        value={data.metrics.spent_week.value}
                        chart={<div className="h-1 w-full bg-blue-100/50 mt-4 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-0"></div></div>}
                        onRemove={() => onVisibilityChange("stats_spent_week", false)}
                    />
                )}
                {isVisible("stats_active_projects") && (
                    <MetricCard
                        title="ACTIVE PROJECTS"
                        value={data.metrics.active_projects.value.toString()}
                        chart={<div className="h-6 w-24 ml-auto mt-1 bg-linear-to-t from-orange-100 to-transparent"></div>}
                        onRemove={() => onVisibilityChange("stats_active_projects", false)}
                    />
                )}
                {isVisible("stats_team_today_activity") && (
                    <MetricCard
                        title="TEAM TODAY ACTIVITY"
                        value={data.metrics.team_today_activity.value}
                        trend={data.metrics.team_today_activity.trend}
                        trendPositive={data.metrics.team_today_activity.trend_positive}
                        chart={<SparkLine data={data.metrics.team_today_activity.chart_data} color="green" />}
                        onRemove={() => onVisibilityChange("stats_team_today_activity", false)}
                    />
                )}
                {isVisible("stats_team_worked_today") && (
                    <MetricCard
                        title="TEAM WORKED TODAY"
                        value={data.metrics.team_worked_today.value}
                        trend={data.metrics.team_worked_today.trend}
                        trendPositive={data.metrics.team_worked_today.trend_positive}
                        chart={<SparkLine data={data.metrics.team_worked_today.chart_data} color="blue" />}
                        onRemove={() => onVisibilityChange("stats_team_worked_today", false)}
                    />
                )}
                {isVisible("stats_team_spent_today") && (
                    <MetricCard
                        title="TEAM SPENT TODAY"
                        value={data.metrics.team_spent_today.value}
                        chart={<div className="h-1 w-full bg-blue-100/50 mt-4 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-0"></div></div>}
                        onRemove={() => onVisibilityChange("stats_team_spent_today", false)}
                    />
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="space-y-6">
                    {/* Recent Activity (Screenshots) */}
                    {isVisible("block_recent_team_activity") && (
                        <Card className="rounded-md border shadow-sm p-1 gap-0">
                            <CardHeader className="flex flex-row items-center justify-between p-4 py-3 border-b">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">RECENT TEAM ACTIVITY</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                            </CardHeader>
                            <CardContent className="p-4">
                                {data.blocks.recent_team_activity.length === 0 ? (
                                    <EmptyState
                                        icon={ImageIcon}
                                        title="No recent activity"
                                        description="No screenshots or activity data recorded for your team recently."
                                        className="py-10"
                                    />
                                ) : (
                                    <>
                                        <div className="grid grid-cols-3 gap-3">
                                            {data.blocks.recent_team_activity.slice(0, 6).map((item) => (
                                                <div key={item.id} className="relative group aspect-video bg-muted/30 border rounded-sm flex flex-col items-center justify-center overflow-hidden">
                                                    <Badge className={`absolute -top-2 -right-2 text-[10px] px-1.5 py-0 border-white h-5 z-10 ${item.score >= 80 ? 'bg-green-500 hover:bg-green-600' :
                                                        item.score >= 50 ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                            'bg-red-500 hover:bg-red-600'
                                                        }`}>
                                                        {item.score}%
                                                    </Badge>
                                                    {item.screenshot_url ? (
                                                        <img src={item.screenshot_url} alt="Activity" className="w-full h-full object-cover rounded-sm" />
                                                    ) : (
                                                        <ImageIcon className="h-8 w-8 text-muted-foreground/20 mb-1" />
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[9px] text-white truncate text-center">
                                                        {item.user_name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-2 border-t flex justify-center">
                                            <Button variant="link" className="text-blue-500 h-auto p-0 text-xs font-normal">
                                                View all activity <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* This Week Chart */}
                    {isVisible("block_worked_week_chart") && (
                        <Card className="rounded-md border shadow-sm p-1 gap-0">
                            <CardHeader className="flex flex-row items-center justify-between p-4 py-3 border-b">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">WORKED THIS WEEK</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ChartContainer className="aspect-auto h-[200px] w-full" config={chartConfig}>
                                    <BarChart accessibilityLayer data={data.blocks.worked_week_chart}>
                                        <CartesianGrid vertical={false} horizontal={false} />
                                        <YAxis hide domain={[0, (dataMax: number) => Math.max(15, dataMax)]} />
                                        <XAxis
                                            dataKey="day"
                                            tickLine={false}
                                            tickMargin={3}
                                            axisLine={false}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            formatter={(value, name, item, index) => (
                                                <div className="flex items-center gap-2 font-medium">
                                                    {/* Custom label for the value */}
                                                    <span className="text-muted-foreground">Worked:</span>
                                                    {/* Logic to format 1.5 into "1h 30m" */}
                                                    {`${Math.floor(Number(value))}h ${Math.round((Number(value) % 1) * 60)}m`}

                                                    {/* Optional: Add a little color indicator manually */}
                                                    <div
                                                        className="h-2 w-2 rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                </div>
                                            )}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Bar barSize={24} dataKey="value" fill="var(--color-desktop)" radius={8} />
                                    </BarChart>
                                </ChartContainer>

                                <div className="mt-6 border-t pt-2 flex justify-center">
                                    <Button variant="link" className="text-blue-500 h-auto p-0 text-xs font-normal">
                                        View report <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Projects */}
                    {isVisible("block_projects_activity") && (
                        <Card className="rounded-md border shadow-sm p-1 gap-0">
                            <CardHeader className="flex flex-row items-center justify-between p-4 py-3 border-b">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">PROJECTS ACTIVITY</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {data.blocks.projects_activity.length === 0 ? (
                                    <EmptyState
                                        icon={FolderOpen}
                                        title="No project activity"
                                        description="You don't have any projects with active time tracking this week."
                                        className="py-10"
                                    />
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead>
                                                    <tr className="border-b text-muted-foreground">
                                                        <th className="font-semibold p-3 pl-4">Project</th>
                                                        <th className="font-semibold p-3 text-right">Hours</th>
                                                        <th className="font-semibold p-3 text-right pr-4">Budget Hours</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.blocks.projects_activity.map((proj) => (
                                                        <tr key={proj.id} className="border-b last:border-0 hover:bg-muted/30">
                                                            <td className="p-3 pl-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-medium text-blue-500 hover:underline cursor-pointer">{proj.name}</span>
                                                                    <div className="h-1 w-24 bg-muted overflow-hidden rounded-full">
                                                                        <div className="h-full bg-green-500" style={{ width: `${proj.progress_percent}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-3 text-right font-medium">{proj.hours_spent}h</td>
                                                            <td className="p-3 text-right text-muted-foreground pr-4">{proj.budget_hours}h</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-3 flex justify-center border-t">
                                            <Button variant="link" className="text-blue-500 h-auto p-0 text-xs font-normal">
                                                View all projects <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Members */}
                    {isVisible("block_members_list") && (
                        <Card className="rounded-md border shadow-sm p-1 gap-0">
                            <CardHeader className="flex flex-row items-center justify-between p-4 py-3 border-b">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">MEMBERS</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {data.blocks.members_list.length === 0 ? (
                                    <EmptyState
                                        icon={UserCircle2}
                                        title="No members"
                                        description="You haven't added any team members to your organization yet."
                                        className="py-10"
                                    />
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead>
                                                    <tr className="border-b text-muted-foreground">
                                                        <th className="font-semibold p-3 pl-4">Name</th>
                                                        <th className="font-semibold p-3">Status</th>
                                                        <th className="font-semibold p-3 text-right">Activity</th>
                                                        <th className="font-semibold p-3 text-right pr-4">This Week</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.blocks.members_list.map((member) => (
                                                        <tr key={member.id} className="border-b last:border-0 hover:bg-muted/30">
                                                            <td className="p-3 pl-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                                                                        {member.name.charAt(0)}
                                                                    </div>
                                                                    <span className="font-medium">{member.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${member.status === "online" ? "bg-green-50 text-green-700 ring-green-600/20" :
                                                                    member.status === "idle" ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20" :
                                                                        "bg-gray-50 text-gray-600 ring-gray-500/10"
                                                                    }`}>
                                                                    {member.status}
                                                                </div>
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <Badge className={`text-[10px] border-none h-5 px-1.5 ${member.activity_score >= 80 ? 'bg-green-500 hover:bg-green-600' :
                                                                    member.activity_score >= 50 ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                                        'bg-red-500 hover:bg-red-600'
                                                                    }`}>{member.activity_score}%</Badge>
                                                            </td>
                                                            <td className="p-3 text-right font-medium pr-4">{member.hours_this_week}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-3 flex justify-center border-t">
                                            <Button variant="link" className="text-blue-500 h-auto p-0 text-xs font-normal">
                                                View all members <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Apps & URLs */}
                    {isVisible("block_apps_urls") && (
                        <Card className="rounded-md border shadow-sm p-1 gap-0">
                            <CardHeader className="flex flex-row items-center justify-between p-4 py-3 border-b">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">APPS & URLS</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {data.blocks.apps_urls.length === 0 ? (
                                    <EmptyState
                                        icon={LayoutPanelTop}
                                        title="No apps or URLs"
                                        description="No application or website usage data recorded this week."
                                        className="py-10"
                                    />
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead>
                                                    <tr className="border-b text-muted-foreground">
                                                        <th className="font-semibold p-3 pl-4">App / URL</th>
                                                        <th className="font-semibold p-3 text-right pr-4">Hits</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.blocks.apps_urls.map((item, idx) => (
                                                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                                            <td className="p-3 pl-4">
                                                                <div className="flex flex-col gap-0.5 max-w-[200px] md:max-w-xs">
                                                                    <span className="font-medium truncate">{item.appName}</span>
                                                                    <span className="text-[10px] text-muted-foreground truncate">{item.url}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-3 text-right font-medium pr-4">{item.hits}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-3 flex justify-center border-t">
                                            <Button variant="link" className="text-blue-500 h-auto p-0 text-xs font-normal">
                                                View all apps & urls <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function OwnerWidgetsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-md" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full rounded-md" />
                <Skeleton className="h-64 w-full rounded-md" />
            </div>
        </div>
    )
}
