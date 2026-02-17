"use client"

import { PtoPolicies } from "@/components/paid-time-off/pto-policies";
import { PTORequests } from "@/components/paid-time-off/pto-requests";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { use, useState } from "react";

export default function TimeOffPolicyPage({ params }: PageProps<"/dashboard/[orgId]/settings/policies/time-off">) {
    const { orgId } = use(params);
    const [tab, setTab] = useState<"policies" | "requests">("policies");

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div >

                <h2 className="text-3xl font-bold text-foreground">PTO Management</h2>
                <p className="text-muted-foreground mt-2">
                    Manage policies and approve time-off requests
                </p>
            </div>

            <Tabs defaultValue="policies" className="mt-4 border-b border-gray-200 pb-3 ">
                <TabsList className="space-x-3">
                    <TabsTrigger value="policies" className="cursor-pointer" onClick={() => setTab("policies")}>Policies</TabsTrigger>
                    <TabsTrigger value="requests" className="cursor-pointer" onClick={() => setTab("requests")}>Requests</TabsTrigger>
                </TabsList>
            </Tabs>
            {
                tab === "policies"
                    ? <PtoPolicies organizationId={orgId} />
                    : <PTORequests />
            }

        </section>
    )
}
