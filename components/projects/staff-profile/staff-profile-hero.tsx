"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FolderKanban, Pencil } from "lucide-react"

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

export function StaffProfileHero({
    staffName,
    staffRole,
    staffAvatar,
    projectName,
    onBack,
    onEditInfo,
    onManageProjects,
    onExport,
}: {
    staffName: string
    staffRole: string
    staffAvatar?: string
    projectName?: string
    onBack: () => void
    onEditInfo?: () => void
    onManageProjects?: () => void
    onExport?: () => void
}) {
    return (
        <div className="px-6 pt-4 pb-2">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={staffAvatar} alt={staffName} />
                        <AvatarFallback className="text-sm font-semibold">{getInitials(staffName)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold leading-tight truncate">{staffName}</h2>
                        <p className="text-sm text-muted-foreground capitalize truncate">{staffRole}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs gap-1.5"
                        onClick={onEditInfo}
                        disabled={!onEditInfo}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Info
                    </Button>
                    {/* <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs gap-1.5"
                        onClick={onManageProjects}
                        disabled={!onManageProjects}
                    >
                        <FolderKanban className="h-3.5 w-3.5" />
                        Manage Projects
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs gap-1.5"
                        onClick={onExport}
                        disabled={!onExport}
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export
                    </Button> */}
                </div>
            </div>

            {projectName ? (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="rounded-full bg-muted text-foreground">
                        {projectName}
                    </Badge>
                </div>
            ) : null}
        </div>
    )
}
