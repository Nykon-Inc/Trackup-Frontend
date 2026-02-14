import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TodayActivityTableProps {
    isLoading?: boolean;
}

const mockActivity = [
    { id: 1, name: "Alice Johnson", project: "Web App Redesign", status: "online", time: "4h 20m", lastActive: "Just now" },
    { id: 2, name: "Bob Smith", project: "Mobile App API", status: "idle", time: "3h 10m", lastActive: "15m ago" },
    { id: 3, name: "Charlie Davis", project: "Marketing Site", status: "offline", time: "1h 45m", lastActive: "2h ago" },
    { id: 4, name: "Diana Prince", project: "Internal Dashboard", status: "online", time: "5h 05m", lastActive: "Just now" },
    { id: 5, name: "Evan Wright", project: "Web App Redesign", status: "online", time: "2h 30m", lastActive: "Just now" },
];

export function TodayActivityTable({ isLoading }: TodayActivityTableProps) {
    if (isLoading) {
        return <Skeleton className="h-[350px] w-full" />;
    }

    return (
        <Card className="rounded-md p-1 gap-2">
            <CardHeader className="p-4 py-3 border-b">
                <CardTitle className="text-sm font-semibold">Today's Activity</CardTitle>
                <CardDescription className="text-xs">Team overview</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b h-8 hover:bg-transparent">
                            <TableHead className="h-8 text-[11px] font-medium uppercase w-[30%]">Staff</TableHead>
                            <TableHead className="h-8 text-[11px] font-medium uppercase w-[25%]">Project</TableHead>
                            <TableHead className="h-8 text-[11px] font-medium uppercase w-[15%]">Status</TableHead>
                            <TableHead className="h-8 text-[11px] font-medium uppercase w-[15%]">Time</TableHead>
                            <TableHead className="h-8 text-[11px] font-medium uppercase text-right w-[15%]">Last Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockActivity.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                                    No activity recorded today.
                                </TableCell>
                            </TableRow>
                        ) : (
                            mockActivity.map((user) => (
                                <TableRow key={user.id} className="h-10 border-b last:border-0 hover:bg-muted/30">
                                    <TableCell className="py-1">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-5 w-5 rounded-full">
                                                <AvatarImage src="" />
                                                <AvatarFallback className="text-[9px]">{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-xs">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-1 text-xs text-muted-foreground truncate max-w-[120px]" title={user.project}>
                                        {user.project}
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <div className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${user.status === "online" ? "bg-green-50 text-green-700 ring-green-600/20" :
                                            user.status === "idle" ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20" :
                                                "bg-gray-50 text-gray-600 ring-gray-500/10"
                                            }`}>
                                            {user.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-1 text-xs font-medium">{user.time}</TableCell>
                                    <TableCell className="py-1 text-xs text-right text-muted-foreground">{user.lastActive}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
