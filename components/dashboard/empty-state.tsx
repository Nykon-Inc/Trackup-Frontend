import React from "react";
import { LucideIcon, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon = HelpCircle,
    title,
    description,
    actionLabel,
    onAction,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
            <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Icon className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
            {description && (
                <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-6 h-8 text-xs font-medium"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
