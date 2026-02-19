"use client"

import { PageHeader } from "@/components/page-header";
import { EmptyPolicy } from "@/components/paid-time-off/EmptyPolicy";
import { Loading } from "@/components/paid-time-off/Loading";
import { Policy } from "@/components/paid-time-off/policy-form";
import { PtoPolicies } from "@/components/paid-time-off/pto-policies";
import { PTOPoliciesFilter } from "@/components/paid-time-off/pto-policies-filter";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetPtoPolicies } from "@/services/paid-time-off.services";
import { PlusIcon } from "lucide-react";
import { use, useEffect, useState } from "react";

export default function TimeOffPolicyPage({ params }: PageProps<"/dashboard/[orgId]/settings/policies/time-off">) {
    const { orgId } = use(params);
    const [editPolicy, setEditPolicy] = useState<Policy | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [page, setPage] = useState(1);


    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: policies, isPending } = useGetPtoPolicies({
        organizationId: orgId,
        query: { search: debouncedSearch, page, limit: 10, status: statusFilter }
    });

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const toggleStatusFilter = (status: string) => {
        setStatusFilter(current => current === status ? "" : status);
    };

    const handleNewPolicy = () => {
        setEditPolicy(null)
        setIsFormOpen(true)
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
                        search={search}
                        statusFilter={statusFilter}
                        setSearch={setSearch}
                        setStatusFilter={setStatusFilter}
                        toggleStatusFilter={toggleStatusFilter}
                    />
                    <Button size="sm" variant="default" onClick={handleNewPolicy} className="text-sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Policy
                    </Button>
                </div>

                {
                    isPending
                        ? <Loading />
                        : (policies?.results || []).length === 0
                            ? <EmptyPolicy clearFilters={handleNewPolicy} />
                            : <PtoPolicies
                                organizationId={orgId}
                                policies={policies?.results?.map(e => ({ ...e, userCount: 0 })) || []}
                                editPolicy={editPolicy}
                                setEditPolicy={setEditPolicy}
                                isFormOpen={isFormOpen}
                                setIsFormOpen={setIsFormOpen}
                            />
                }
            </div>

        </section>
    )
}
