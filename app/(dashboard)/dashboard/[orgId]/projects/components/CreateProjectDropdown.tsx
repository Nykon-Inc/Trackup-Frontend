"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown, Activity, BarChart3 } from "lucide-react";
import { CreateTrackupProjectModal } from "./CreateTrackupProjectModal";
import { CreateAnalyticsProjectModal } from "./CreateAnalyticsProjectModal";

export function CreateProjectDropdown() {
    const [trackupModalOpen, setTrackupModalOpen] = useState(false);
    const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);

    return (
        <div className="flex items-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="gap-2 px-4 shadow-sm">
                        <Plus className="h-4 w-4" />
                        <span>Create Project</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[240px]">
                    <DropdownMenuItem
                        onClick={() => setTrackupModalOpen(true)}
                        className="gap-3 py-3 cursor-pointer"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Activity className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-medium">Create Trackup project</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">Track time and activity</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setAnalyticsModalOpen(true)}
                        className="gap-3 py-3 cursor-pointer"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                            <BarChart3 className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-medium">Create Analytics Project</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">Data analysis and insights</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateTrackupProjectModal
                open={trackupModalOpen}
                onOpenChange={setTrackupModalOpen}
            />
            <CreateAnalyticsProjectModal
                open={analyticsModalOpen}
                onOpenChange={setAnalyticsModalOpen}
            />
        </div>
    );
}
