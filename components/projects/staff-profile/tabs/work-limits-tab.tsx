"use client"

import React, { useMemo, useRef, useState } from "react"
import clsx from "clsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Clock, Info, Save, CalendarDays } from "lucide-react"
import type { ProjectMember } from "@/interfaces/projects.interfaces"
import { toast } from "sonner"

type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
const ALL_DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function WorkLimitsTab({ member }: { member: ProjectMember | undefined }) {
    const [activeDays, setActiveDays] = useState<Weekday[]>(["Mon", "Tue", "Wed", "Thu", "Fri"])
    const [weeklyLimit, setWeeklyLimit] = useState("40")
    const [dailyLimit, setDailyLimit] = useState("8")
    const [expectedWeeklyHours, setExpectedWeeklyHours] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [requireBreaks, setRequireBreaks] = useState(false)

    const initialRef = useRef({
        activeDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] as Weekday[],
        weeklyLimit: "40",
        dailyLimit: "8",
        expectedWeeklyHours: "",
    })

    const isDirty = useMemo(() => {
        const a = activeDays.join(",")
        const b = initialRef.current.activeDays.join(",")
        return (
            a !== b ||
            weeklyLimit !== initialRef.current.weeklyLimit ||
            dailyLimit !== initialRef.current.dailyLimit ||
            expectedWeeklyHours !== initialRef.current.expectedWeeklyHours
        )
    }, [activeDays, weeklyLimit, dailyLimit, expectedWeeklyHours])

    const toggleDay = (day: Weekday) => {
        setActiveDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
    }

    const expectedDaysLabel = useMemo(() => {
        const hasWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) => activeDays.includes(d as Weekday))
        if (hasWeekdays && activeDays.length === 5) return "Mon - Fri"
        return activeDays.join(" - ")
    }, [activeDays])

    return (
        <div className="space-y-6">
            <Card className="border border-border/60 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Work Limits
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Configure work hours and tracking limits for <span className="font-medium text-foreground">{member?.user?.name}</span>
                    </p>
                </CardHeader>

                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Weekly Work Days</p>
                                <p className="text-sm text-muted-foreground">
                                    Set the week days members are expected to work. You can also set which days members are not allowed to track time.
                                </p>
                            </div>

                            <p className="text-sm">
                                Expected work days: <span className="font-medium">{expectedDaysLabel}</span>
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {ALL_DAYS.map((day) => {
                                    const isActive = activeDays.includes(day)
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={clsx(
                                                "h-10 px-4 rounded-full text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-foreground text-background"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            )}
                                        >
                                            {day}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Right */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Expected Weekly Work Hours</p>
                                    <p className="text-sm text-muted-foreground">Set the hours members are expected to work weekly</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        value={expectedWeeklyHours}
                                        onChange={(e) => setExpectedWeeklyHours(e.target.value)}
                                        placeholder="No expected hours"
                                        className="h-11"
                                    />
                                    <div className="h-11 px-4 rounded-xl bg-muted text-muted-foreground flex items-center text-sm whitespace-nowrap">
                                        hrs/wk
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Weekly Limit</p>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Set the hours members are allowed to work weekly</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        value={weeklyLimit}
                                        onChange={(e) => setWeeklyLimit(e.target.value)}
                                        className="h-11"
                                    />
                                    <div className="h-11 px-4 rounded-xl bg-muted text-muted-foreground flex items-center text-sm whitespace-nowrap">
                                        hrs/wk
                                    </div>
                                </div>
                                {weeklyLimit ? <p className="text-xs text-muted-foreground">{weeklyLimit}:00 hours per week</p> : null}

                                <div className="pt-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">This Week</p>
                                        <Button variant="link" size="sm" className="h-auto p-0 text-sm">
                                            Edit limit
                                        </Button>
                                    </div>
                                    <p className="text-lg font-semibold tabular-nums">27:45 <span className="text-muted-foreground font-normal">/ {weeklyLimit}:00</span></p>
                                    <Progress value={(27.75 / Number(weeklyLimit || 1)) * 100} className="h-2 [&>div]:bg-foreground" />
                                    <Button variant="link" size="sm" className="h-auto p-0 text-sm text-foreground">
                                        Remove
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Daily Limit</p>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Set the hours members are allowed to work daily</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        value={dailyLimit}
                                        onChange={(e) => setDailyLimit(e.target.value)}
                                        className="h-11"
                                    />
                                    <div className="h-11 px-4 rounded-xl bg-muted text-muted-foreground flex items-center text-sm whitespace-nowrap">
                                        hrs/day
                                    </div>
                                </div>
                                {dailyLimit ? <p className="text-xs text-muted-foreground">{dailyLimit}:00 hours per day</p> : null}

                                <div className="pt-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Today</p>
                                        <Button variant="link" size="sm" className="h-auto p-0 text-sm">
                                            Edit limit
                                        </Button>
                                    </div>
                                    <p className="text-lg font-semibold tabular-nums">5:33 <span className="text-muted-foreground font-normal">/ {dailyLimit}:00</span></p>
                                    <Progress value={(5.55 / Number(dailyLimit || 1)) * 100} className="h-2 [&>div]:bg-foreground" />
                                    <Button variant="link" size="sm" className="h-auto p-0 text-sm text-foreground">
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>

                {isDirty ? (
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/60">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSaving}
                            onClick={() => {
                                setActiveDays(initialRef.current.activeDays)
                                setWeeklyLimit(initialRef.current.weeklyLimit)
                                setDailyLimit(initialRef.current.dailyLimit)
                                setExpectedWeeklyHours(initialRef.current.expectedWeeklyHours)
                                toast.message("Changes reset")
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            disabled={isSaving}
                            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                            onClick={async () => {
                                setIsSaving(true)
                                try {
                                    // Backend update not wired yet.
                                    initialRef.current = {
                                        activeDays,
                                        weeklyLimit,
                                        dailyLimit,
                                        expectedWeeklyHours,
                                    }
                                    toast.success("Work limits saved")
                                } finally {
                                    setIsSaving(false)
                                }
                            }}
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                ) : null}
            </Card>

            <Card className="border border-border/60 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        Required Breaks
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Configure mandatory break periods for <span className="font-medium text-foreground">{member?.user?.name}</span></p>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Require Breaks</p>
                        <p className="text-sm text-muted-foreground">Enforce scheduled break times for this team member</p>
                    </div>
                    <Switch checked={requireBreaks} onCheckedChange={setRequireBreaks} />
                </CardContent>
            </Card>
        </div>
    )
}
