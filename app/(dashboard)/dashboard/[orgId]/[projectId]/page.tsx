
"use client";

import React from "react";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, UserPlus, Trash2 } from "lucide-react";
import { useGetAggregatedSessions } from "@/services/sessions.services";
import { useAuthStore } from "@/stores/auth.store";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function ProjectDashboardPage() {
    const { activeOrg, activeProject } = useWorkspace();
    const { account } = useAuthStore();

    // Example: Fetch stats for current month
    const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");

    const { data: statsData, isLoading } = useGetAggregatedSessions({
        userId: account?.id || "",
        projectId: activeProject?.id || "",
        startDate,
        endDate,
    });

    // Mock calculations if statsData is list of sessions
    // Assuming API returns stats or we calculate them. 
    // Simplify for now:
    const totalHours = "120h"; // Placeholder or derived from statsData
    const activityPercent = "85%"; // Placeholder

    return (
        <div className="flex flex-col h-full w-full">

            <div className="p-4 lg:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                        <p className="text-muted-foreground">{activeProject?.name} Overview</p>
                    </div>
                    <div className="flex gap-2">
                        <PermissionGate role={["ADMIN", "MANAGER"]}>
                            <Button variant="outline">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Invite Member
                            </Button>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Session
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Activity</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activityPercent}</div>
                            <p className="text-xs text-muted-foreground">Average performance</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHours}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
