"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { LayoutGrid, FileText, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SettingsPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Settings"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Settings", href: `/dashboard/${params?.orgId}/settings`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Integrations Card */}
                    <Card className="rounded-lg border shadow-sm p-3 h-full flex flex-col">
                        <CardHeader className="p-0 mb-3 flex flex-row items-center gap-2">
                            <div className="bg-foreground p-1.5 rounded-md">
                                <LayoutGrid className="h-4 w-4 text-background" />
                            </div>
                            <CardTitle className="text-sm font-bold text-foreground">Integrations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <ul className="space-y-0.5">
                                <li>
                                    <Link
                                        href={`/dashboard/${params?.orgId}/settings/integrations`}
                                        className="flex items-center p-2 px-3 text-xs text-foreground bg-muted rounded-md font-medium hover:bg-muted/80 transition-colors"
                                    >
                                        All integrations
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/dashboard/${params?.orgId}/settings/integrations/wise`}
                                        className="flex items-center p-2 px-3 text-xs text-muted-foreground rounded-md font-medium hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        Wise
                                    </Link>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Policies Card */}
                    <Card className="rounded-lg border shadow-sm p-3 h-full flex flex-col">
                        <CardHeader className="p-0 mb-3 flex flex-row items-center gap-2">
                            <div className="bg-foreground p-1.5 rounded-md">
                                <FileText className="h-4 w-4 text-background" />
                            </div>
                            <CardTitle className="text-sm font-bold text-foreground">Policies</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <ul className="space-y-0.5">
                                <li>
                                    <Link
                                        href={`/dashboard/${params?.orgId}/settings/policies/time-off`}
                                        className="flex items-center p-2 px-3 text-xs text-muted-foreground rounded-md font-medium hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        Time off
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/dashboard/${params?.orgId}/settings/policies/work-breaks`}
                                        className="flex items-center p-2 px-3 text-xs text-foreground bg-muted rounded-md font-medium hover:bg-muted/80 transition-colors"
                                    >
                                        Work breaks
                                    </Link>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Insights Card */}
                    <Card className="rounded-lg border shadow-sm p-3 h-full flex flex-col">
                        <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-foreground p-1.5 rounded-md">
                                    <Lightbulb className="h-4 w-4 text-background" />
                                </div>
                                <CardTitle className="text-sm font-bold text-foreground">Insights</CardTitle>
                            </div>
                            <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted border-none rounded-full px-2 py-0.5 text-[10px] font-medium italic">Add-on</Badge>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col items-center justify-center">
                            <Link
                                href={`/dashboard/${params?.orgId}/settings/insights/classifications`}
                                className="text-muted-foreground font-normal text-xs mb-4 hover:text-foreground text-center"
                            >
                                Apps/URLs classifications
                            </Link>
                            <Button size="sm" className="bg-foreground hover:bg-foreground/90 text-background rounded-md px-4 py-2 h-auto text-xs font-medium w-full">
                                Preview add-on
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
