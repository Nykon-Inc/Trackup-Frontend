"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { DollarSign } from "lucide-react";

export default function FinancialsPage() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Financials"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Financials", href: `/dashboard/${params?.orgId}/financials`, active: true }
                ]}
            />
            <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <DollarSign className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Financials Page</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                    Manage your organization's financials, invoices, and payments. This page is currently under development.
                </p>
            </div>
        </div>
    )
}
