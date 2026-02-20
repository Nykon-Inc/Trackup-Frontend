"use client"
import { PageHeader } from '@/components/page-header'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useGetAggregatedSessions } from '@/services/sessions.services';
import { useGetProject } from '@/services/projects.services';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, eachDayOfInterval, isSameDay, subDays } from 'date-fns';

export default function page() {
    const params = useParams();
    const id = params?.id as string;
    const staffId = params?.staffId as string;
    const orgId = params?.orgId as string;

    const { data: project } = useGetProject({ organizationId: orgId, projectId: id });

    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    });

    const query = React.useMemo(() => {
        const from = date?.from;
        const to = date?.to || date?.from;

        return {
            userId: staffId,
            projectId: id,
            startDate: from ? from.toISOString() : "",
            endDate: to ? to.toISOString() : "",
        }
    }, [staffId, id, date]);

    const { data: aggregatedSessions, isLoading } = useGetAggregatedSessions(query)

    const days = React.useMemo(() => {
        if (!date?.from) return [];
        const end = date.to || date.from;
        return eachDayOfInterval({ start: date.from, end: end });
    }, [date]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Staff"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${orgId}`, active: false },
                    { label: "Projects", href: `/dashboard/${orgId}/projects`, active: false },
                    { label: project?.name || "Project", href: `/dashboard/${orgId}/projects/${id}`, active: false },
                    { label: "Staff", href: `/dashboard/${orgId}/projects/${id}/staff/${staffId}`, active: true },
                ]}
            />
        </div>
    )
}
