"use client"

import { Policy } from "@/components/paid-time-off/policy-form";
import { PtoPolicies } from "@/components/paid-time-off/pto-policies";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { use, useState } from "react";

export default function TimeOffPolicyPage({ params }: PageProps<"/dashboard/[orgId]/settings/policies/time-off">) {
    const { orgId } = use(params);
    const [editPolicy, setEditPolicy] = useState<Policy | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)


    const handleNewPolicy = () => {
        setEditPolicy(null)
        setIsFormOpen(true)
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">PTO Management</h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Manage time-off policies for your organization
                    </p>
                </div>

                <Button variant="default" onClick={handleNewPolicy} className="text-sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Policy
                </Button>
            </div>

            <PtoPolicies
                organizationId={orgId}
                editPolicy={editPolicy}
                setEditPolicy={setEditPolicy}
                isFormOpen={isFormOpen}
                setIsFormOpen={setIsFormOpen}
            />

        </section>
    )
}
