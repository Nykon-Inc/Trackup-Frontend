'use client'

import { useState, useMemo, use } from 'react'
import { format, isPast, isToday } from 'date-fns'
import { PlusIcon, } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HolidayTable, { getHolidayStatus } from './_components/table'
import { HolidayForm } from './_components/form'
import { HolidayStats } from './_components/stats'
import { PageHeader } from '@/components/page-header'
import { useCreateHoliday, useDeleteHoliday, useGetHolidays, useUpdateHoliday } from '@/services/holiday.services'
import { IHolidayItem } from '@/interfaces/holiday.interfaces'



const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, i) => currentYear - i).reverse();
};

export default function HolidaysPage({ params }: PageProps<"/dashboard/[orgId]/settings/policies/holidays">) {
    const { orgId } = use(params)

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const { data } = useGetHolidays(orgId, selectedYear)
    const { mutate: createHoliday, isPending: isSubmitting } = useCreateHoliday(orgId)
    const { mutate: updateHoliday, isPending: isUpdating } = useUpdateHoliday(orgId)
    const { mutate: deleteHoliday } = useDeleteHoliday(orgId)

    const dates = data?.holidays || []

    const [modalOpen, setModalOpen] = useState(false)
    const [editingHoliday, setEditingHoliday] = useState<IHolidayItem | null>(null)


    const upcoming = (data?.holidays || []).filter((h) => getHolidayStatus(h.date) === 'upcoming')

    const grouped = useMemo(() => {
        const map = new Map<string, IHolidayItem[]>()
        dates.forEach((h) => {
            const month = format(new Date(h.date), 'MMMM')
            if (!map.has(month)) map.set(month, [])
            map.get(month)!.push(h)
        })
        return map
    }, [dates])


    const handleEdit = (holiday: IHolidayItem) => {
        setEditingHoliday(holiday)
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        setModalOpen(false)
        setEditingHoliday(null)
    }

    const handleSave = (payload: { name?: string, date?: string }, resetForm: () => void) => {
        if (editingHoliday) {
            updateHoliday(
                { ...payload, holidayId: editingHoliday.id, },
                { onSuccess: () => { resetForm(); handleCloseModal() } })
        } else {
            createHoliday(payload, { onSuccess: () => { resetForm(); handleCloseModal() } })
        }
    }


    return (
        <div className=" space-y-8">
            <PageHeader
                title="Public Holidays"
                breadcrumbs={[
                    { label: "settings", href: `/dashboard/${orgId}/settings`, active: false },
                    { label: "policies", href: `/dashboard/${orgId}/settings/policies`, active: false },
                    { label: "holidays", href: `/dashboard/${orgId}/settings/policies/holidays`, active: true },
                ]}
                rightElement={<div>
                </div>}
            />
            <div className='px-5 space-y-4'>
                <div className="flex flex-col gap-4 md:flex-row items-start justify-between mb-3">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit">
                        {getYearOptions().map((year) => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-5 py-1.5 rounded-md text-sm font-medium font-mono transition-colors ${selectedYear === year
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setModalOpen(true)}>
                            <PlusIcon className="h-4 w-4" />
                            Add Holiday
                        </Button>
                    </div>
                </div>
                <HolidayStats
                    totalHolidays={data?.holidays?.length || 0}
                    selectedYear={selectedYear}
                    upcoming={upcoming}
                    nextHoliday={data?.nextHoliday || null}
                />
                <HolidayTable grouped={grouped} handleEdit={handleEdit} handleDelete={deleteHoliday} />
                <HolidayForm
                    open={modalOpen}
                    onOpenChange={handleCloseModal}
                    editingHoliday={editingHoliday}
                    onSave={handleSave}
                    handleCloseModal={handleCloseModal}
                    isSubmitting={isSubmitting || isUpdating}
                />
            </div>
        </div>
    )
}