import React from "react";
import { MetricCard, SparkLine } from "./metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical, Info, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMemberDashboard } from "@/interfaces/dashboard.interfaces";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

const chartConfig = {
    day: {
        label: "Day",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig


export const MEMBER_WIDGET_CONFIG = [
    { id: "stats_worked_week", label: "Worked This Week", group: "Metric Cards" },
    { id: "stats_weekly_activity", label: "Weekly Activity", group: "Metric Cards" },
    { id: "stats_earned_week", label: "Earned This Week", group: "Metric Cards" },
    { id: "stats_projects_worked", label: "Projects Worked", group: "Metric Cards" },
    { id: "stats_today_activity", label: "Today's Activity", group: "Metric Cards" },
    { id: "stats_worked_today", label: "Worked Today", group: "Metric Cards" },
    { id: "stats_earned_today", label: "Earned Today", group: "Metric Cards" },
    { id: "block_recent_activity", label: "Recent Activity (Screenshots)", group: "Content Blocks" },
    { id: "block_weekly_chart", label: "Weekly Chart", group: "Content Blocks" },
    { id: "block_timesheet", label: "Timesheet", group: "Content Blocks" },
    { id: "block_project_activity", label: "Project Activity", group: "Content Blocks" },
    { id: "block_apps_urls", label: "Apps & URLs", group: "Content Blocks" },
];

interface MemberWidgetsProps {
    data: IMemberDashboard;
    isLoading?: boolean;
    visibleWidgets?: string[];
    onVisibilityChange: (id: string, isVisible: boolean) => void;
}

export function MemberWidgets({ data, isLoading, visibleWidgets, onVisibilityChange }: MemberWidgetsProps) {
    if (isLoading) {
        return <MemberWidgetsSkeleton />;
    }

    const isVisible = (id: string) => !visibleWidgets || visibleWidgets.includes(id);

    return (
        <div className="space-y-6">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {isVisible("stats_worked_week") && (
                    <MetricCard
                        title="WORKED THIS WEEK"
                        value={data.metrics.worked_week.value}
                        trend={data.metrics.worked_week.trend}
                        trendPositive={data.metrics.worked_week.trend_positive}
                        chart={<SparkLine data={data.metrics.worked_week.chart_data} color="cyan" />}
                        onRemove={() => onVisibilityChange("stats_worked_week", false)}
                    />
                )}
                {isVisible("stats_weekly_activity") && (
                    <MetricCard
                        title="WEEKLY ACTIVITY"
                        value={data.metrics.weekly_activity.value}
                        trend={data.metrics.weekly_activity.trend}
                        trendPositive={data.metrics.weekly_activity.trend_positive}
                        chart={<SparkLine data={data.metrics.weekly_activity.chart_data} color="blue" />}
                        onRemove={() => onVisibilityChange("stats_weekly_activity", false)}
                    />
                )}
                {isVisible("stats_earned_week") && (
                    <MetricCard
                        title="EARNED THIS WEEK"
                        value={data.metrics.earned_week.value}
                        chart={
                            <div className="h-1 w-full bg-blue-100/50 mt-4 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${data.metrics.earned_week.progress || 0}%` }}
                                ></div>
                            </div>
                        }
                        onRemove={() => onVisibilityChange("stats_earned_week", false)}
                    />
                )}
                {isVisible("stats_projects_worked") && (
                    <MetricCard
                        title="PROJECTS WORKED"
                        value={data.metrics.projects_worked.value.toString()}
                        chart={<div className="h-6 w-24 ml-auto mt-1 bg-linear-to-t from-blue-100 to-transparent"></div>}
                        onRemove={() => onVisibilityChange("stats_projects_worked", false)}
                    />
                )}
                {isVisible("stats_today_activity") && (
                    <MetricCard
                        title="TODAY'S ACTIVITY"
                        value={data.metrics.today_activity.value}
                        trend={data.metrics.today_activity.trend}
                        trendPositive={data.metrics.today_activity.trend_positive}
                        chart={<SparkLine data={data.metrics.today_activity.chart_data} color="blue" />}
                        onRemove={() => onVisibilityChange("stats_today_activity", false)}
                    />
                )}
                {isVisible("stats_worked_today") && (
                    <MetricCard
                        title="WORKED TODAY"
                        value={data.metrics.worked_today.value}
                        trend={data.metrics.worked_today.trend}
                        trendPositive={data.metrics.worked_today.trend_positive}
                        chart={<SparkLine data={data.metrics.worked_today.chart_data} color="cyan" />}
                        onRemove={() => onVisibilityChange("stats_worked_today", false)}
                    />
                )}
                {isVisible("stats_earned_today") && (
                    <MetricCard
                        title="EARNED TODAY"
                        value={data.metrics.earned_today.value}
                        chart={<div className="h-1 w-full bg-blue-100/50 mt-4 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-0"></div></div>}
                        onRemove={() => onVisibilityChange("stats_earned_today", false)}
                    />
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="space-y-6">
                    {/* Recent Activity (Screenshots) */}
                    {isVisible("block_recent_activity") && (
                        <Card className="rounded-md border shadow-sm  p-1 gap-0">
                            <CardHeader className="flex flex-row items-center justify-between p-4 py-3 border-b">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">RECENT ACTIVITY</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {data.blocks.recent_activity.slice(0, 6).map((activity) => (
                                        <div key={activity.id} className="relative group aspect-video bg-muted/30 border rounded-sm flex flex-col items-center justify-center">
                                            <Badge className={`absolute -top-2 -right-2 text-[10px] px-1.5 py-0 border-white h-5 bg-green-500 hover:bg-green-600`}>
                                                {activity.score}%
                                            </Badge>
                                            {activity.screenshot_url ? (
                                                <img src={activity.screenshot_url} alt="Activity" className="w-full h-full object-cover rounded-sm" />
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground/20 mb-1" />
                                                    <span className="text-[10px] text-muted-foreground/50 font-medium">No screenshot</span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-2 border-t flex justify-center">
                                    <Button variant="link" className="text-blue-500 h-auto p-0 text-xs font-normal">
                                        View activity <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* This Week Chart */}
                    {isVisible("block_weekly_chart") && (
                        <Card className="rounded-md border shadow-sm p-1 gap-0">
                            <CardHeader className="flex flex-row items-center justify-between p-4 py-3 border-b">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">THIS WEEK</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="w-full">
                                    <ChartContainer className="aspect-auto h-[200px] w-full" config={chartConfig}>
                                        <BarChart accessibilityLayer data={data.blocks.weekly_chart}>
                                            <CartesianGrid vertical={false} horizontal={false} />
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
                                </div>

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
                    {/* Timesheet */}
                    {isVisible("block_timesheet") && (
                        <Card className="rounded-md border shadow-sm  p-1 gap-0">
                            <CardHeader className="flex flex-row items-center justify-between p-4 py-3 border-b">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">TIMESHEET</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="border-b text-muted-foreground">
                                                <th className="font-semibold p-3 pl-4">Project</th>
                                                <th className="font-semibold p-3">Date</th>
                                                <th className="font-semibold p-3">Start time</th>
                                                <th className="font-semibold p-3">Stop time</th>
                                                <th className="font-semibold p-3 text-right pr-4">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.blocks.timesheet.map((entry) => (
                                                <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                                                    <td className="p-3 pl-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white font-bold">
                                                                {entry.project.charAt(0)}
                                                            </div>
                                                            <span className="font-medium text-foreground">{entry.project}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-muted-foreground">{entry.date}</td>
                                                    <td className="p-3 text-muted-foreground">{entry.start}</td>
                                                    <td className="p-3 text-muted-foreground">{entry.end}</td>
                                                    <td className="p-3 text-right font-medium pr-4">{entry.duration}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-3 flex justify-center border-t">
                                    <Button variant="link" className="text-blue-500 h-auto p-0 text-xs font-normal">
                                        View daily timesheet <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Current Project Activity */}
                    {isVisible("block_project_activity") && (
                        <Card className="rounded-md border shadow-sm p-1 gap-0">
                            <CardHeader className="flex flex-row items-center justify-between p-4 py-3 border-b">
                                <div className="flex items-center gap-1">
                                    <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">CURRENT PROJECT ACTIVITY</CardTitle>
                                    <Info className="h-3 w-3 text-muted-foreground/50" />
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="text-xs text-muted-foreground p-3 grid grid-cols-[1fr_auto] gap-4 font-semibold px-4 border-b">
                                    <span>Project</span>
                                    <span>Time</span>
                                </div>
                                <div>
                                    {data.blocks.project_activity.map((proj) => (
                                        <div key={proj.id} className="p-4 py-3 border-b last:border-0 hover:bg-muted/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white font-bold">
                                                        {proj.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-blue-500 cursor-pointer hover:underline">{proj.name}</span>
                                                    <Badge className="bg-green-500 hover:bg-green-600 text-[10px] border-none h-5 px-1.5">{proj.activity_score}%</Badge>
                                                </div>
                                                <span className="font-mono text-sm">{proj.time_spent}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${proj.activity_score}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 flex justify-center border-t">
                                    <Button variant="link" className="text-blue-500 h-auto p-0 text-xs font-normal">
                                        View report <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </div>
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
                            <CardContent className="p-8 flex flex-col items-center justify-center min-h-[160px]">
                                {/* Placeholder Graphic */}
                                <div className="w-24 h-16 bg-muted/20 border-2 border-dashed border-muted rounded-md mb-4 flex items-center justify-center">
                                    <span className="text-muted-foreground/30 text-[10px]">No Data</span>
                                </div>
                                <p className="text-xs text-muted-foreground">No apps or URLs visited this week.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function MemberWidgetsSkeleton() {
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
