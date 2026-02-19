
export interface InvitationData {
    email: string;
    organizationId?: string;
    projectId?: string;
    token: string;
    status: string;
    expiresAt: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    organization?: {
        name: string;
        domain: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        id: string;
    };
    project?: {
        name: string;
        // Add other project fields if known, otherwise generic structure is fine
        [key: string]: any;
    };
    id: string;
}
