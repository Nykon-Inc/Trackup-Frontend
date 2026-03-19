"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    minDate?: Date
    maxDate?: Date
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
    minDate,
    maxDate,
}: DatePickerWithRangeProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 flex flex-col" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        disabled={(date) => {
                            if (minDate && date < minDate) return true
                            if (maxDate && date > maxDate) return true
                            return false
                        }}
                    />
                    <div className="p-3 border-t border-border flex justify-end">
                        <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] h-8 px-4 rounded-lg"
                            onClick={() => setOpen(false)}
                        >
                            Done
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
