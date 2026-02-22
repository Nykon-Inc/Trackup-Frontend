"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { ITimesheet } from "@/interfaces/timesheet.interfaces";
import { useSubmitTimesheet, useFetchTimesheetSessions } from "@/services/timesheets";
import { toast } from "sonner";
import { SubmitTimesheetModal } from "../../components/SubmitTimesheetModal";
import { SessionsByDay } from "../../components/SessionsByDay";

export default function TimesheetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const submitTimesheetMutation = useSubmitTimesheet();
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [timesheetData, setTimesheetData] = useState<ITimesheet | null>(null);

    // Load timesheet data from sessionStorage after hydration
    useEffect(() => {
        if (typeof window !== "undefined") {
            const data = sessionStorage.getItem("timesheetData");
            try {
                if (data) {
                    setTimesheetData(JSON.parse(data));
                }
            } catch (error) {
                console.error("Failed to parse timesheet data:", error);
            }
        }
    }, []);

    // Fetch sessions data - use the route ID which is the timesheet ID
    const timesheetId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const { data: sessionsData, isLoading: sessionsLoading } = useFetchTimesheetSessions(
        timesheetId as string | undefined
    );

    const handleSubmitClick = () => {
        setSubmitModalOpen(true);
    };

    const handleConfirmSubmit = async () => {
        if (timesheetData && "id" in timesheetData) {
            try {
                await submitTimesheetMutation.mutateAsync((timesheetData as any).id);
                setSubmitModalOpen(false);
                toast.success("Timesheet submitted successfully");
                router.back();
            } catch (error) {
                console.error("Failed to submit timesheet:", error);
                toast.error("Failed to submit timesheet. Please try again.");
            }
        }
    };

    if (!timesheetData) {
        return (
            <div className="flex flex-col h-full min-w-0 p-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="w-fit mb-4"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No timesheet data available</p>
                </div>
            </div>
        );
    }

    const formatDate = (date: Date | string) =>
        new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    return (
        <div className="flex flex-col h-full min-w-0">
            <div className="p-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="w-fit mb-4"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Approvals
                </Button>

                <PageHeader
                    title="Timesheet Details"
                    breadcrumbs={[
                        {
                            label: "Dashboard",
                            href: `/dashboard/${params?.orgId}`,
                            active: false,
                        },
                        {
                            label: "Timesheets",
                            href: `/dashboard/${params?.orgId}/timesheets`,
                            active: false,
                        },
                        {
                            label: "Approvals",
                            href: `/dashboard/${params?.orgId}/timesheets/approvals`,
                            active: false,
                        },
                        {
                            label: "Details",
                            href: `#`,
                            active: true,
                        },
                    ]}
                />
            </div>

            <div className="flex-1 min-w-0 overflow-auto p-4">
                {/* Timesheet Summary Card */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="space-y-4">
                            {/* First Row: Name/Status + Submit Button */}
                            <div className="flex items-center justify-between pb-4 border-b">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <p className="text-lg font-semibold">{timesheetData.user}</p>
                                        <Badge>{timesheetData.status}</Badge>
                                    </div>
                                </div>
                                {timesheetData.status === "open" && (
                                    <Button onClick={handleSubmitClick} className="bg-blue-600 hover:bg-blue-700">
                                        Submit Timesheet
                                    </Button>
                                )}
                            </div>

                            <div className="flex  justify-between">
                                {/* Second Row: Left Column Items in One Line */}
                                <div className="flex flex-wrap gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Hours</p>
                                        <p className="font-medium">{timesheetData.totalWorkedHours}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Worked</p>
                                        <p className="font-medium">{timesheetData.totalWorkedHours}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Regular Hours</p>
                                        <p className="font-medium">{timesheetData.regularHours}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Manual Time</p>
                                        <p className="font-medium">{timesheetData.manualTime || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Activity Level</p>
                                        <p className="font-medium">{timesheetData.activityLevel}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">PTO</p>
                                        <p className="font-medium">-</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Holiday</p>
                                        <p className="font-medium">-</p>
                                    </div>
                                </div>
                                {/* Third Row: Right Column Items in One Line */}
                                <div className="flex flex-wrap gap-8 justify-end">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Submitted On</p>
                                        <p className="font-medium">
                                            {timesheetData.submittedOn
                                                ? formatDate(timesheetData.submittedOn)
                                                : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Approved On</p>
                                        <p className="font-medium">
                                            {timesheetData.approvedOn
                                                ? formatDate(timesheetData.approvedOn)
                                                : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Approved By</p>
                                        <p className="font-medium">{timesheetData.approvedBy || "-"}</p>
                                    </div>
                                </div>
                            </div>




                        </div>
                    </CardContent>
                </Card>

                {/* Activity Sessions Section */}
                <SessionsByDay data={sessionsData} isLoading={sessionsLoading} />
            </div>

            <SubmitTimesheetModal
                open={submitModalOpen}
                onOpenChange={setSubmitModalOpen}
                selectedTimesheet={timesheetData}
                isLoading={submitTimesheetMutation.isPending}
                onConfirm={handleConfirmSubmit}
            />
        </div>
    );
}
