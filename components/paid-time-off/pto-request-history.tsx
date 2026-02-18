import { Card, CardHeader, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { useGetOwnPtoRequests } from '@/services/paid-time-off.services'
import { differenceInCalendarDays, parseISO } from 'date-fns'


export function RequestHistory({ organizationId }: { organizationId: string }) {
    const { data: requests = [] } = useGetOwnPtoRequests(organizationId)

    if (requests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold text-foreground">
                        Request History
                    </h2>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <ClockIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            No requests yet. Submit your first time-off request above.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardHeader className="px-4 pb-2">
                <h2 className="text-sm font-semibold text-foreground">Request History</h2>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                    {requests.map((request) => {

                        const statusStyles = {
                            approved: 'border-l-green-500',
                            rejected: 'border-l-red-400',
                            pending: 'border-l-amber-400',
                        }

                        const badgeStyles = {
                            approved: 'bg-green-500/15 text-green-700 border-green-200',
                            rejected: 'bg-red-500/15 text-red-700 border-red-200',
                            pending: 'bg-amber-500/15 text-amber-700 border-amber-200',
                        }

                        const status = request.status as 'approved' | 'rejected' | 'pending'

                        return (
                            <div
                                key={request.id}
                                className={`border border-border border-l-2 rounded-lg p-3 transition-colors hover:bg-muted/50 ${statusStyles[status]}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground leading-tight">
                                            {request.policyId.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Submitted{' '}
                                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <Badge className={`text-xs px-1.5 py-0 shrink-0 ${badgeStyles[status]}`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <div>
                                            <p className="text-muted-foreground">Start</p>
                                            <p className="font-medium text-foreground">
                                                {new Date(request.startDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <div>
                                            <p className="text-muted-foreground">End</p>
                                            <p className="font-medium text-foreground">
                                                {new Date(request.endDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <ClockIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <div>
                                            <p className="text-muted-foreground">Duration</p>
                                            <p className="font-medium text-foreground">
                                                {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {request.reason && (
                                    <div className="mt-2 pt-2 border-t border-border">
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-medium">Reason: </span>
                                            {request.reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
