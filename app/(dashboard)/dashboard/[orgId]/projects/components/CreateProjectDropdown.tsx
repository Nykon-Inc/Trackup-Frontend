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
import { CreateWatchtowerProjectModal } from "./CreateWatchtowerProjectModal";
import { CreateAnalyticsProjectModal } from "./CreateAnalyticsProjectModal";

export function CreateProjectDropdown() {
    const [watchtowerModalOpen, setWatchtowerModalOpen] = useState(false);
    const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);

    return (
        <div className="flex items-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" className="gap-1.5 px-3 shadow-sm h-8 text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Project</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem
                        onClick={() => setWatchtowerModalOpen(true)}
                        className="gap-2.5 py-2 cursor-pointer"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                            <Activity className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col gap-0">
                             <span className="font-medium text-xs">Watchtower project</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">Track time and activity</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setAnalyticsModalOpen(true)}
                        className="gap-2.5 py-2 cursor-pointer"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 shrink-0">
                            <BarChart3 className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col gap-0">
                            <span className="font-medium text-xs">Analytics Project</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">Data analysis and insights</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateWatchtowerProjectModal
                open={watchtowerModalOpen}
                onOpenChange={setWatchtowerModalOpen}
            />
            <CreateAnalyticsProjectModal
                open={analyticsModalOpen}
                onOpenChange={setAnalyticsModalOpen}
            />
        </div>
    );
}
