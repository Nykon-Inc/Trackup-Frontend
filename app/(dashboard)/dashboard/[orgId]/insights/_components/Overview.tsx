import React from 'react'
import { IOrgHourlyInsight } from '@/interfaces/ai.interfaces';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Target, AlertCircle, BarChart3, ArrowRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';

interface SummaryCardProps {
    title: string;
    value: string | React.ReactNode;
    description: string | React.ReactNode;
    footer?: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

const SummaryCard = ({ title, value, description, footer, icon, iconBg, iconColor }: SummaryCardProps) => (
    <Card className="flex flex-col gap-0 py-4">
        <CardHeader className="p-4 pt-1 pb-2">
            <div className="flex items-start gap-3">
                <div className={cn("p-2.5 rounded-xl", iconBg)}>
                    <div className={iconColor}>{icon}</div>
                </div>
                <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    <span className="text-2xl font-bold tracking-tight">{value}</span>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="text-xs text-muted-foreground leading-relaxed h-10">
                {description}
            </div>
            {footer && (
                <div className="mt-0 pt-2">
                    <span className="text-[10px] text-muted-foreground font-medium">
                        {footer}
                    </span>
                </div>
            )}
        </CardContent>
    </Card>
);

const OverviewSkeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <SummaryCard
                    key={i}
                    title="Loading..."
                    value={<Skeleton className="h-8 w-24 mt-1" />}
                    description={<Skeleton className="h-4 w-full mt-2" />}
                    icon={<Skeleton className="h-5 w-5 rounded-full" />}
                    iconBg="bg-slate-50"
                    iconColor="text-slate-200"
                />
            ))}
        </div>
        <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4 " />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-[90%] mb-2" />
            <Skeleton className="h-4 w-[95%] mb-2" />
        </Card>
        <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4 " />
            <Skeleton className="h-8 w-full rounded-full mb-6" />
            <div className="flex gap-8">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-5 w-32" />)}
            </div>
        </Card>
    </div>
);

interface LegendItemProps {
    color: string;
    label: string;
    percentage: number;
}

const LegendItem = ({ color, label, percentage }: LegendItemProps) => (
    <div className="flex items-center gap-2">
        <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
        <span className="text-sm font-bold">{percentage}%</span>
        <span className="text-sm text-muted-foreground">{label}</span>
    </div>
);

interface SignalCardProps {
    title: string;
    count: number;
    pattern: string;
    whyItMatters: string;
}

const SignalCard = ({ title, count, pattern, whyItMatters }: SignalCardProps) => (
    <Card className="flex flex-col gap-0 py-4 h-full">
        <CardHeader className="p-4 pt-1 pb-2">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm">{title}</h4>
                <span className="text-xs text-muted-foreground">{count} staff</span>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col h-full">
            <div className="flex flex-col gap-3 mb-6">
                <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Pattern:</p>
                    <p className="text-xs font-medium">{pattern}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Why it matters:</p>
                    <p className="text-xs font-medium text-muted-foreground">{whyItMatters}</p>
                </div>
            </div>
            <div className="mt-auto">
                <Button variant="outline" size="sm" className="w-full text-xs font-bold h-9 flex items-center justify-center gap-2 rounded-lg">
                    View staff <ArrowRight className="w-3.5 h-3.5" />
                </Button>
            </div>
        </CardContent>
    </Card>
);

