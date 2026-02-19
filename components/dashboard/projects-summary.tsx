import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectsSummaryProps {
    isLoading?: boolean;
}

const mockProjects = [
    { id: 1, name: "Web App Redesign", activeStaff: 3, hoursToday: 12.5, totalHours: 150 },
    { id: 2, name: "Mobile App API", activeStaff: 2, hoursToday: 8.2, totalHours: 80 },
    { id: 3, name: "Marketing Site", activeStaff: 0, hoursToday: 0, totalHours: 45 },
    { id: 4, name: "Internal Dashboard", activeStaff: 1, hoursToday: 5.1, totalHours: 200 },
];

export function ProjectsSummary({ isLoading }: ProjectsSummaryProps) {
    if (isLoading) {
        return <Skeleton className="h-[250px] w-full" />;
    }

    return (
        <Card className="h-full border border-border shadow-sm rounded-md p-1 gap-2">
            <CardHeader className="p-4 py-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Active Projects</CardTitle>
                <CardDescription className="text-xs">Top activity today</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {mockProjects.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                        No active projects.
                    </div>
                ) : (
                    mockProjects.map((project) => (
                        <div key={project.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <div className="font-medium truncate max-w-[150px]" title={project.name}>{project.name}</div>
                                <div className="text-muted-foreground">{project.hoursToday}h</div>
                            </div>
                            <Progress value={(project.hoursToday / 20) * 100} className="h-1.5 bg-secondary/50" />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>{project.activeStaff} staff active</span>
                                <span>Total: {project.totalHours}h</span>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
