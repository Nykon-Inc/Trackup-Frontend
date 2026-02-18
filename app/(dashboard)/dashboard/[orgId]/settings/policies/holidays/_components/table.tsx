import Table, { TableColumn } from "@/components/ui/data-table"
import { format, isPast, isToday } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EditIcon, TrashIcon } from "lucide-react"
import { IHolidayItem } from "@/interfaces/holiday.interfaces"


type Props = {
    grouped: Map<string, IHolidayItem[]>
    handleEdit: (holiday: IHolidayItem) => void
    handleDelete: (id: string) => void
}
export const getHolidayStatus = (date: string): 'past' | 'today' | 'upcoming' => {
    const d = new Date(date)
    if (isToday(d)) return 'today'
    if (isPast(d)) return 'past'
    return 'upcoming'
}
const statusBadgeClass: Record<string, string> = {
    past: 'bg-slate-100 text-slate-500 border-slate-200',
    today: 'bg-amber-500/15 text-amber-600 border-amber-200',
    upcoming: 'bg-green-500/15 text-green-700 border-green-200',
}

const statusDotClass: Record<string, string> = {
    past: 'bg-slate-300',
    today: 'bg-amber-500',
    upcoming: 'bg-green-500',
}

const HolidayTable = ({ grouped, handleEdit, handleDelete }: Props) => {
    const columns: TableColumn<IHolidayItem>[] = [
        {
            header: 'Holiday',
            key: 'name',
            width: '40%',
            render: (value, row) => {
                const status = getHolidayStatus(row.date)
                return (
                    <div className="flex items-center gap-2.5">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${statusDotClass[status]}`} />
                        <span className="font-medium text-slate-800">{value}</span>
                    </div>
                )
            },
        },
        {
            header: 'Date',
            key: 'date',
            width: '20%',
            render: (value) => (
                <span className="font-mono text-xs text-slate-500">
                    {format(new Date(value), 'EEE, MMM dd')}
                </span>
            ),
        },
        {
            header: 'Day',
            key: 'date',
            width: '15%',
            render: (value) => (
                <span className="font-mono text-xs text-slate-500">
                    {format(new Date(value), 'EEEE')}
                </span>
            ),
        },
        {
            header: 'Status',
            key: 'date',
            width: '15%',
            render: (value) => {
                const status = getHolidayStatus(value)
                return (
                    <Badge className={`text-xs px-2.5 py-0.5 font-medium capitalize ${statusBadgeClass[status]}`}>
                        {status}
                    </Badge>
                )
            },
        },
        {
            header: '',
            key: 'id',
            width: '10%',
            align: 'right',
            render: (_, row) => (
                <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => handleEdit(row)}
                    >
                        <EditIcon className="h-3 w-3 mr-1" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(row.id)}
                    >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Delete
                    </Button>
                </div>
            ),
        },
    ]
    return (
        <div>
            {grouped.size === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                    No holidays found.
                </div>
            ) : (
                Array.from(grouped.entries()).map(([month, monthHolidays], index) => (
                    <div key={month}>
                        {/* Month divider */}
                        <div className="px-6 py-2 bg-slate-50/70 border-b border-slate-100">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                {month}
                            </span>
                        </div>
                        <Table
                            data={monthHolidays}
                            columns={columns}
                            rowKey={(row) => row.id}
                            hover
                            compact
                            bordered={false}
                            className="border-0 shadow-none"
                            // Only show header on first month
                            headerClassName={
                                index === 0
                                    ? 'bg-transparent h-10 border-b border-slate-100 text-slate-400 font-normal text-xs uppercase tracking-wider'
                                    : 'hidden'
                            }
                            rowClassName="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                        />
                    </div>
                ))
            )}
        </div>
    )
}
export default HolidayTable