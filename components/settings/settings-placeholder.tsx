"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";

interface SettingsPlaceholderProps {
    title: string;
    breadcrumbLabel: string;
    description: string;
    parentLabel?: string;
    parentHref?: string;
}

export function SettingsPlaceholder({ title, breadcrumbLabel, description, parentLabel = "Settings", parentHref }: SettingsPlaceholderProps) {
    const params = useParams();
    const settingsHref = `/dashboard/${params?.orgId}/settings`;

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title={title}
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: parentLabel, href: parentHref || settingsHref, active: false },
                    { label: breadcrumbLabel, href: "#", active: true }
                ]}
            />
            <div className="p-4 lg:p-6">
                <EmptyState
                    icon={HelpCircle}
                    title={title}
                    description={description}
                    className="min-h-[400px] border rounded-lg bg-card"
                    actionLabel="Go back to settings"
                    onAction={() => window.history.back()}
                />
            </div>
        </div>
    )
}
