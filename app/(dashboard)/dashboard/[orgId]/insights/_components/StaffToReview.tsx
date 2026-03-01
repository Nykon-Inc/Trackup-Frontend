import React from 'react'
import { IInsightReviewSummary } from '@/interfaces/ai.interfaces'
import Table, { TableColumn } from '@/components/ui/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Search } from 'lucide-react'

export default function StaffToReview({ staffToReview, isLoading }: { staffToReview: IInsightReviewSummary[], isLoading?: boolean }) {
    const columns: TableColumn<IInsightReviewSummary>[] = [
        {
            header: "Name",
            key: "user.fullName",
            render: (_, row) => {
                const insight = row.latestInsight;
                const user = insight.user;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                            <AvatarImage src={user.avatar || `https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} />
                            <AvatarFallback className="text-xs">{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-sm text-foreground">{user.name || 'Member Name'}</span>
                    </div>
                );
            }
        },
        {
            header: "Role",
            key: "user.role",
            width: "100px",
            render: (_, row) => {
                const insight = row.latestInsight;
                const user = insight.user || {};
                return (
                    <span className="text-xs font-medium text-slate-500">{user.role || 'Staff Member'}</span>
                );
            }
        },
        {
            header: "Project(s)",
            key: "project.name",
            render: (_, row) => {
                const insight = row.latestInsight;
                const project = insight.project;
                return (
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-slate-50/80 text-slate-700 border-slate-100/50 rounded-lg h-7 font-bold px-3">
                            {project?.name || 'General Work'}
                        </Badge>
                    </div>
                );
            }
        },
        {
            header: "Review Reason",
            key: "aiResult.primary_signal",
            render: (_, row) => {
                const insight = row.latestInsight;
                const aiResult = insight.aiResult || {};
                return (
                    <Badge className="bg-slate-100/80 text-slate-900 border-none rounded-lg h-7 font-bold px-3 shadow-none">
                        {aiResult.activity_pattern}
                    </Badge>
                );
            }
        },
        {
            header: "Time Range",
            key: "startTime",
            align: "center",
            render: (_, row) => {
                const insight = row.latestInsight;
                const start = parseISO(insight.startTime);
                const end = parseISO(insight.endTime);
                return (
                    <span className="text-xs font-bold text-slate-500">
                        {format(start, 'h aa')} - {format(end, 'h aa')}
                    </span>
                );
            }
        },
        {
            header: "Action",
            key: "action",
            align: "right",
            width: "120px",
            render: () => (
                <Button variant="outline" size="sm" className="h-8 rounded-lg text-[11px] font-bold border-slate-200 hover:bg-slate-50">
                    View Tessa
                </Button>
            )
        }
    ];

    if (!isLoading && (!staffToReview || staffToReview.length === 0)) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold tracking-tight">Staff to Review</h3>
                        <p className="text-xs text-muted-foreground">
                            Based on aggregated activity signals for the selected period.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
                    <EmptyState
                        icon={Search}
                        title="No staff flagged for review"
                        description="Excellent! No irregular activity patterns were detected for the selected period. This is typical for weekends or highly consistent teams."
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold tracking-tight">Staff to Review</h3>
                    <p className="text-xs text-muted-foreground">
                        Based on aggregated activity signals for the selected period.
                    </p>
                </div>
                {!isLoading && (
                    <div>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg text-[11px] font-bold border-slate-200 hover:bg-slate-50">
                            View All
                        </Button>
                    </div>
                )}
            </div>

            <Table
                data={staffToReview}
                columns={columns}
                loading={isLoading}
                rowKey={(row) => `${row.userId}-${row.projectId}`}
                emptyMessage="No staff summaries flagged for the selected period."
                hover={true}
                rowClassName="h-16"
                headerClassName="bg-slate-50/50"
            />
        </div>
    )
}
