"use client";

import React from "react";

import { ProjectsList } from "@/components/internal/projects/projects-list";
import { OrganizationUsersList } from "@/components/internal/organizations/users-list";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetInternalOrganization } from "@/services/organization.services";

// interface PageProps removed as it is no longer used

export default function OrganizationDetailsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = React.use(params);
    const { data: organization, isLoading } = useGetInternalOrganization(orgId);

    const organizationName = organization?.name || `Organization ${orgId}`;

    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title={organizationName}
                breadcrumbs={[
                    { label: "Dashboard", href: "/internal" },
                    { label: "Organizations", href: "/internal/organizations" },
                    { label: organizationName, active: true },
                ]}
            />
            <div className="p-6">
                <Tabs defaultValue="users" className="w-full">
                    <TabsList>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users" className="mt-4">
                        <OrganizationUsersList organizationId={orgId} />
                    </TabsContent>
                    <TabsContent value="projects" className="mt-4">
                        <ProjectsList
                            organizationId={orgId}
                            basePath={`/internal/organizations/${orgId}/projects`}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
