import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DateTime } from 'luxon';

interface DayEntry {
    date: string;
    hours: number;
    isWeekend: boolean;
    isHoliday: boolean;
}

interface DailyBreakdownProps {
    days: DayEntry[];
    excludeWeekends: boolean;
    excludeHolidays: boolean;
    totalSelectedHours: number;
    onHoursChange: (index: number, hours: number) => void;
}

export function DailyBreakdown({ days, excludeWeekends, excludeHolidays, totalSelectedHours, onHoursChange }: DailyBreakdownProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="rounded-md border max-h-60 overflow-y-auto">
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
                <span>
                    Daily Breakdown
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {days.filter(d => d.hours > 0).length} day(s) · {totalSelectedHours}h
                    </span>
                </span>
                {isOpen
                    ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                }
            </button>

            {isOpen && (
                <div className="divide-y border-t">
                    {days.map((day, index) => {
                        const isDisabled = (day.isWeekend && excludeWeekends) || (day.isHoliday && excludeHolidays);

                        return (
                            <div
                                key={day.date}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 text-sm",
                                    isDisabled && "opacity-50 bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-medium w-28">
                                        {DateTime.fromISO(day.date).toFormat('EEE, MMM d')}
                                    </span>
                                    <div className="flex gap-1">
                                        {day.isWeekend && <Badge variant="outline" className="text-xs">Weekend</Badge>}
                                        {day.isHoliday && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Holiday</Badge>}
                                    </div>
                                </div>

                                {!isDisabled && (
                                    <div className="flex items-center gap-3">

                                        <Input
                                            type="number"
                                            min={0}
                                            step={0.5}
                                            value={day.hours}
                                            onChange={(e) => onHoursChange(index, parseFloat(e.target.value) || 0)}
                                            className="w-20 h-8 text-sm"
                                            placeholder="Hours"
                                        />

                                        <span className="text-muted-foreground w-16 text-right">
                                            {`${day.hours}h`}
                                        </span>
                                    </div>
                                )}

                                {isDisabled && (
                                    <span className="text-muted-foreground text-xs">0h — excluded</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}