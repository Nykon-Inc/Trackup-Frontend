import Table, { TableColumn } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckIcon, XIcon } from 'lucide-react'
import { useGetPTORequests, useUpdatePTORequest } from '@/services/paid-time-off.services'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TablePagination from '../ui/table-pagination'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

const filterOptions = ['all', 'pending', 'approved', 'rejected'] as const
type FilterOption = typeof filterOptions[number]

const statusStyles: Record<string, string> = {
    approved: 'bg-green-500/15 text-green-700 border-green-200',
    rejected: 'bg-red-500/15 text-red-700 border-red-200',
    pending: 'bg-amber-500/15 text-amber-700 border-amber-200',
}

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

interface PTORequestTableProps {
    orgId: string
}

export function PTORequestTable({ orgId }: PTORequestTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const filter = (searchParams.get('status') ?? 'all') as FilterOption

    const setFilter = (option: FilterOption) => {
        const params = new URLSearchParams(searchParams.toString())
        if (option === 'all') {
            params.delete('status')
        } else {
            params.set('status', option)
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    const { data: requests, isPending } = useGetPTORequests(orgId, filter)
    const { mutate: updateRequest } = useUpdatePTORequest(orgId)

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        setPage(newPage);
    };


    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };


    const columns: TableColumn[] = [
        {
            header: 'Employee',
            key: 'userId',
            render: (value) => (
                <span className="text-sm font-medium py-3">{value?.name}</span>
            ),
        },
        {
            header: 'Policy',
            key: 'policyId',
            render: (value) => (
                <span className="text-sm">{value?.name}</span>
            ),
        },
        {
            header: 'Start Date',
            key: 'startDate',
            render: (value) => (
                <span className="text-sm">{formatDate(value)}</span>
            ),
        },
        {
            header: 'End Date',
            key: 'endDate',
            render: (value) => (
                <span className="text-sm">{formatDate(value)}</span>
            ),
        },
        {
            header: 'Days',
            key: 'totalDays',
            align: 'center',
            render: (value) => (
                <span className="text-sm">{value}</span>
            ),
        },
        {
            header: 'Reason',
            key: 'reason',
            render: (value) =>
                value ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground line-clamp-1 text-ellipsis cursor-default max-w-37.5 block">
                                    {value}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-75 text-xs">
                                {value}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <span className="text-muted-foreground/50">—</span>
                ),
        },
        {
            header: 'Status',
            key: 'status',
            align: 'center',
            render: (value) => (
                <Badge className={`text-xs px-1.5 py-0 ${statusStyles[value] ?? ''}`}>
                    {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            key: 'id',
            align: 'center',
            render: (_, row) =>
                row.status === 'pending'
                    ? (
                        <div className="flex gap-1.5 justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                onClick={() => updateRequest({ status: 'approved', requestId: row.id })}
                                aria-label={`Approve request for ${row.userId.name}`}
                            >
                                <CheckIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={() => updateRequest({ status: 'rejected', requestId: row.id })}
                                aria-label={`Reject request for ${row.userId.name}`}
                            >
                                <XIcon className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    ),
        },
    ]

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex gap-1 mt-3">
                    {filterOptions.map((option) => (
                        <Button
                            key={option}
                            variant={filter === option ? 'default' : 'ghost'}
                            size="sm"
                            className="text-xs h-7 px-2.5"
                            onClick={() => setFilter(option)}
                        >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <Table
                    data={requests?.results || []}
                    columns={columns}
                    rowKey={(row) => row.id}
                    emptyMessage={`No ${filter !== 'all' ? filter : ''} requests found.`}
                    hover
                    compact
                    loading={isPending}
                    bordered={false}
                    className="border-0"
                    headerClassName="bg-transparent h-12 border-b border-slate-100 text-slate-400 font-normal text-xs uppercase tracking-wider whitespace-nowrap"
                    rowClassName="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                />

                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/20">
                    <TablePagination
                        component="div"
                        count={requests?.totalResults || 0}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50, 100]}
                        showFirstButton
                        showLastButton
                        className="border-0 p-0"
                    />
                </div >
            </div>
        </div>
    )
}