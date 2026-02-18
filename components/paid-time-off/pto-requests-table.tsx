import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckIcon, XIcon } from 'lucide-react'
import { useGetPTORequests, useUpdatePTORequest } from '@/services/paid-time-off.services'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const filterOptions = ['all', 'pending', 'approved', 'rejected'] as const
type FilterOption = typeof filterOptions[number]

const statusStyles = {
    approved: 'bg-green-500/15 text-green-700 border-green-200',
    rejected: 'bg-red-500/15 text-red-700 border-red-200',
    pending: 'bg-amber-500/15 text-amber-700 border-amber-200',
}

interface PTORequestTableProps {
    orgId: string
}

export function PTORequestTable({ orgId }: PTORequestTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

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

    const { data: requests = [] } = useGetPTORequests(orgId, filter)
    const { mutate: updateRequest } = useUpdatePTORequest(orgId)

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">PTO Requests</h3>
                <div className="flex gap-1">
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

            {requests.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                        No {filter !== 'all' ? filter : ''} requests found.
                    </p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs">Employee</TableHead>
                            <TableHead className="text-xs">Policy</TableHead>
                            <TableHead className="text-xs">Start Date</TableHead>
                            <TableHead className="text-xs">End Date</TableHead>
                            <TableHead className="text-xs">Days</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => {
                            const status = request.status as 'approved' | 'rejected' | 'pending'
                            return (
                                <TableRow key={request.id}>
                                    <TableCell className="text-sm font-medium py-5">
                                        {request.userId.name}
                                    </TableCell>
                                    <TableCell className="text-sm py-2">{request.policyId.name}</TableCell>
                                    <TableCell className="text-sm py-2">
                                        {new Date(request.startDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-sm py-2">
                                        {new Date(request.endDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-sm py-2">
                                        {request.totalDays}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <Badge className={`text-xs px-1.5 py-0 ${statusStyles[status]}`}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        {request.status === 'pending' ? (
                                            <div className="flex gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                                    onClick={() => updateRequest({ status: 'approved', requestId: request.id })}
                                                    aria-label={`Approve request for ${request.userId.name}`}
                                                >
                                                    <CheckIcon className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                    onClick={() => updateRequest({ status: 'rejected', requestId: request.id })}
                                                    aria-label={`Reject request for ${request.userId.name}`}
                                                >
                                                    <XIcon className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}