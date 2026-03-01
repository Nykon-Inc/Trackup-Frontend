import { Badge } from '../ui/badge'
import Table, { TableColumn } from '@/components/ui/data-table'
import { useGetOwnPtoRequests } from '@/services/paid-time-off.services'
import TablePagination from '../ui/table-pagination'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { IPTORequest } from '@/interfaces/paid-time-offs.interfaces'


export function RequestHistory({ organizationId }: { organizationId: string }) {
    const { data: requests, isPending } = useGetOwnPtoRequests(organizationId)
    const [page, setPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

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


    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })

    const columns: TableColumn<IPTORequest>[] = [
        {
            header: 'Policy',
            key: 'policyId',
            render: (value) => (
                <span className="text-sm font-semibold text-foreground py-3">{value?.name}</span>
            ),
        },
        {
            header: "Project",
            key: "projectId",
            render: (value) => (
                value
                    ? <span className="text-sm font-semibold text-foreground py-3">{value?.name}</span>
                    : <span className="text-muted-foreground/50 text-center">—</span>
            ),
        },
        {
            header: 'Submitted',
            key: 'createdAt',
            render: (value) => (
                <span className="text-xs text-muted-foreground">{formatDate(value)}</span>
            ),
        },
        {
            header: 'Start Date',
            key: 'startDate',
            render: (value) => (
                <span className="text-xs font-medium text-foreground">{formatDate(value)}</span>
            ),
        },
        {
            header: 'End Date',
            key: 'endDate',
            render: (value) => (
                <span className="text-xs font-medium text-foreground">{formatDate(value)}</span>
            ),
        },
        {
            header: 'Duration',
            key: 'totalDays',
            align: 'center',
            render: (_, row) => (
                <span className="text-xs font-medium text-foreground">
                    {row.totalHours === 0 ? 0 : row.totalHours} {row.totalHours === 1 ? 'hour' : 'hours'} / {row.totalDays} {row.totalDays === 1 ? 'day' : 'days'}
                </span>
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
            render: (value) => {
                const badgeStyles: Record<string, string> = {
                    approved: 'bg-green-500/15 text-green-700 border-green-200',
                    rejected: 'bg-red-500/15 text-red-700 border-red-200',
                    pending: 'bg-amber-500/15 text-amber-700 border-amber-200',
                }
                return (
                    <Badge className={`text-xs px-1.5 py-0 ${badgeStyles[value] ?? ''}`}>
                        {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
                    </Badge>
                )
            },
        },
    ]

    return (

        <div>
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <Table
                    data={requests?.results || []}
                    loading={isPending}
                    columns={columns}
                    emptyMessage="No requests yet. Submit your first time-off request above."
                    hover
                    compact
                    bordered={false}
                    className='border-0'
                    headerClassName="bg-transparent h-12 border-b border-slate-100 text-slate-400 font-normal text-xs uppercase tracking-wider whitespace-nowrap"
                    rowClassName={"cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/50"}
                    sortable
                    rowKey={(row) => row.id}
                    minTableWidth='1100px'
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