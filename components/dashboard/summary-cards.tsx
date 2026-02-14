import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
    isLoading?: boolean;
}

export function SummaryCards({ isLoading }: SummaryCardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-3 md:grid-cols-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <div className="grid gap-3 md:grid-cols-3">
            <Card className="rounded-md p-1 gap-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Staff</CardTitle>
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-xl font-bold">12</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">working on projects</p>
                </CardContent>
            </Card>
            <Card className="rounded-md p-1 gap-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tracked Hours</CardTitle>
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-xl font-bold">48.5h</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">today across projects</p>
                </CardContent>
            </Card>
            <Card className="rounded-md p-1 gap-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Online Now</CardTitle>
                    <Activity className="h-3.5 w-3.5 text-green-500" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-xl font-bold">8</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">active users</p>
                </CardContent>
            </Card>
        </div>
    );
}
