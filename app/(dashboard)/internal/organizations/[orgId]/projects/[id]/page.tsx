"use client";

import { ProjectDetails } from "@/components/internal/projects/project-details";
import { useParams } from "next/navigation";

export default function OrganizationProjectDetailsPage() {
    const params = useParams()
    const orgId = params.orgId as string
    const id = params.id as string
    const baseBreadcrumbs = [
        { label: "Dashboard", href: "/internal" },
        { label: "Organizations", href: "/internal/organizations" },
        { label: "Projects", href: `/internal/organizations/${orgId}?tab=projects` },
    ];

    return <ProjectDetails projectId={id} baseBreadcrumbs={baseBreadcrumbs} />;
}
