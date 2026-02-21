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
} from "lucide-react"
import type { AggregatedSession } from "@/interfaces/sessions.interfaces"

export function InsightsTab({
    aggregatedSessions,
    sessionsLoading,
}: {
    aggregatedSessions: AggregatedSession[]
    sessionsLoading: boolean
}) {
    const [managerNote, setManagerNote] = useState("")
    const [showRawActivity, setShowRawActivity] = useState(true)
    const [rawActivityView, setRawActivityView] = useState<"screenshots" | "log">("screenshots")
    const [logFilter, setLogFilter] = useState<"all" | "active" | "idle">("all")

    const screenshots = useMemo(() => {
        return aggregatedSessions.flatMap((s) => s.screenshots || []).slice(0, 8)
    }, [aggregatedSessions])

    const days = useMemo(() => {
        if (aggregatedSessions.length > 0) {
            const dates = aggregatedSessions
                .map((s) => new Date(s.day || s.date))
                .filter((d) => !Number.isNaN(d.getTime()))
                .sort((a, b) => a.getTime() - b.getTime())
            if (dates.length > 0) {
                return eachDayOfInterval({ start: dates[0], end: dates[dates.length - 1] })
            }
        }
        return eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
    }, [aggregatedSessions])

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
                const time = s.timestamp ? format(new Date(s.timestamp * 1000), "HH:mm") : "--:--"
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

    return (
        <div className="space-y-4">
            <Card className="border border-border/60 shadow-sm rounded-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Tessa Insights</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Today
                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                            All Projects
                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" className="h-8 text-xs gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            Reports
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Card className="border border-border/60 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Summary — {totalHours.toFixed(1)}h total</CardTitle>
                    <p className="text-xs text-muted-foreground">Concentrated work sessions tracked across the selected date range.</p>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">Primary activity:</span>
                        <span className="text-xs font-medium">Work</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">Screenshots reviewed:</span>
                        <span className="text-xs font-medium">{screenshots.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">Activity pattern:</span>
                        <span className="text-xs font-medium">
                            {avgActivity >= 70 ? "Mostly consistent" : avgActivity >= 40 ? "Moderate" : "Inconsistent"}
                        </span>
                    </div>
                </CardContent>
            </Card>

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
                                {[
                                    { label: "Primarily focused on tracked tasks (55% of time)", color: "text-emerald-600" },
                                    { label: "Secondary work on project activities", color: "text-emerald-600" },
                                    { label: "Activity levels remained consistent throughout the period", color: "text-emerald-600" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.color}`} />
                                        <span className="text-xs text-muted-foreground">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <div className="flex flex-wrap gap-3 text-xs">
                                {[
                                    { label: "Work", pct: 55 },
                                    { label: "Meetings", pct: 25 },
                                    { label: "Review", pct: 15 },
                                    { label: "Other", pct: 5 },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-1">
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-muted-foreground">{item.pct}%</span>
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
                                        <span className="text-sm font-semibold text-red-500">{activityScore}</span>
                                        {activityScore < 80 && (
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-red-300 text-red-600">
                                                Review Recommended
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Progress
                                    value={activityScore}
                                    className={`h-2 ${activityScore < 80 ? "[&>div]:bg-red-500" : "[&>div]:bg-emerald-500"}`}
                                />
                                <div className="space-y-1">
                                    <p className="text-[11px] text-muted-foreground font-medium">Evidence</p>
                                    {[
                                        { text: "Extended idle periods detected (3+ occurrences)", color: "text-amber-500" },
                                        { text: "Unusual application switching pattern", color: "text-amber-500" },
                                        { text: "Activity gaps during core hours", color: "text-amber-500" },
                                    ].map((e, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${e.color}`} />
                                            <span className="text-xs text-muted-foreground">{e.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-sm rounded-xl">
                <CardHeader className="pb-2 cursor-pointer select-none" onClick={() => setShowRawActivity((v) => !v)}>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Manual Review — Raw Activity (10:00 AM – 11:00 AM)</CardTitle>
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
                            <button
                                type="button"
                                onClick={() => setRawActivityView("screenshots")}
                                className={clsx(
                                    "h-9 px-3 text-xs rounded-md transition-colors font-medium flex items-center gap-2",
                                    rawActivityView === "screenshots"
                                        ? "bg-background text-foreground shadow-sm border border-border"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Camera className="h-4 w-4" />
                                Screenshots ({screenshots.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setRawActivityView("log")}
                                className={clsx(
                                    "h-9 px-3 text-xs rounded-md transition-colors font-medium flex items-center gap-2",
                                    rawActivityView === "log"
                                        ? "bg-background text-foreground shadow-sm border border-border"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <AlignLeft className="h-4 w-4" />
                                Activity Log
                            </button>
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
                                ) : (
                                    <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {days.map((day) => {
                                            const session = aggregatedSessions.find((s) => {
                                                const d = new Date(s.day || s.date)
                                                return !Number.isNaN(d.getTime()) && isSameDay(d, day)
                                            })

                                            const firstShot = session?.screenshots?.[0]
                                            const shotCount = session?.screenshots?.length || 0
                                            const activity = typeof session?.activityRate === "number" ? Math.round(session.activityRate) : null

                                            return (
                                                <Card key={day.toISOString()} className="overflow-hidden border-border/60 h-full">
                                                    <div className="relative aspect-video w-full bg-muted/30">
                                                        {firstShot?.url ? (
                                                            <img
                                                                src={firstShot.url}
                                                                alt={`Screenshot ${format(day, "MMM d")}`}
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
                                                                {format(day, "MMM d, yyyy")}
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
                                                                    style={{ width: `${activity ?? 0}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground text-center">
                                                                {activity === null ? "No activity" : `${activity}% active`}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })}
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
                                    <div className="p-6 text-xs text-muted-foreground text-center">No activity logs found.</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            <Card className="border border-border/60 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Manager Notes — 10:00 AM – 11:00 AM</CardTitle>
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
        </div>
    )
}
