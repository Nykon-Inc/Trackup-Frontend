
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetMyOrganizations } from "@/services/organization.services";
import { OrganizationMember } from "@/interfaces/organizations.interfaces";
import { useGetProjects } from "@/services/projects.services";
import { Project, ProjectDetails } from "@/interfaces/projects.interfaces";
import { useAuthStore } from "@/stores/auth.store";

interface WorkspaceContextType {
    activeOrgId: string | null;
    activeProjectId: string | null;
    activeOrg: OrganizationMember | null;
    activeProject: ProjectDetails | null;
    isLoading: boolean;
    organizations: OrganizationMember[];
    projects: Project[]; // Simplified list
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
    const params = useParams();
    const router = useRouter();
    const orgId = params?.orgId as string | undefined;
    const projectId = params?.projectId as string | undefined;
    const { account } = useAuthStore()
    const [activeOrg, setActiveOrg] = useState<OrganizationMember | null>(null);
    const [activeProject, setActiveProject] = useState<ProjectDetails | null>(null);

    // Fetch User's Organizations
    const { data: organizations, isLoading: isLoadingOrgs } = useGetMyOrganizations(account?.id);

    // Fetch Projects for the active Org
    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({
        organizationId: orgId || "",
        query: {
            page: 1,
            limit: 10
        }
    });

    useEffect(() => {
        if (organizations && orgId) {
            const org = organizations.find((o) => o.organization.id === orgId);
            setActiveOrg(org || null);
        } else {
            setActiveOrg(null);
        }
    }, [organizations, orgId]);

    return (
        <WorkspaceContext.Provider
            value={{
                activeOrgId: orgId || null,
                activeProjectId: projectId || null,
                activeOrg,
                activeProject,
                isLoading: isLoadingOrgs || isLoadingProjects,
                organizations: organizations || [],
                projects: projectsData?.results || [],
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider");
    }
    return context;
};
