import { DateTime, Interval } from 'luxon';

export interface DayEntry {
    date: string;
    hours: number;
    isWeekend: boolean;
    isHoliday: boolean;
}

export const buildDaysArray = (
    startDate: Date,
    endDate: Date,
    excludeWeekends: boolean,
    excludeHolidays: boolean,
    holidays: string[],
    hoursPerDay: number,
): DayEntry[] => {
    const start = DateTime.fromJSDate(startDate).startOf('day');
    const end = DateTime.fromJSDate(endDate).startOf('day');
    const holidaySet = new Set(holidays);
    const interval = Interval.fromDateTimes(start, end.plus({ days: 1 }));
    const allDays = interval.splitBy({ days: 1 }).map(d => d.start!);

    return allDays.map(day => {
        const isWeekend = day.weekday >= 6;
        const isHoliday = holidaySet.has(day.toISODate()!);
        const shouldExclude = (isWeekend && excludeWeekends) || (isHoliday && excludeHolidays);
        return {
            date: day.toISODate()!,
            hours: shouldExclude ? 0 : hoursPerDay,
            isWeekend,
            isHoliday,
        };
    });
};