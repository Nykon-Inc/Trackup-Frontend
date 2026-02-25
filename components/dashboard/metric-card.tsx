import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical, Info } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MetricCardProps {
    title: string;
    value: string;
    trend?: string;
    trendPositive?: boolean;
    chart?: React.ReactNode;
    onRemove?: () => void;
}

export function MetricCard({ title, value, trend, trendPositive, chart, onRemove }: MetricCardProps) {
    return (
        <Card className="rounded-md border shadow-sm relative overflow-hidden p-0 gap-0">
            <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-1">
                    <CardTitle className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">{title}</CardTitle>
                    <Info className="h-2.5 w-2.5 text-muted-foreground/50" />
                </div>
                <div>
                    {onRemove && <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-transparent">
                                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground cursor-pointer opacity-50 hover:opacity-100" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onRemove} className="text-red-600 focus:text-red-600 cursor-pointer text-xs">
                                Hide Widget
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>}
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-normal text-foreground">{value}</span>
                </div>
                <div className="flex justify-between items-end">
                    {trend && (
                        <div className={`text-[10px] font-medium flex items-center gap-0.5 ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="text-[8px]">{trendPositive ? '▲' : '▼'}</span> {trend}
                        </div>
                    )}
                    <div className="mt-1 h-6 w-full flex items-end justify-end">
                        {chart}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface SparkLineProps {
    data: number[];
    color?: "blue" | "green" | "cyan" | "gray";
}

export function SparkLine({ data, color = "blue" }: SparkLineProps) {
    const getColorClass = (c: string) => {
        switch (c) {
            case "blue": return "bg-blue-400";
            case "green": return "bg-green-400";
            case "cyan": return "bg-cyan-400";
            default: return "bg-gray-400";
        }
    };

    const max = Math.max(...data, 100);

    return (
        <div className="w-24 h-6 ml-auto flex items-end justify-between gap-0.5">
            {data.map((val, i) => (
                <div
                    key={i}
                    className={`w-full rounded-sm opacity-50 ${getColorClass(color)}`}
                    style={{ height: `${(val / max) * 100}%` }}
                />
            ))}
        </div>
    );
}
