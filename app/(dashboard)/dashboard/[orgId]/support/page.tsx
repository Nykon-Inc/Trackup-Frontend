"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation'
import { PageHeader } from "@/components/page-header"
import Table, { TableColumn } from "@/components/ui/data-table"
import { useGetTickets } from "@/services/tickets.services"
import { Ticket, TicketStatus, TicketPriority } from "@/interfaces/tickets.interfaces"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isValid, addDays } from "date-fns"
import { Plus, Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { SelectControlled } from "@/components/ui/select-controlled"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { CreateTicketModal } from "./_components/create-ticket-modal"

const statusOptions = [
    { label: "Open", value: TicketStatus.OPEN },
    { label: "In Progress", value: TicketStatus.IN_PROGRESS },
    { label: "Resolved", value: TicketStatus.RESOLVED },
    { label: "Closed", value: TicketStatus.CLOSED },
]

const priorityOptions = [
    { label: "Low", value: TicketPriority.LOW },
    { label: "Medium", value: TicketPriority.MEDIUM },
    { label: "High", value: TicketPriority.HIGH },
    { label: "Urgent", value: TicketPriority.URGENT },
]

export default function SupportPage() {
    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const orgId = params.orgId as string
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
    const [isFilterOpen, setIsFilterOpen] = React.useState(false)
    
    // URL-based values
    const urlSearch = searchParams.get("search") || ""
    const urlStatus = searchParams.get("status") || ""
    const urlPriority = searchParams.get("priority") || ""
    const urlFrom = searchParams.get("startDate") || ""
    const urlTo = searchParams.get("endDate") || ""

    // Input state
    const [search, setSearch] = useState(urlSearch)

    // Filter Popover state
    const [tempStatus, setTempStatus] = useState(urlStatus)
    const [tempPriority, setTempPriority] = useState(urlPriority)
    const [tempDate, setTempDate] = useState<DateRange | undefined>(() => {
        const from = urlFrom ? parseISO(urlFrom) : undefined
        const to = urlTo ? parseISO(urlTo) : undefined
        return (from && isValid(from)) ? { from, to: (to && isValid(to)) ? to : undefined } : undefined
    })

    // Sync input with external URL transitions (like reset)
    useEffect(() => {
        setSearch(urlSearch)
    }, [urlSearch])

    // Debounce URL update for SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== urlSearch) {
                const query = new URLSearchParams(searchParams.toString())
                if (search) {
                    query.set("search", search)
                } else {
                    query.delete("search")
                }
                router.replace(`${pathname}?${query.toString()}`, { scroll: false })
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [search, pathname, router, searchParams, urlSearch])

    const applyFilters = () => {
        const query = new URLSearchParams(searchParams.toString())

        if (tempStatus) query.set("status", tempStatus)
        else query.delete("status")

        if (tempPriority) query.set("priority", tempPriority)
        else query.delete("priority")

        if (tempDate?.from) query.set("startDate", tempDate.from.toISOString())
        else query.delete("startDate")

        if (tempDate?.to) query.set("endDate", tempDate.to.toISOString())
        else query.delete("endDate")

        router.replace(`${pathname}?${query.toString()}`, { scroll: false })
        setIsFilterOpen(false)
    }

    const clearFilters = () => {
        setTempStatus("")
        setTempPriority("")
        setTempDate(undefined)

        const query = new URLSearchParams()
        if (search) query.set("search", search)

        router.replace(`${pathname}?${query.toString()}`, { scroll: false })
    }

    const { data, isLoading } = useGetTickets({
        organizationId: orgId,
        search: urlSearch,
        status: urlStatus,
        priority: urlPriority as TicketPriority,
        startDate: urlFrom,
        endDate: urlTo,
        limit: 100
    })

    const tickets = data?.results || []

    const columns: TableColumn<Ticket>[] = useMemo(() => [
        {
            header: "Ticket ID",
            key: "id",
            render: (val) => <span className="font-mono text-[10px] text-muted-foreground">#{val.slice(-6).toUpperCase()}</span>,
            width: "100px"
        },
        {
            header: "Title",
            key: "title",
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm text-neutral-900 line-clamp-1">{val}</span>
                    <span className="text-[10px] text-neutral-400 line-clamp-1">{row.description}</span>
                </div>
            )
        },
        {
            header: "Status",
            key: "status",
            render: (val: TicketStatus) => {
                const variants: Record<TicketStatus, string> = {
                    [TicketStatus.OPEN]: "bg-blue-50 text-blue-700 border-blue-100",
                    [TicketStatus.IN_PROGRESS]: "bg-amber-50 text-amber-700 border-amber-100",
                    [TicketStatus.RESOLVED]: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    [TicketStatus.CLOSED]: "bg-neutral-50 text-neutral-700 border-neutral-100"
                }
                return (
                    <Badge variant="outline" className={`${variants[val] || ""} capitalize rounded-full px-2 py-0 text-[10px] font-bold border`}>
                        {val.replace('_', ' ')}
                    </Badge>
                )
            },
            width: "120px"
        },
        {
            header: "Priority",
            key: "priority",
            render: (val: TicketPriority) => {
                const colors: Record<TicketPriority, string> = {
                    [TicketPriority.LOW]: "bg-neutral-100",
                    [TicketPriority.MEDIUM]: "bg-blue-100",
                    [TicketPriority.HIGH]: "bg-orange-100",
                    [TicketPriority.URGENT]: "bg-red-100"
                }
                const textColors: Record<TicketPriority, string> = {
                    [TicketPriority.LOW]: "text-neutral-600",
                    [TicketPriority.MEDIUM]: "text-blue-600",
                    [TicketPriority.HIGH]: "text-orange-600",
                    [TicketPriority.URGENT]: "text-red-600"
                }
                return (
                    <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${colors[val || TicketPriority.LOW]}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${textColors[val || TicketPriority.LOW]}`}>
                            {val || 'Low'}
                        </span>
                    </div>
                )
            },
            width: "100px"
        },
        {
            header: "Created At",
            key: "createdAt",
            render: (val) => <span className="text-[11px] text-neutral-500">{format(new Date(val), "MMM d, yyyy")}</span>,
            width: "120px"
        }
    ], [])

    const hasActiveFilters = urlStatus || urlPriority || urlFrom || urlTo

    return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA]">
            <PageHeader
                title="Support & Feedback"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${orgId}`, active: false },
                    { label: "Support", href: `/dashboard/${orgId}/support`, active: true }
                ]}
            />

            <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <Input
                            placeholder="Search tickets by ID, title or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 bg-white border-border focus-visible:ring-primary rounded-lg text-xs"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 px-3 gap-2 border-border bg-white hover:bg-neutral-50 rounded-lg text-xs font-medium transition-all ${hasActiveFilters ? 'border-primary text-primary bg-primary/5 shadow-[0_0_0_2px_rgba(var(--primary),0.1)]' : 'text-neutral-500'}`}
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    Filters
                                    {hasActiveFilters && (
                                        <Badge className="ml-1 h-4 min-w-4 p-0 flex items-center justify-center bg-primary text-white text-[9px] rounded-full">
                                            {[urlStatus, urlPriority, urlFrom].filter(Boolean).length}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 border-border shadow-xl rounded-2xl overflow-hidden" align="end">
                                <div className="p-4 bg-white border-b border-muted/30">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">Advanced Filters</h3>
                                </div>
                                <div className="p-3 space-y-1">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Current Status</label>
                                        <SelectControlled
                                            mode="single"
                                            items={statusOptions}
                                            value={statusOptions.find(o => o.value === tempStatus)}
                                            getId={(o) => o.value}
                                            getLabel={(o) => o.label}
                                            onChange={(o) => setTempStatus(o?.value || "")}
                                            onSearch={() => { }}
                                            searchable={false}
                                            placeholder="All Statuses"
                                            buttonClassName="h-9 border-border rounded-lg text-xs bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Priority Level</label>
                                        <SelectControlled
                                            mode="single"
                                            items={priorityOptions}
                                            value={priorityOptions.find(o => o.value === tempPriority)}
                                            getId={(o) => o.value}
                                            getLabel={(o) => o.label}
                                            onChange={(o) => setTempPriority(o?.value || "")}
                                            onSearch={() => { }}
                                            searchable={false}
                                            placeholder="All Priorities"
                                            buttonClassName="h-9 border-border rounded-lg text-xs bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Submission Date</label>
                                        <DatePickerWithRange
                                            date={tempDate}
                                            setDate={setTempDate}
                                            maxDate={addDays(new Date(), 2)}
                                            className="w-full h-9"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-neutral-50/50 border-t border-muted/30 flex items-center justify-between gap-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-red-500 h-9"
                                    >
                                        Clear All
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={applyFilters}
                                        className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] px-6 h-9 rounded-lg"
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="h-6 w-px bg-muted/50 mx-1" />

                        <Button
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] h-9 rounded-lg shadow-sm"
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            New Ticket
                        </Button>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mr-2">Active:</span>
                        {urlStatus && (
                            <Badge variant="secondary" className="bg-white border-border text-neutral-600 gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                                Status: {urlStatus}
                                <button onClick={() => {
                                    setTempStatus("")
                                    const q = new URLSearchParams(searchParams.toString()); q.delete("status"); router.replace(`${pathname}?${q.toString()}`)
                                }}><X className="h-3 w-3" /></button>
                            </Badge>
                        )}
                        {urlPriority && (
                            <Badge variant="secondary" className="bg-white border-border text-neutral-600 gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                                Priority: {urlPriority}
                                <button onClick={() => {
                                    setTempPriority("")
                                    const q = new URLSearchParams(searchParams.toString()); q.delete("priority"); router.replace(`${pathname}?${q.toString()}`)
                                }}><X className="h-3 w-3" /></button>
                            </Badge>
                        )}
                        {urlFrom && (
                            <Badge variant="secondary" className="bg-white border-border text-neutral-600 gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                                {format(parseISO(urlFrom), "MMM d")} - {urlTo ? format(parseISO(urlTo), "MMM d") : "..."}
                                <button onClick={() => {
                                    setTempDate(undefined)
                                    const q = new URLSearchParams(searchParams.toString()); q.delete("startDate"); q.delete("endDate"); router.replace(`${pathname}?${q.toString()}`, { scroll: false })
                                }}><X className="h-3 w-3" /></button>
                            </Badge>
                        )}
                    </div>
                )}

                <Table
                    columns={columns}
                    data={tickets}
                    loading={isLoading}
                    emptyMessage={urlSearch || hasActiveFilters ? "No tickets match your search criteria." : "No tickets found. Have a question or feedback? Create a new ticket to get started."}
                    className="border-none"
                    rowClassName="hover:bg-neutral-50/50 cursor-pointer transition-colors"
                    onRowClick={(row) => {
                        router.push(`/dashboard/${orgId}/support/${row.id}`)
                    }}
                />
            </div>

            <CreateTicketModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                orgId={orgId}
            />
        </div>
    )
}
