export const routes = {
    auth: {
        login: "/auth/login",
        register: "/auth/register-company",
        verify: "/auth/verify",
        acceptInvite: "/auth/accept-invite",
        logout: "/auth/logout",
        forgotPassword: "/auth/forgot-password",
        resetPassword: "/auth/finish-reset-password",
        refreshToken: "/auth/refresh-tokens",
        verifyOnboardingToken: "/auth/verify-onboarding-token",
        verifyResetToken: "/auth/verify-reset-token",
        setupPassword: "/client/users/setup-password",
        verifyRegistration: "/auth/verify-registration",
        selectOrganization: "/auth/select-organization",
    },
    organization: {
        index: "/client/organizations",
        me: "/client/organizations/me",
        internalCreate: "/internal/organizations",
        internalDetail: (id: string) => `/internal/organizations/${id}`, // Used for DELETE (disable)
        internalEnable: (id: string) => `/internal/organizations/${id}/enable`,
        internalResendInvite: (id: string) => `/internal/organizations/${id}/resend-invite`,
        bulkInvite: (id: string) => `/client/organizations/${id}/bulk-invite`,
        hubstaffAuth: (id: string) => `/client/organizations/${id}/hubstaff/auth`,
        hubstaffExchangeToken: (id: string) => `/client/organizations/${id}/hubstaff/exchange-token`,
        hubstaffProjects: (id: string) => `/client/organizations/${id}/hubstaff/projects`,
    },
    projects: {
        index: "/client/projects",
        invite: "/invite", // Used as suffix
        me: "/projects/me",
        meInternal: "/internal/projects",
    },
    users: {
        index: "/users",
        meInternal: "/internal/users/me",
        meClient: "/client/users/me",
        internal: "/internal/users",
        internalResetPassword: (id: string) => `/internal/users/${id}/reset-password`,
        internalDisable: (id: string) => `/internal/users/${id}/disable`,
        internalRestore: (id: string) => `/internal/users/${id}/restore`,
        internalUpdate: (id: string) => `/internal/users/${id}`,
    },
    sessions: {
        index: "/sessions",
        aggregated: "/aggregated",
    },
    activityLogs: {
        latest: "/internal/activity-logs/latest",
    },
    analytics: {
        stats: "/internal/analytics/stats",
    },
    rbac: {
        roles: "/internal/rbac/roles",
    }
}