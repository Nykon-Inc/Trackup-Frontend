"use client"

import { Project } from "@/interfaces/projects.interfaces";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Clock, DollarSign, Users, BarChart3, LayoutDashboard } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { EditProjectModal } from "./EditProjectModal";
import { useDeleteProject, useUpdateProject } from "@/services/projects.services";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { ProjectStatus } from "@/interfaces/projects.interfaces";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

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

    const { activeOrgId } = useWorkspace();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const updateProjectMutation = useUpdateProject();
    const deleteProjectMutation = useDeleteProject();

    const handleArchive = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!activeOrgId) return;

        const newStatus = project.status === ProjectStatus.ARCHIVED ? ProjectStatus.ACTIVE : ProjectStatus.ARCHIVED;

        try {
            await updateProjectMutation.mutateAsync({
                organizationId: activeOrgId,
                projectId: project.id,
                status: newStatus,
            });
            toast.success(`Project ${newStatus === ProjectStatus.ARCHIVED ? 'archived' : 'unarchived'} successfully`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to ${newStatus === ProjectStatus.ARCHIVED ? 'archive' : 'unarchive'} project`);
        }
    };

    const handleDelete = async () => {
        if (!activeOrgId) return;

        try {
            await deleteProjectMutation.mutateAsync({
                organizationId: activeOrgId,
                projectId: project.id,
            });
            toast.success("Project deleted successfully");
            setDeleteConfirmOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete project");
        }
    };

    return (
        <>
            <Card
                className="group hover:shadow-0 transition-all duration-200 cursor-pointer border-slate-200/60 rounded-xl overflow-hidden p-0 gap-0"
                onClick={onClick}
            >
                <CardContent className="p-3.5">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={cn(
                                            "p-1 rounded-md shrink-0",
                                            isAnalytics ? "bg-amber-50 text-amber-600" : "bg-primary/5 text-primary"
                                        )}>
                                            {isAnalytics ? <BarChart3 className="h-3.5 w-3.5" /> : <LayoutDashboard className="h-3.5 w-3.5" />}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-[10px] font-medium">{isAnalytics ? "Analytics Project" : "Watchtower Project"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1 leading-none">
                                {project.name}
                            </h3>
                        </div>
                        <div onClick={(e) => {
                            e.stopPropagation()
                        }}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 text-slate-400">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {project.projectType !== "analytics" && (
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}>
                                            Edit Project
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={handleArchive}>
                                        {project.status === ProjectStatus.ARCHIVED ? 'Unarchive Project' : 'Archive Project'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive font-medium"
                                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmOpen(true); }}
                                    >
                                        Delete Project
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed">
                        {project.description || "No description provided for this project."}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-1.5 overflow-hidden">
                            {members.slice(0, 3).map((member, i) => (
                                <Avatar key={i} className="h-6 w-6 border border-white ring-0">
                                    <AvatarImage src={`https://i.pravatar.cc/150?u=${member.email}`} />
                                    <AvatarFallback className="text-[9px] bg-slate-100">
                                        {member.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {membersCount > 3 && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-slate-50 text-[9px] font-medium text-slate-500">
                                    +{membersCount - 3}
                                </div>
                            )}
                            {membersCount === 0 && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
                                    <Users className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">
                            {membersCount} {membersCount === 1 ? 'member' : 'members'}
                        </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{totalHours}h</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Hours</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                <DollarSign className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">${totalSpent.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Spent</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <EditProjectModal
                project={project}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription className="pt-2">
                            This action cannot be undone. This will permanently delete the
                            <span className="font-bold text-slate-900 mx-1">"{project.name}"</span>
                            project and remove all its data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setDeleteConfirmOpen(false); }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(); }}
                        >
                            Delete Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
