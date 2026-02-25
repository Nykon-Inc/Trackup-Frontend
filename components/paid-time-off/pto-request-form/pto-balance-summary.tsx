import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BalanceSummaryProps {
    totalHours: number;
    usedHours: number;
    selectedHours: number;
}

export function BalanceSummary({ totalHours, usedHours, selectedHours }: BalanceSummaryProps) {
    const remainingHours = totalHours - usedHours - selectedHours;
    const isOverBalance = remainingHours < 0;
    const usedPercent = Math.min((usedHours / totalHours) * 100, 100);
    const requestPercent = Math.min((selectedHours / totalHours) * 100, 100);

    return (
        <div className={cn("rounded-md border p-4 space-y-3", isOverBalance && "border-red-300")}>
            <p className="text-sm font-medium">Balance Summary</p>

            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full flex">
                    <div
                        className="bg-primary/60 transition-all duration-300"
                        style={{ width: `${usedPercent}%` }}
                    />
                    <div
                        className={cn("transition-all duration-300", isOverBalance ? "bg-red-500" : "bg-primary")}
                        style={{ width: `${requestPercent}%` }}
                    />
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Balance</span>
                    <span className="font-medium">{totalHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Used</span>
                    <span className="font-medium">{usedHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">This Request</span>
                    <Badge variant={isOverBalance ? "destructive" : "secondary"}>
                        {selectedHours}h
                    </Badge>
                </div>
                <div className="border-t pt-2 flex items-center justify-between font-medium">
                    <span>Remaining</span>
                    <span className={cn(isOverBalance ? "text-red-500" : "text-green-600")}>
                        {remainingHours}h
                    </span>
                </div>
            </div>

            {isOverBalance && (
                <p className="text-xs text-red-500 font-medium">
                    Exceeds balance by {Math.abs(remainingHours)}h.
                </p>
            )}
        </div>
    );
}