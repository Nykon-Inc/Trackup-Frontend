"use client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, Activity, DollarSign } from "lucide-react";

import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useGetHubstaffAuthUrl, useGetHubstaffProjects } from "@/services/organization.services";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useWorkspace } from "@/components/providers/workspace-provider";

export default function DashboardPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const { activeOrg } = useWorkspace();

    const { mutate: getHubstaffUrl, isPending: isGettingUrl } = useGetHubstaffAuthUrl();
    // const { data: projects } = useGetHubstaffProjects(orgId);
    const handleConnectHubstaff = () => {
        getHubstaffUrl(orgId, {
            onSuccess: (data) => {
                window.location.href = data.url;
            },
            onError: () => {
                toast.error("Failed to get Hubstaff authorization URL");
            }
        });
    };

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Overview"
                breadcrumbs={[
                    { label: "Dashboard", href: `/${params?.orgId}`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                    <p className="text-muted-foreground">Welcome back to Trackup.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">128</div>
                            <p className="text-xs text-muted-foreground">+12% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                            <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-muted-foreground">+2 active now</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hours Tracked</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">573h</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$45,231.89</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="border rounded-lg p-6 flex flex-col items-start gap-4">
                    <div>
                        <h3 className="text-lg font-semibold">Hubstaff Integration</h3>
                        <p className="text-sm text-muted-foreground">Connect your organization to Hubstaff to sync time entries and activity.</p>
                    </div>
                    {activeOrg?.organization.isHubstaffConnected ? (
                        <Button variant="outline" disabled className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                            Hubstaff Connected
                        </Button>
                    ) : (
                        <Button onClick={handleConnectHubstaff} disabled={isGettingUrl}>
                            Connect Hubstaff {isGettingUrl && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
