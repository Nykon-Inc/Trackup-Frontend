import { useState } from 'react'
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
import { CheckIcon, XIcon, CalendarIcon } from 'lucide-react'

export interface PTORequest {
    id: string
    employeeName: string
    policyName: string
    startDate: string
    endDate: string
    days: number
    status: 'pending' | 'approved' | 'rejected'
}
interface PTORequestTableProps {
    requests: PTORequest[]
    onApprove: (requestId: string) => void
    onReject: (requestId: string) => void
}
export function PTORequestTable({
    requests,
    onApprove,
    onReject,
}: PTORequestTableProps) {
    const [filter, setFilter] = useState<
        'all' | 'pending' | 'approved' | 'rejected'
    >('all')
    const filteredRequests = requests.filter((request) => {
        if (filter === 'all') return true
        return request.status === filter
    })
    if (requests.length === 0) {
        return (
            <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                    No PTO requests
                </h3>
                <p className="text-muted-foreground">
                    There are no PTO requests to review at this time.
                </p>
            </div>
        )
    }
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">PTO Requests</h3>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'secondary'}
                        onClick={() => setFilter('all')}
                        className="text-sm"
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'pending' ? 'default' : 'secondary'}
                        onClick={() => setFilter('pending')}
                        className="text-sm"
                    >
                        Pending
                    </Button>
                    <Button
                        variant={filter === 'approved' ? 'default' : 'secondary'}
                        onClick={() => setFilter('approved')}
                        className="text-sm"
                    >
                        Approved
                    </Button>
                    <Button
                        variant={filter === 'rejected' ? 'default' : 'secondary'}
                        onClick={() => setFilter('rejected')}
                        className="text-sm"
                    >
                        Rejected
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Policy</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell className="font-medium">
                                {request.employeeName}
                            </TableCell>
                            <TableCell>{request.policyName}</TableCell>
                            <TableCell>
                                {new Date(request.startDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </TableCell>
                            <TableCell>
                                {new Date(request.endDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </TableCell>
                            <TableCell>{request.days}</TableCell>
                            <TableCell>
                                <Badge variant={request.status ? "default" : "secondary"}>
                                    {request.status.charAt(0).toUpperCase() +
                                        request.status.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {request.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="default"
                                            className="p-2"
                                            onClick={() => onApprove(request.id)}
                                            aria-label={`Approve request for ${request.employeeName}`}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="p-2"
                                            onClick={() => onReject(request.id)}
                                            aria-label={`Reject request for ${request.employeeName}`}
                                        >
                                            <XIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground">—</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {filteredRequests.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        No {filter !== 'all' ? filter : ''} requests found.
                    </p>
                </div>
            )}
        </div>
    )
}
