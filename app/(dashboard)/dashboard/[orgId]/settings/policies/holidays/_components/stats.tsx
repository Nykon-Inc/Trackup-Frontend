import { IHoliday } from "@/interfaces/holiday.interfaces"
import { differenceInCalendarDays, format } from "date-fns"

type Holiday = {
    id: string
    name: string
    date: string
}

type Props = {
    totalHolidays: number
    selectedYear: number
    upcoming: Holiday[]
    nextHoliday: IHoliday['nextHoliday'] | null
}

export const HolidayStats = ({ totalHolidays, selectedYear, upcoming, nextHoliday }: Props) => {
    const daysUntilNext = nextHoliday
        ? differenceInCalendarDays(new Date(nextHoliday.date), new Date())
        : null;
    return (
        <div className="grid grid-cols-3 gap-4">
            {[
                { label: 'Total Holidays', value: totalHolidays, sub: `in ${selectedYear}` },
                { label: 'Upcoming', value: upcoming.length, sub: 'remaining this year' },
                {
                    label: 'Next Holiday',
                    value: nextHoliday?.name ?? '—',
                    sub: nextHoliday
                        ? `${format(new Date(nextHoliday.date), 'MMM d')} · ${daysUntilNext} days away`
                        : 'No upcoming holidays',
                    smallValue: true,
                },
            ].map((stat) => (
                <div
                    key={stat.label}
                    className="bg-white border border-slate-200 rounded-xl px-6 py-5 relative overflow-hidden"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        {stat.label}
                    </p>
                    <p className={`font-bold text-slate-900 leading-tight ${stat.smallValue ? 'text-xl mt-1' : 'text-4xl'}`}>
                        {stat.value}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                </div>
            ))}
        </div>

    )
}