"use client";

import * as React from "react";
import { ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardWidgetsControl({
    widgets,
    visibleWidgets,
    onToggle,
}: DashboardWidgetsControlProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 ml-auto">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Customize View
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px]">
                <DropdownMenuLabel>Dashboard Widgets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[50vh] overflow-y-auto overflow-x-hidden">
                    {widgets.map((widget, index) => {
                        const isNewGroup = index === 0 || widget.group !== widgets[index - 1].group;
                        return (
                            <React.Fragment key={widget.id}>
                                {isNewGroup && widget.group && (
                                    <>
                                        {index !== 0 && <DropdownMenuSeparator />}
                                        <DropdownMenuLabel className="text-xs text-muted-foreground py-1.5 bg-muted/30">
                                            {widget.group}
                                        </DropdownMenuLabel>
                                    </>
                                )}
                                <DropdownMenuCheckboxItem
                                    className="cursor-pointer text-sm"
                                    checked={visibleWidgets.includes(widget.id)}
                                    onCheckedChange={(checked) => onToggle(widget.id, checked)}
                                >
                                    {widget.label}
                                </DropdownMenuCheckboxItem>
                            </React.Fragment>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface Widget {
    id: string;
    label: string;
    group?: string;
}

interface DashboardWidgetsControlProps {
    widgets: Widget[];
    visibleWidgets: string[];
    onToggle: (id: string, checked: boolean) => void;
}
