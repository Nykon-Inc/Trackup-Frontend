"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lightbulb, Lock, UserCog } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/components/providers/workspace-provider"

interface AIInsightsOverlayProps {
    orgId: string
    className?: string
}

export function AIInsightsOverlay({ orgId, className }: AIInsightsOverlayProps) {
    const { activeOrg } = useWorkspace()
    const isOwner = activeOrg?.role === "owner"

    return (
        <div className={cn("absolute inset-0 z-100 flex items-start justify-center p-4", className)}>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-xl" />
            <div className="max-w-md mt-20 w-full bg-white border border-border shadow-2xl rounded-xl py-10 px-7 text-center animate-in fade-in zoom-in duration-500 relative z-10">
                <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                    {isOwner ? <Lightbulb className="h-10 w-10 text-primary" /> : <Lock className="h-10 w-10 text-primary" />}
                </div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 mb-3">
                    {isOwner ? "Enable AI Insights" : "Insights Restricted"}
                </h2>
                <p className="text-neutral-500 mb-8 leading-relaxed text-balance text-sm">
                    {isOwner
                        ? "To unlock powerful AI-driven analytics and productivity trends, you need to enable the Insights setting in your organization settings."
                        : "Powerful AI-driven analytics are currently disabled for this organization. Please contact your organization owner to enable this feature."
                    }
                </p>
                <div className="flex flex-col gap-3">
                    {isOwner ? (
                        <Button asChild size="lg" className="w-full font-bold shadow-lg shadow-primary/20">
                            <Link href={`/dashboard/${orgId}/settings`}>
                                Go to Settings
                            </Link>
                        </Button>
                    ) : (
                        <div className="p-4 bg-muted rounded-xl flex items-center gap-3 text-left">
                            <UserCog className="h-5 w-5 text-muted-foreground" />
                            <div className="text-xs">
                                <p className="font-bold text-neutral-900 uppercase tracking-wider">Contact Admin</p>
                                <p className="text-neutral-500">Only organization owners can manage this setting.</p>
                            </div>
                        </div>
                    )}
                    <Button asChild variant="ghost" size="sm" className="w-full text-neutral-400 hover:text-neutral-600">
                        <Link href={`/dashboard/${orgId}`}>
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
