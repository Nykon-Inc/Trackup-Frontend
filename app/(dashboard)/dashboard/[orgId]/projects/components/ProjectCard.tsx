"use client"

import { Project } from "@/interfaces/projects.interfaces";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Clock, DollarSign, Users, BarChart3, LayoutDashboard } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectCardProps {
    project: Project;
    onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const isAnalytics = !!project.hubstaffProjectId;
    const members = project.members || [];
    const membersCount = project.membersCount || members.length || 0;
    const totalHours = project.totalHours || 0;
    const totalSpent = project.totalSpent || 0;

    return (
        <Card
            className="group hover:shadow-0 transition-all duration-200 cursor-pointer border-slate-200/60 rounded-2xl overflow-hidden p-1 gap-0"
            onClick={onClick}
        >
            <CardContent className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className={cn(
                                        "p-1.5 rounded-lg shrink-0",
                                        isAnalytics ? "bg-amber-50 text-amber-600" : "bg-primary/5 text-primary"
                                    )}>
                                        {isAnalytics ? <BarChart3 className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-[10px] font-medium">{isAnalytics ? "Analytics Project" : "Trackup Project"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 leading-none">
                            {project.name}
                        </h3>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Project</DropdownMenuItem>
                            <DropdownMenuItem>Archive Project</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete Project</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <p className="text-slate-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
                    {project.description || "No description provided for this project."}
                </p>

                <div className="flex items-center gap-3 mt-2">
                    <div className="flex -space-x-2 overflow-hidden">
                        {members.slice(0, 3).map((member, i) => (
                            <Avatar key={i} className="h-8 w-8 border-2 border-white ring-0">
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${member.email}`} />
                                <AvatarFallback className="text-[10px] bg-slate-100">
                                    {member.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {membersCount > 3 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-50 text-[10px] font-medium text-slate-500">
                                +{membersCount - 3}
                            </div>
                        )}
                        {membersCount === 0 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
                                <Users className="h-3.5 w-3.5" />
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-medium text-slate-500">
                        {membersCount} {membersCount === 1 ? 'member' : 'members'}
                    </span>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900">{totalHours}h</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Hours</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 font-semibold">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900">${totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Spent</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
