"use client"

import { PageHeader } from "@/components/page-header";
import { EmptyPolicy } from "@/components/paid-time-off/EmptyPolicy";
import { Loading } from "@/components/paid-time-off/Loading";
import { PtoPolicies } from "@/components/paid-time-off/pto-policies";
import { PTOPoliciesFilter } from "@/components/paid-time-off/pto-policies-filter";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { IPTOPolicy } from "@/interfaces/paid-time-offs.interfaces";
import { useGetPtoPolicies } from "@/services/paid-time-off.services";
import { PlusIcon } from "lucide-react";
import { use, useEffect, useState } from "react";

export default function TimeOffPolicyPage({ params }: PageProps<"/dashboard/[orgId]/settings/policies/time-off">) {
    const { orgId } = use(params);
    const [editPolicy, setEditPolicy] = useState<IPTOPolicy | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)

    const [filters, setFilters] = useState({
        search: "",
        page: 1,
        status: "all",
        limit: 16

    })
    const debouncedSearch = useDebounce(filters.search, 500);

    const { data: policies, isPending } = useGetPtoPolicies({
        organizationId: orgId,
        query: {
            search: debouncedSearch,
            page: filters.page,
            limit: filters.limit,
            status: filters.status
        }
    });

    useEffect(() => {
        setFilters(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearch]);

    const toggleStatusFilter = (status: string) => {
        setFilters(prev => ({ ...prev, status: prev.status === status ? "" : status }));
    };

    const handleNewPolicy = () => {
        setEditPolicy(null)
        setIsFormOpen(true)
    }
    const handlePageChange = (_: any, page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }
    const handleRowsPerPageChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setFilters(prev => ({ ...prev, limit: Number(e.target.value) }));
    }

    return (
        <section className="space-y-4">
            <PageHeader
                title="PTO Management"
                breadcrumbs={[
                    { label: "settings", href: `/dashboard/${orgId}/settings`, active: false },
                    { label: "policies", href: `/dashboard/${orgId}/settings/policies`, active: false },
                    { label: "timeoff", href: `/dashboard/${orgId}/settings/policies/time-off`, active: true },
                ]}
                rightElement={<div>
                </div>}
            />
            <div className="px-4">

                <div className="flex items-center justify-between">
                    <PTOPoliciesFilter
                        filters={filters}
                        setFilters={setFilters}
                        toggleStatusFilter={toggleStatusFilter}
                    />
                    <Button size="sm" variant="default" onClick={handleNewPolicy} className="text-sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Policy
                    </Button>
                </div>

                {
                    isPending
                        ? <Loading count={8} />
                        : (policies?.results || []).length === 0
                            ? <EmptyPolicy clearFilters={handleNewPolicy} />
                            : <PtoPolicies
                                organizationId={orgId}
                                policies={policies?.results?.map(e => ({ ...e, userCount: 0 })) || []}
                                editPolicy={editPolicy}
                                setEditPolicy={setEditPolicy}
                                isFormOpen={isFormOpen}
                                setIsFormOpen={setIsFormOpen}
                                pagination={{
                                    onPageChange: handlePageChange,
                                    onRowsPerPageChange: handleRowsPerPageChange,
                                    page: filters.page,
                                    rowsPerPage: filters.limit,
                                    totalResults: policies?.totalResults || 0
                                }}
                            />
                }
            </div>

        </section>
    )
}
