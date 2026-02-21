"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DatePickerCalendarProps {
    selected?: Date;
    onSelect: (date: Date | undefined) => void;
    placeholder?: string;
    fromYear?: number;
    toYear?: number;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
    error?: boolean;
    classname?: string;
}

type ViewMode = "days" | "months" | "years";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function DatePickerCalendar({
    selected,
    onSelect,
    placeholder = "Pick date",
    fromYear = 1900,
    toYear = new Date().getFullYear() + 10,
    minDate,
    maxDate,
    disabled = false,
    error = false,
    classname,
}: DatePickerCalendarProps) {
    const [open, setOpen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<ViewMode>("days");
    const [currentMonth, setCurrentMonth] = React.useState(selected?.getMonth() ?? new Date().getMonth());
    const [currentYear, setCurrentYear] = React.useState(selected?.getFullYear() ?? new Date().getFullYear());
    const [yearRangeStart, setYearRangeStart] = React.useState(
        Math.floor((selected?.getFullYear() ?? new Date().getFullYear()) / 12) * 12
    );

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        onSelect(newDate);
        setOpen(false);
    };

    const handleMonthClick = (monthIndex: number) => {
        setCurrentMonth(monthIndex);
        setViewMode("days");
    };

    const handleYearClick = (year: number) => {
        setCurrentYear(year);
        setViewMode("months");
    };

    const handlePrevious = () => {
        if (viewMode === "days") {
            const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
            if (minDate && (prevMonthDate.getFullYear() < minDate.getFullYear() || (prevMonthDate.getFullYear() === minDate.getFullYear() && prevMonthDate.getMonth() < minDate.getMonth()))) {
                // Check if there are ANY enabled days in the CURRENT month. 
                // Actually, if we're at the beginning of the allowed range, we just don't go back.
                if (currentYear <= minDate.getFullYear() && currentMonth <= minDate.getMonth()) return;
            }

            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else if (viewMode === "months") {
            if (minDate && currentYear <= minDate.getFullYear()) return;
            setCurrentYear(currentYear - 1);
        } else if (viewMode === "years") {
            if (minDate && yearRangeStart <= minDate.getFullYear()) return;
            setYearRangeStart(yearRangeStart - 12);
        }
    };

    const handleNext = () => {
        if (viewMode === "days") {
            const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
            if (maxDate && (nextMonthDate.getFullYear() > maxDate.getFullYear() || (nextMonthDate.getFullYear() === maxDate.getFullYear() && nextMonthDate.getMonth() > maxDate.getMonth()))) {
                if (currentYear >= maxDate.getFullYear() && currentMonth >= maxDate.getMonth()) return;
            }

            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        } else if (viewMode === "months") {
            if (maxDate && currentYear >= maxDate.getFullYear()) return;
            setCurrentYear(currentYear + 1);
        } else if (viewMode === "years") {
            if (maxDate && yearRangeStart + 11 >= maxDate.getFullYear()) return;
            setYearRangeStart(yearRangeStart + 12);
        }
    };

    const handleHeaderClick = () => {
        if (viewMode === "days") {
            setViewMode("months");
        } else if (viewMode === "months") {
            setViewMode("years");
        }
    };

    const renderDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2" />);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isSelected = selected &&
                selected.getDate() === day &&
                selected.getMonth() === currentMonth &&
                selected.getFullYear() === currentYear;
            const isToday = new Date().getDate() === day &&
                new Date().getMonth() === currentMonth &&
                new Date().getFullYear() === currentYear;

            const isDateDisabled = (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) ||
                (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()));

            days.push(
                <Button
                    key={day}
                    variant="ghost"
                    size="sm"
                    disabled={isDateDisabled}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                        "h-8 w-8 p-0 font-normal",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        isToday && !isSelected && "bg-accent"
                    )}
                >
                    {day}
                </Button>
            );
        }

        return days;
    };

    const renderMonths = () => {
        return MONTH_SHORT.map((month, index) => {
            const isSelected = selected &&
                selected.getMonth() === index &&
                selected.getFullYear() === currentYear;
            const isCurrent = new Date().getMonth() === index &&
                new Date().getFullYear() === currentYear;

            const isMonthDisabled = (minDate && (currentYear < minDate.getFullYear() || (currentYear === minDate.getFullYear() && index < minDate.getMonth()))) ||
                (maxDate && (currentYear > maxDate.getFullYear() || (currentYear === maxDate.getFullYear() && index > maxDate.getMonth())));

            return (
                <Button
                    key={month}
                    variant="ghost"
                    disabled={isMonthDisabled}
                    onClick={() => handleMonthClick(index)}
                    className={cn(
                        "h-16 font-normal",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        isCurrent && !isSelected && "bg-accent"
                    )}
                >
                    {month}
                </Button>
            );
        });
    };

    const renderYears = () => {
        const years = [];
        for (let i = 0; i < 12; i++) {
            const year = yearRangeStart + i;
            if (year < fromYear || year > toYear) {
                years.push(<div key={`empty-${i}`} />);
                continue;
            }

            const isSelected = selected && selected.getFullYear() === year;
            const isCurrent = new Date().getFullYear() === year;

            const isYearDisabled = (minDate && year < minDate.getFullYear()) ||
                (maxDate && year > maxDate.getFullYear());

            years.push(
                <Button
                    key={year}
                    variant="ghost"
                    disabled={isYearDisabled}
                    onClick={() => handleYearClick(year)}
                    className={cn(
                        "h-16 font-normal",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        isCurrent && !isSelected && "bg-accent"
                    )}
                >
                    {year}
                </Button>
            );
        }
        return years;
    };

    const getHeaderText = () => {
        if (viewMode === "days") {
            return `${MONTHS[currentMonth]} ${currentYear}`;
        } else if (viewMode === "months") {
            return currentYear.toString();
        } else {
            return `${yearRangeStart} - ${yearRangeStart + 11}`;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "justify-start text-left font-normal",
                        classname,
                        !selected && "text-muted-foreground",
                        error && "border-red-500"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selected ? format(selected, "PPP") : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevious}
                            className="h-7 w-7"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleHeaderClick}
                            className="font-semibold hover:bg-accent"
                            disabled={viewMode === "years"}
                        >
                            {getHeaderText()}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNext}
                            className="h-7 w-7"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {viewMode === "days" && (
                        <div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {renderDays()}
                            </div>
                        </div>
                    )}

                    {viewMode === "months" && (
                        <div className="grid grid-cols-3 gap-2">
                            {renderMonths()}
                        </div>
                    )}

                    {viewMode === "years" && (
                        <div className="grid grid-cols-3 gap-2">
                            {renderYears()}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
