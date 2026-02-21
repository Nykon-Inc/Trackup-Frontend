"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function StaffProfileSkeleton() {
    return (
        <div className="px-6 pt-4 pb-2">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-36 rounded-md" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                </div>
            </div>

            <div className="mt-3">
                <Skeleton className="h-6 w-40 rounded-full" />
            </div>
        </div>
    )
}
