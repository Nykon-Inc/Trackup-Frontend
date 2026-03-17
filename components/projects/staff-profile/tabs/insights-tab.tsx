"use client"

import React, { useMemo, useState } from "react"
import clsx from "clsx"
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
    AlignLeft,
    AlertTriangle,
    BarChart2,
    CalendarDays,
    Camera,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileText,
    Save,
    Check,
    Sparkles,
    Info,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CustomTabs } from "@/components/custom-tabs"
import { useRunUserInsights } from "@/services/ai.services"
import { useParams } from "next/navigation"
import type { AggregatedSessions } from "@/interfaces/sessions.interfaces"
import { IStaffHourlyInsight } from "@/interfaces/ai.interfaces"
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar"

export function InsightsTab({
    aggregatedSessions,
    sessionsLoading,
    insightsData,
    onDateChange,
    selectedDate,
    employmentStartDate,
    runInsightsUserId,
    runInsightsProjectId,
}: {
    aggregatedSessions: AggregatedSessions[]
    sessionsLoading: boolean,
    insightsData: IStaffHourlyInsight[] | undefined,
    onDateChange: (date: Date) => void,
    selectedDate: Date,
    employmentStartDate: string | undefined
    runInsightsUserId?: string
    runInsightsProjectId?: string
}) {
    const params = useParams()
    const id = params?.id as string
    const staffId = params?.staffId as string
    const orgId = params?.orgId as string
    const [managerNote, setManagerNote] = useState("")
    const [showRawActivity, setShowRawActivity] = useState(true)
    const [rawActivityView, setRawActivityView] = useState<"screenshots" | "log">("screenshots")
    const [logFilter, setLogFilter] = useState<"all" | "active" | "idle">("all")
    const [selectedInsightId, setSelectedInsightId] = useState<string | "today">("today")

    const { mutate: runInsights, isPending } = useRunUserInsights();
    const effectiveUserId = runInsightsUserId || staffId || id
    const effectiveProjectId = runInsightsProjectId || (staffId ? id : "")

    const days = useMemo(() => {
        if (aggregatedSessions.length > 0) {
            const dates = aggregatedSessions
                .map((s) => new Date(s.day))
                .filter((d) => !Number.isNaN(d.getTime()))
                .sort((a, b) => a.getTime() - b.getTime())
            if (dates.length > 0) {
                return eachDayOfInterval({ start: dates[0], end: dates[dates.length - 1] })
            }
        }
        return eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
    }, [aggregatedSessions])

    const hours = useMemo(() => {
        return Array.from({ length: 24 }).map((_, i) => {
            const startHour = i;
            const endHour = (i + 1) % 24;
            
            const startAA = startHour >= 12 ? "pm" : "am";
            const endAA = endHour >= 12 ? "pm" : "am";
            
            const startH = startHour % 12 || 12;
            const endH = endHour % 12 || 12;

            const label = startAA === endAA
                ? `${startH}-${endH}${endAA}`
                : `${startH}${startAA}-${endH}${endAA}`;

            return {
                id: i.toString(), // Store as hour index
                label,
                hour: i
            }
        })
    }, [])

    const selectedLabel = useMemo(() => {
        if (selectedInsightId === "today") return "Full Day"
        const found = hours.find(h => h.id === selectedInsightId)
        return found ? found.label : "Full Day"
    }, [selectedInsightId, hours])

    const activityLog = useMemo(() => {
        const apps = ["CRM", "Gmail", "Slack", "Zoom", "Calendar", "Docs", "Idle"]
        const all = aggregatedSessions
            .flatMap((s) => s.screenshots || [])
            .slice()
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
            .slice(0, 40)
            .map((s, i) => {
                const app = apps[i % apps.length]
                const status = app === "Idle" ? "idle" : "active"
                const time = s.timestamp ? format(new Date(s.timestamp), "HH:mm") : "--:--"
                return { id: `${s.timestamp}-${i}`, time, app, status }
            })

        if (logFilter === "active") return all.filter((e) => e.status === "active")
        if (logFilter === "idle") return all.filter((e) => e.status === "idle")
        return all
    }, [aggregatedSessions, logFilter])

    const totalHours = useMemo(() => {
        return aggregatedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    }, [aggregatedSessions])

    const avgActivity = useMemo(() => {
        if (!aggregatedSessions.length) return 0
        return aggregatedSessions.reduce((sum, s) => sum + (s.activityRate || 0), 0) / aggregatedSessions.length
    }, [aggregatedSessions])

    const activityScore = Math.round(avgActivity)

    const filteredInsights = useMemo(() => {
        if (!insightsData) return []
        if (selectedInsightId === "today") return insightsData
        
        const selectedHour = parseInt(selectedInsightId);
        return insightsData.filter(i => {
            const start = new Date(i.startTime);
            return start.getHours() === selectedHour;
        })
    }, [insightsData, selectedInsightId])

    const getInsightLabel = (insight: IStaffHourlyInsight) => {
        const start = new Date(insight.startTime)
        const end = new Date(insight.endTime)
        const startH = format(start, "h")
        const startAA = format(start, "aa")
        const endH = format(end, "h")
        const endAA = format(end, "aa")

        return startAA === endAA
            ? `${startH}-${endH}${endAA}`
            : `${startH}${startAA}-${endH}${endAA}`
    }

    return (
        <div className="space-y-4">
            <Card className="border border-border/60 shadow-sm rounded-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Tessa Insights</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                        <DatePickerCalendar
                            onSelect={(date) => {
                                onDateChange(date!)
                                setSelectedInsightId("today")
                            }}
                            selected={selectedDate}
                            maxDate={new Date()}
                            minDate={employmentStartDate ? new Date(employmentStartDate) : undefined}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 min-w-[150px] justify-between">
                                    <div className="flex items-center gap-1.5">
                                        {selectedLabel}
                                    </div>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) max-h-72 overflow-y-auto p-1.5">
                                <DropdownMenuItem
                                    onClick={() => setSelectedInsightId("today")}
                                    className={clsx(
                                        "flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors justify-start",
                                        selectedInsightId === "today" ? "bg-[#D9C8B4] text-foreground font-medium" : "hover:bg-muted"
                                    )}
                                >
                                    <div className="w-4 flex items-center justify-center">
                                        {selectedInsightId === "today" && <Check className="h-4 w-4" />}
                                    </div>
                                    <span className="text-sm">Full Day</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1.5" />
                                <div className="space-y-1">
                                    {hours.map((hour) => {
                                        const isActive = selectedInsightId === hour.id
                                        return (
                                            <DropdownMenuItem
                                                key={hour.id}
                                                onClick={() => setSelectedInsightId(hour.id)}
                                                className={clsx(
                                                    "flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors justify-start",
                                                    isActive ? "bg-[#D9C8B4] text-foreground font-medium" : "hover:bg-muted"
                                                )}
                                            >
                                                <div className="w-4 flex items-center justify-center">
                                                    {isActive && <Check className="h-4 w-4" />}
                                                </div>
                                                <span className="text-sm">{hour.label}</span>
                                            </DropdownMenuItem>
                                        )
                                    })}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" className="h-8 text-xs gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            Reports
                        </Button>
                        <Button
                            onClick={() => {
                                let startTime: string | undefined;
                                let endTime: string | undefined;

                                if (selectedInsightId === "today") {
                                    const start = new Date(selectedDate);
                                    start.setHours(0, 0, 0, 0);
                                    startTime = start.toISOString();

                                    const end = new Date(selectedDate);
                                    end.setHours(23, 59, 59, 999);
                                    endTime = end.toISOString();
                                } else {
                                    const hour = parseInt(selectedInsightId);
                                    const start = new Date(selectedDate);
                                    start.setHours(hour, 0, 0, 0);
                                    startTime = start.toISOString();

                                    const end = new Date(selectedDate);
                                    end.setHours(hour, 59, 59, 999);
                                    endTime = end.toISOString();
                                }

                                runInsights({
                                    userId: effectiveUserId,
                                    projectId: effectiveProjectId,
                                    startTime,
                                    endTime
                                })
                            }}
                            size="sm"
                            disabled={!effectiveProjectId || isPending || selectedInsightId === "today"}
                            className="h-8 text-xs gap-1.5"
                        >
                            <FileText className="h-3.5 w-3.5" />
                            {isPending ? "Running..." : "Run Last Insights"}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {sessionsLoading && filteredInsights.length === 0 && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border border-border/60 rounded-xl overflow-hidden opacity-60">
                            <div className="p-10 flex justify-between items-center bg-muted/5">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {!sessionsLoading && filteredInsights.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 px-6 bg-muted/2 rounded-3xl border border-dashed border-border/60 mt-4 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#D9C8B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative mb-8">
                        <div className="absolute -inset-10 bg-[#D9C8B4]/15 rounded-full blur-3xl" />
                        <div className="relative bg-background border border-border/60 p-6 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
                            <Sparkles className="h-10 w-10 text-[#D9C8B4]" />
                        </div>
                    </div>

                    <div className="relative text-center space-y-3 z-10">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">No Insights for {format(selectedDate, "MMMM d, yyyy")}</h3>
                        <p className="text-[15px] text-muted-foreground/80 max-w-[400px] leading-relaxed mx-auto">
                            {aggregatedSessions.length === 0
                                ? "There was no activity recorded on this day. Insights will appear here once the expert starts logging work."
                                : "Activity was recorded, but it was too brief for Tessa to generate meaningful insights yet. Tessa requires significant activity to provide an accurate audit."}
                        </p>
                    </div>

                    {aggregatedSessions.length > 0 && (
                        <div className="mt-10 relative z-10">
                            <div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-muted/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/50 shadow-sm">
                                <Info className="h-4 w-4 text-[#D9C8B4]" />
                                <span>Tessa analyzes blocks of active work to provide quality audits.</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {filteredInsights.map((insight, index) => (
                <Collapsible
                    key={insight.id}
                    defaultOpen={selectedInsightId !== "today" || index === 0}
                    className="border border-border/60 rounded-xl bg-muted/10 overflow-hidden transition-all"
                >
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full flex justify-between items-center py-10 px-5 hover:bg-muted/20 transition-all group rounded-none border-none"
                        >
                            <div className="flex items-center gap-3 px-3">
                                <span className="text-base font-semibold">{getInsightLabel(insight)}</span>
                            </div>
                            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="p-6 pt-0 space-y-4">
                        <div className="text-muted-foreground text-sm">
                            {insight.aiResult.hourly_summary}
                        </div>
                        <Card className="border border-border/60 shadow-sm rounded-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Time Allocation</CardTitle>
                                <p className="text-xs text-muted-foreground">Work Summary</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {sessionsLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-1.5">
                                            {insight.aiResult.work_summary.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                                    <span className="text-xs text-muted-foreground">{item}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Separator />

                                        <div className="flex flex-wrap gap-3 text-xs">
                                            {insight.aiResult.time_allocation.map((item) => (
                                                <div key={item.activity} className="flex items-center gap-1">
                                                    <span className="font-medium">{item.activity}</span>
                                                    <span className="text-muted-foreground">{item.percentage}%</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 pt-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <BarChart2 className="h-4 w-4" />
                                                    Activity Review Score
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={clsx(
                                                        "text-sm font-semibold",
                                                        insight.aiResult.review_score < 0.7 ? "text-amber-500" : insight.aiResult.review_score < 0.4 ? "text-red-500" : "text-emerald-500"
                                                    )}>
                                                        {Math.round(insight.aiResult.review_score * 100)}%
                                                    </span>
                                                    {insight.aiResult.review_score > 0.55 && (
                                                        <Badge variant="outline" className={clsx(
                                                            "text-[10px] h-5 px-1.5",
                                                            insight.aiResult.review_score > 0.5 ? "border-red-300 text-red-600" : "border-amber-300 text-amber-600"
                                                        )}>
                                                            Review Recommended
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Progress
                                                value={insight.aiResult.review_score * 100}
                                                className={clsx(
                                                    "h-2",
                                                    insight.aiResult.review_score < 0.4 ? "[&>div]:bg-red-500" : insight.aiResult.review_score < 0.7 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"
                                                )}
                                            />
                                            {insight.aiResult.review_evidence.length > 0 && <div className="space-y-1">
                                                <p className="text-[11px] text-muted-foreground font-medium">Evidence</p>
                                                {insight.aiResult.review_evidence.map((text, i) => (
                                                    <div key={i} className="flex items-center gap-1.5">
                                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                                        <span className="text-xs text-muted-foreground">{text}</span>
                                                    </div>
                                                ))}
                                            </div>}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-border/60 shadow-sm rounded-xl">
                            <CardHeader className="pb-2 cursor-pointer select-none" onClick={() => setShowRawActivity((v) => !v)}>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">Manual Review — Raw Activity ({getInsightLabel(insight)})</CardTitle>
                                    {showRawActivity ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                            </CardHeader>
                            {showRawActivity && (
                                <CardContent className="space-y-3">
                                    <div className="inline-flex items-center rounded-lg bg-muted p-1">
                                        <CustomTabs
                                            value={rawActivityView}
                                            onChange={(v) => setRawActivityView(v as any)}
                                            tabs={[
                                                {
                                                    label: "Screenshots",
                                                    value: "screenshots",
                                                    icon: <Camera className="h-4 w-4" />
                                                },
                                                {
                                                    label: "Activity Log",
                                                    value: "log",
                                                    icon: <AlignLeft className="h-4 w-4" />
                                                }
                                            ]}
                                        />
                                    </div>

                                    {rawActivityView === "log" && (
                                        <div className="flex items-center gap-2">
                                            {([
                                                { value: "all", label: "All" },
                                                { value: "active", label: "Active only" },
                                                { value: "idle", label: "Idle only" },
                                            ] as const).map((f) => {
                                                const isActive = logFilter === f.value
                                                return (
                                                    <button
                                                        key={f.value}
                                                        type="button"
                                                        onClick={() => setLogFilter(f.value)}
                                                        className={clsx(
                                                            "h-8 px-3 rounded-full text-xs transition-colors",
                                                            isActive
                                                                ? "bg-foreground text-background"
                                                                : "bg-transparent text-foreground hover:bg-muted"
                                                        )}
                                                    >
                                                        {f.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {rawActivityView === "screenshots" && (
                                        <>
                                            {sessionsLoading ? (
                                                <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                                                    {days.map((day) => (
                                                        <Card key={day.toISOString()} className="overflow-hidden border-border/60">
                                                            <Skeleton className="aspect-video w-full rounded-none" />
                                                            <CardContent className="p-2 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <Skeleton className="h-3 w-20" />
                                                                    <Skeleton className="h-3 w-3 rounded-full" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Skeleton className="h-1 w-full" />
                                                                    <Skeleton className="h-2 w-16 mx-auto" />
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : insight.hourlyData.slots.filter(s => {
                                                const parts = s.time_slot.split(" - ");
                                                if (parts.length < 2) return true;
                                                return parts[0].trim() !== parts[1].split(" ")[0].trim();
                                            }).length > 0 ? (
                                                <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                                                    {insight.hourlyData.slots.filter(s => {
                                                        const parts = s.time_slot.split(" - ");
                                                        if (parts.length < 2) return true;
                                                        return parts[0].trim() !== parts[1].split(" ")[0].trim();
                                                    }).map((slot, sIdx) => {
                                                        const firstShot = slot.screenshots?.[0]
                                                        const shotCount = slot.screenshots?.length || 0
                                                        const activity = Math.round(slot.overall)
                                                        const slotTime = slot.time_slot

                                                        return (
                                                            <Card key={slot.time_slot || sIdx} className="overflow-hidden border-border/60 h-full gap-0 p-0">
                                                                <div className="relative aspect-video w-full bg-muted/30">
                                                                    {firstShot?.full_url ? (
                                                                        <img
                                                                            src={firstShot.full_url}
                                                                            alt={`Screenshot ${slotTime}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                                                                            <Camera className="h-6 w-6" />
                                                                        </div>
                                                                    )}

                                                                    {shotCount > 0 ? (
                                                                        <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-background/90 border border-border/60">
                                                                            {shotCount}
                                                                        </div>
                                                                    ) : null}
                                                                </div>

                                                                <CardContent className="p-2 space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-[11px] font-medium text-muted-foreground">
                                                                            {slotTime}
                                                                        </p>
                                                                        <div
                                                                            className={clsx(
                                                                                "h-2.5 w-2.5 rounded-full",
                                                                                shotCount > 0 ? "bg-emerald-500" : "bg-muted"
                                                                            )}
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1.5">
                                                                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-foreground"
                                                                                style={{ width: `${activity}%` }}
                                                                            />
                                                                        </div>
                                                                        <p className="text-[11px] text-muted-foreground text-center">
                                                                            {activity}% active
                                                                        </p>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border/60 rounded-xl bg-muted/5">
                                                    <div className="bg-muted/50 p-3 rounded-full mb-3">
                                                        <Camera className="h-6 w-6 text-muted-foreground/40" />
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-foreground">No screenshots available</h4>
                                                    <p className="text-xs text-muted-foreground max-w-[200px] text-center mt-1">
                                                        No visual activity was captured during this time period.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {rawActivityView === "log" && (
                                        <div className="rounded-lg border border-border/60 overflow-hidden">
                                            {sessionsLoading ? (
                                                <div className="p-4 space-y-2">
                                                    {Array.from({ length: 6 }).map((_, i) => (
                                                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                                                    ))}
                                                </div>
                                            ) : activityLog.length > 0 ? (
                                                <div className="max-h-[320px] overflow-y-auto">
                                                    {activityLog.map((e, i) => (
                                                        <div
                                                            key={e.id}
                                                            className={clsx(
                                                                "flex items-center gap-4 px-4 py-3 border-b last:border-b-0",
                                                                e.status === "idle" ? "bg-muted/20" : "bg-background",
                                                                "hover:bg-muted/30 transition-colors"
                                                            )}
                                                        >
                                                            <div className="w-14 text-xs text-muted-foreground tabular-nums">{e.time}</div>
                                                            <div className="flex-1 text-sm font-medium">{e.app}</div>
                                                            <div
                                                                className={clsx(
                                                                    "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                                                                    e.status === "active"
                                                                        ? "bg-foreground text-background"
                                                                        : "bg-muted text-muted-foreground"
                                                                )}
                                                            >
                                                                {e.status}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 px-4 bg-muted/5 rounded-lg border border-dashed border-border/60">
                                                    <div className="bg-muted/50 p-3 rounded-full mb-3">
                                                        <AlignLeft className="h-6 w-6 text-muted-foreground/40" />
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-foreground">No activity log entries</h4>
                                                    <p className="text-xs text-muted-foreground max-w-[200px] text-center mt-1">
                                                        Detailed app and status logs are not available for this window.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>

                        <Card className="border border-border/60 shadow-sm rounded-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Manager Notes — {getInsightLabel(insight)}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea
                                    placeholder="Add your notes for this hour/day..."
                                    value={managerNote}
                                    onChange={(e) => setManagerNote(e.target.value)}
                                    className="min-h-[120px] text-sm resize-none"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        className="gap-2 text-xs bg-foreground text-background hover:bg-foreground/90"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Note
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    )
}
