"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface CalendarWithTimeProps {
    date: Date | undefined
    startTime: string
    endTime: string
    onChange: (values: { date: Date | undefined; startTime: string; endTime: string }) => void
    children?: React.ReactNode
}

export function CalendarWithTime({
    date: externalDate,
    startTime: externalStartTime,
    endTime: externalEndTime,
    onChange,
    children,
}: CalendarWithTimeProps) {
    const [date, setDate] = React.useState<Date | undefined>(externalDate)
    const [startTime, setStartTime] = React.useState(externalStartTime)
    const [endTime, setEndTime] = React.useState(externalEndTime)
    const [open, setOpen] = React.useState(false)

    // Sync state with props when props change
    React.useEffect(() => {
        setDate(externalDate)
    }, [externalDate])

    React.useEffect(() => {
        setStartTime(externalStartTime)
    }, [externalStartTime])

    React.useEffect(() => {
        setEndTime(externalEndTime)
    }, [externalEndTime])

    const handleDone = () => {
        onChange({ date, startTime, endTime })
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children || (
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                            <span>
                                {format(date, "PPP")} ({startTime} - {endTime})
                            </span>
                        ) : (
                            <span>Pick date and time</span>
                        )}
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex flex-row divide-x" align="start">
                <div className="p-3">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                </div>
                <div className="bg-muted/5 p-4 flex flex-col w-[260px]">
                    <div className="flex-1 space-y-6">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Time Range</h4>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="time-from" className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Start Time</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="time-from"
                                            type="time"
                                            step="1"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <Clock2Icon className="size-3.5 text-muted-foreground" />
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="time-to" className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">End Time</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="time-to"
                                            type="time"
                                            step="1"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <Clock2Icon className="size-3.5 text-muted-foreground" />
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Field>
                            </FieldGroup>
                        </div>
                    </div>
                    <div className="pt-4 mt-auto">
                        <Button className="w-full shadow-sm font-semibold" onClick={handleDone}>
                            Done
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