export default function Overview({ insights, isLoading }: { insights: IOrgHourlyInsight[], isLoading?: boolean }) {
    if (isLoading) return <OverviewSkeleton />;

    if (!insights || insights.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
                <EmptyState
                    icon={Search}
                    title="No insights captured for this date"
                    description="It looks like there was no work activity recorded for this period. This is common over weekends or holidays."
                />
            </div>
        )
    }

    // Usually, we'd use the most recent overall summary, but if the data is split hourly,
    // we take the latest or a combined one. For this UI, we'll assume the latest summary in the array 
    // represents the "Overview".
    const insight = insights[0];

    // Dummy values for illustrative data if missing in the schema
    const totalHours = (insight.stats?.totalAnalyzedHours || 0).toLocaleString();
    const staffCount = insight.stats?.staffCount || 0;
    const rawProductive = insight.distribution?.sustained || 0;
    const rawFragmented = insight.distribution?.fragmented || 0;
    const rawIdle = insight.distribution?.idle || 0;
    const totalDist = rawProductive + rawFragmented + rawIdle;

    const productiveTime = totalDist > 0 ? Math.round((rawProductive / totalDist) * 100) : 0;
    const fragmentedTime = totalDist > 0 ? Math.round((rawFragmented / totalDist) * 100) : 0;
    const idleTime = totalDist > 0 ? (100 - productiveTime - fragmentedTime) : 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Productive Time Coverage"
                    value={`${productiveTime}%`}
                    description="of analyzed time shows sustained, role-aligned activity"
                    footer="Based on screenshots + activity consistency"
                    icon={<TrendingUp className="w-5 h-5" />}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                />
                <SummaryCard
                    title="Focus Consistency"
                    value={insight.integrityStatus.charAt(0).toUpperCase() + insight.integrityStatus.slice(1)}
                    description="Most staff maintained stable focus blocks"
                    footer="Low excessive context switching observed"
                    icon={<Target className="w-5 h-5" />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <SummaryCard
                    title="Work Integrity Signals"
                    value={`${insight.signals.fragmentedCount + insight.signals.idleCount} %`}
                    description="Review suggested for individuals with irregular activity patterns"
                    footer="Based on inconsistent or fragmented work patterns"
                    icon={<AlertCircle className="w-5 h-5" />}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-600"
                />
                <SummaryCard
                    title="Analysis Coverage"
                    value={`${totalHours}h`}
                    description={`analyzed across ${staffCount} staff members in your organization`}
                    footer="Builds trust in the data"
                    icon={<BarChart3 className="w-5 h-5" />}
                    iconBg="bg-violet-50"
                    iconColor="text-violet-600"
                />
            </div>

            {/* What we observed */}
            <Card className="p-6 gap-0">
                <h3 className="text-base font-bold mb-4 tracking-tight">What we observed</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.executiveSummary}
                </p>
            </Card>

            {/* How work time is being used */}
            <Card className="p-6 gap-0">
                <h3 className="text-base font-bold mb-2 tracking-tight">How work time is being used</h3>

                <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden mb-2">
                    <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${productiveTime}%` }}
                    />
                    <div
                        className="h-full bg-orange-400"
                        style={{ width: `${fragmentedTime}%` }}
                    />
                    <div
                        className="h-full bg-slate-200"
                        style={{ width: `${idleTime}%` }}
                    />
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
                    <LegendItem color="bg-emerald-500" label="Sustained focus" percentage={productiveTime} />
                    <LegendItem color="bg-orange-400" label="Fragmented" percentage={fragmentedTime} />
                    <LegendItem color="bg-slate-200" label="Idle / low-signal" percentage={idleTime} />
                </div>

                <div className="mt-6 pt-4 border-t border-border/50">
                    <p className="text-[11px] text-muted-foreground">
                        <span className="font-bold text-foreground">Sustained focus</span> = long, uninterrupted work blocks • <span className="font-bold text-foreground">Fragmented</span> = frequent switching, short bursts • <span className="font-bold text-foreground">Idle / low-signal</span> = extended inactivity
                    </p>
                </div>
            </Card>

            {/* Signals worth reviewing */}
            <div>
                <h3 className="text-base font-bold mb-4 tracking-tight">Signals worth reviewing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SignalCard
                        title="Fragmented Work Patterns"
                        count={insight.signals.fragmentedCount}
                        pattern="Repeated short activity bursts across the day"
                        whyItMatters="Common in over-employment scenarios"
                    />
                    <SignalCard
                        title="Extended Idle Windows"
                        count={insight.signals.idleCount}
                        pattern="Multiple idle periods >30 minutes during business hours"
                        whyItMatters="May indicate disengagement or divided attention"
                    />
                    <SignalCard
                        title="Inconsistent Screenshot Density"
                        count={insight.stats?.inconsistentScreenshotsCount || 0}
                        pattern="Large gaps between captured activity"
                        whyItMatters="Could suggest app toggling or work avoidance"
                    />
                </div>
            </div>
        </div>
    )
}
