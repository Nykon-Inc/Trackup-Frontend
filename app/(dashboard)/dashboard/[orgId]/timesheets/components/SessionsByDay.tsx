"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Table, { TableColumn } from "@/components/ui/data-table";
import { format, parseISO } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Screenshot {
    id: string;
    url: string;
    timestamp: string;
    takenAt: string;
}

interface Session {
    id: string;
    project: string;
    isManual?: boolean;
    hasManualTime?: boolean;
    sourceLabel?: string;
    startTime: string;
    endTime: string | null;
    durationSeconds: number;
    durationFormatted: string;
    idleSeconds: number;
    activityRate: number;
    keyboardEvents: number;
    mouseEvents: number;
    screenshots: Screenshot[];
    screenshotCount: number;
}

interface SessionsData {
    timesheetId: string;
    startDate: string;
    endDate: string;
    sessions: Session[];
    totalSessions: number;
}

interface SessionsByDayProps {
    data: SessionsData | null;
    isLoading: boolean;
}

export const SessionsByDay: React.FC<SessionsByDayProps> = ({ data, isLoading }) => {
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);

    const handleScreenshotClick = (session: Session) => {
        setSelectedSession(session);
        setCurrentScreenshotIndex(0);
    };

    const handlePrevScreenshot = () => {
        if (selectedSession && currentScreenshotIndex > 0) {
            setCurrentScreenshotIndex(currentScreenshotIndex - 1);
        }
    };

    const handleNextScreenshot = () => {
        if (selectedSession && currentScreenshotIndex < selectedSession.screenshots.length - 1) {
            setCurrentScreenshotIndex(currentScreenshotIndex + 1);
        }
    };
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Activity Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Loading session data...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || !data.sessions || data.sessions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Activity Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No sessions found for this timesheet period</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Group sessions by day
    const sessionsByDay = new Map<string, Session[]>();
    data.sessions.forEach((session) => {
        const date = format(parseISO(session.startTime), "yyyy-MM-dd");
        if (!sessionsByDay.has(date)) {
            sessionsByDay.set(date, []);
        }
        sessionsByDay.get(date)!.push(session);
    });

    // Sort dates in descending order
    const sortedDates = Array.from(sessionsByDay.keys()).sort().reverse();

    const columns: TableColumn<Session>[] = [
        {
            key: "project",
            header: "Project",
            render: (value) => {
                // value is a project object with a 'name' property
                const isProjectObject = typeof value === "object" && value !== null;
                const projectName = isProjectObject && "name" in value
                    ? String((value as { name?: string }).name || "-")
                    : (typeof value === "string" ? value : "-");
                const projectType = isProjectObject && "projectType" in value
                    ? String((value as { projectType?: string }).projectType || "-")
                    : "-";
                return (
                    <div className="flex flex-col">
                        <span>{projectName}</span>
                        <span className="text-sm text-muted-foreground">{projectType}</span>
                    </div>
                );
            },
        },
        {
            key: "activityRate",
            header: "Activity",
            render: (value) => {
                const rateNum = typeof value === "number" ? value : Number(String(value).replace("%", ""));
                const safeRate = Number.isFinite(rateNum) ? Math.max(0, Math.min(100, rateNum)) : 0;
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${safeRate}%` }}
                            ></div>
                        </div>
                        <span className="text-sm">{safeRate}%</span>
                    </div>
                );
            },
        },
        {
            key: "idleSeconds",
            header: "Idle",
            render: (value) => {
                const seconds = value as number;
                const hours = Math.floor(seconds / 3600);
                const mins = Math.floor((seconds % 3600) / 60);
                return <span>{`${hours}h ${mins}m`}</span>;
            },
        },
        {
            key: "isManual",
            header: "Manual",
            render: (value, row) => <span>{(value || row.hasManualTime) ? "Yes" : "No"}</span>,
        },
        {
            key: "durationFormatted",
            header: "Duration",
            render: (value) => <span>{value}</span>,
        },
        {
            key: "sourceLabel",
            header: "Source",
            render: (value, row) => <span>{(value as string) || (row.isManual ? "Manually Added Time" : "Tracked Time")}</span>,
        },
        {
            key: "startTime",
            header: "Time",
            render: (value) => {
                const time = format(parseISO(value as string), "HH:mm:ss");
                return <span>{time}</span>;
            },
        },
        {
            key: "screenshotCount",
            header: "Screenshots",
            render: (value, row) => (
                <button
                    onClick={() => !row.isManual && handleScreenshotClick(row)}
                    className={row.isManual ? "cursor-not-allowed opacity-60" : "hover:underline cursor-pointer"}
                    disabled={!!row.isManual}
                >
                    <Badge variant="outline">{row.isManual ? "Manual" : value}</Badge>
                </button>
            ),
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Sessions</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                    Total Sessions: {data.totalSessions}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {sortedDates.map((date) => {
                    const dayLabel = format(parseISO(date), "EEEE, MMMM d, yyyy");
                    const daySessions = sessionsByDay.get(date) || [];

                    return (
                        <div key={date} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base">{dayLabel}</h3>
                                <Badge variant="secondary">{daySessions.length} sessions</Badge>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <Table
                                    data={daySessions}
                                    columns={columns}
                                    rowKey={(row, index) => row.id ? `${date}-${row.id}` : `${date}-${index}`}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>

            {/* Screenshots Modal */}
            <Dialog open={!!selectedSession} onOpenChange={(open) => {
                if (!open) {
                    setSelectedSession(null);
                }
            }}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                        <DialogTitle>
                            Screenshots - {selectedSession?.project && typeof selectedSession.project === "object" && "name" in selectedSession.project
                                ? String((selectedSession.project as { name?: string }).name || "Session")
                                : "Session"}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedSession?.isManual ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Manually Added Time</p>
                            <p className="text-xs mt-1">No screenshots are available for manual sessions.</p>
                        </div>
                    ) : selectedSession && selectedSession.screenshots.length > 0 ? (
                        <div className="space-y-4">
                            {/* Image Viewer */}
                            <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-96">
                                <img
                                    src={selectedSession.screenshots[currentScreenshotIndex].url}
                                    alt={`Screenshot ${currentScreenshotIndex + 1}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevScreenshot}
                                    disabled={currentScreenshotIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Previous
                                </Button>

                                <div className="text-sm text-muted-foreground">
                                    {currentScreenshotIndex + 1} / {selectedSession.screenshots.length}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextScreenshot}
                                    disabled={currentScreenshotIndex === selectedSession.screenshots.length - 1}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>

                            {/* Screenshot Timestamp */}
                            <div className="text-sm text-muted-foreground text-center">
                                {format(parseISO(selectedSession.screenshots[currentScreenshotIndex].takenAt), "PPP p")}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No screenshots available for this session</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};
