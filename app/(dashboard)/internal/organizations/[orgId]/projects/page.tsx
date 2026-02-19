"use client";

import { ProjectsList } from "@/components/internal/projects/projects-list";
import { PageHeader } from "@/components/page-header";
import { useParams } from "next/navigation";

interface PageProps {
    params: {
        orgId: string;
    };
}

export default function OrganizationProjectsPage() {
    const params = useParams()
    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title="Projects"
                breadcrumbs={[
                    { label: "Dashboard", href: "/internal" },
                    { label: "Organizations", href: "/internal/organizations" },
                    { label: "Organization " + params.orgId, href: `/internal/organizations/${params.orgId}` },
                    { label: "Projects", active: true }
                ]}
            />
            <div className="p-6">
                <ProjectsList
                    organizationId={params.orgId as string}
                    basePath={`/internal/organizations/${params.orgId}/projects`}
                />
            </div>
        </div>
    );
}
