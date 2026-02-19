import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PendingActionsProps {
    role: "owner" | "manager" | "member";
    isLoading?: boolean;
}

export function PendingActions({ role, isLoading }: PendingActionsProps) {
    if (isLoading) {
        return <Skeleton className="h-[150px] w-full" />;
    }

    if (role === "member") return null;

    const pendingPTO = 3;
    const pendingInvites = 2;

    return (
        <Card className="rounded-md border border-border shadow-sm p-1 gap-2">
            <CardHeader className="p-3 border-b py-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-50 p-1.5 rounded-full ring-1 ring-orange-200">
                            <ListChecks className="h-3.5 w-3.5 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-xs font-medium">PTO Requests</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{pendingPTO}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                            <span className="sr-only">Review</span>
                            Review
                        </Button>
                    </div>
                </div>

                {role === "owner" && (
                    <div className="flex items-center justify-between p-2 rounded-md border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-50 p-1.5 rounded-full ring-1 ring-blue-200">
                                <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-xs font-medium">Staff Invites</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{pendingInvites}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                                <span className="sr-only">Manage</span>
                                Manage
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
