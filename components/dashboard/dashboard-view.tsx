"use client";

import React from "react";
import { useWorkspace } from "../providers/workspace-provider";
import { MemberWidgets, MEMBER_WIDGET_CONFIG } from "./member-widgets";
import { OwnerWidgets, OWNER_WIDGET_CONFIG } from "./owner-widgets";
import { DashboardWidgetsControl } from "./dashboard-widgets-control";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/stores/dashboard.store";
import { useGetDashboardOverview } from "@/services/dashboard.services";

export default function DashboardView() {
    const { activeOrg, isLoading: isWorkspaceLoading } = useWorkspace();

    const {
        visibleMemberWidgets,
        toggleMemberWidget,
        visibleOwnerWidgets,
        toggleOwnerWidget
    } = useDashboardStore();

    const role = activeOrg?.role || 'member';
    const organizationId = activeOrg?.organizationId || '';

    const { data: dashboardData, isLoading: isDashboardLoading, error } = useGetDashboardOverview(
        organizationId,
        role as 'member' | 'owner' | 'manager'
    );

    if (isWorkspaceLoading || isDashboardLoading) {
        return <DashboardSkeleton />;
    }

    if (!activeOrg) {
        return <div>No organization selected</div>;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-600">Error loading dashboard</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        {error instanceof Error ? error.message : 'Failed to load dashboard data'}
                    </p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return <DashboardSkeleton />;
    }

    const isOwner = role === "owner";
    const isManager = role === "manager";
    const isMember = !isOwner && !isManager;

    if (isMember && dashboardData.role === 'member') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">My Dashboard</h2>
                        <p className="text-muted-foreground text-sm">Welcome back, here's your daily overview.</p>
                    </div>
                    <DashboardWidgetsControl
                        widgets={MEMBER_WIDGET_CONFIG}
                        visibleWidgets={visibleMemberWidgets}
                        onToggle={toggleMemberWidget}
                    />
                </div>
                <MemberWidgets
                    data={dashboardData}
                    visibleWidgets={visibleMemberWidgets}
                    onVisibilityChange={toggleMemberWidget}
                />
            </div>
        );
    }

    // Owner and Manager View
    if ((isOwner || isManager) && (dashboardData.role === 'owner' || dashboardData.role === 'manager')) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Overview</h2>
                        <p className="text-muted-foreground text-sm">Welcome back to Trackup.</p>
                    </div>
                    <DashboardWidgetsControl
                        widgets={OWNER_WIDGET_CONFIG}
                        visibleWidgets={visibleOwnerWidgets}
                        onToggle={toggleOwnerWidget}
                    />
                </div>

                <OwnerWidgets
                    data={dashboardData}
                    visibleWidgets={visibleOwnerWidgets}
                    onVisibilityChange={toggleOwnerWidget}
                />
            </div>
        );
    }

    return <DashboardSkeleton />;
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <div className="grid gap-6 md:grid-cols-7">
                <Skeleton className="col-span-4 h-[400px] w-full" />
                <div className="col-span-3 space-y-6">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        </div>
    );
}
