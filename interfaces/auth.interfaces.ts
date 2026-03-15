import { OrganizationMember, OrganizationInvitation } from "./organizations.interfaces";
import { ProjectMembership } from "./projects.interfaces";

export interface LoginPayloadInterface {
    email: string;
    password: string;
}

export interface VerifyPayloadInterface {
    email: string;
    otp: string;
}

export interface ResendOtpPayloadInterface {
    email: string;
}

export interface VerifyOnboardingTokenPayloadInterface {
    token: string;
}

export interface VerifyResetTokenPayloadInterface {
    token: string;
}

export interface VerifyTokenResponseInterface {
    flowType: 'signup' | 'setup' | 'acceptance';
    email: string;
    invitation?: OrganizationInvitation;
    organizationId: string;
    user: Account | null;
    organizationMembership: OrganizationMember | null;
    projectMembership?: ProjectMembership | null;
}

export interface SetupPasswordPayloadInterface {
    token: string;
    password?: string;
}

export interface AcceptInvitePayloadInterface {
    token: string;
    password?: string;
    name?: string;
}

export interface RegisterInvitedUserPayloadInterface {
    name: string;
    password: string;
    token: string;
}

export interface LoginResultInterface {
    account: Account;
    organization?: Organization | null;
    credentials: Access;
    permissions: string[];
}

export interface RefreshTokensPayloadInterface {
    refreshToken: string;
}

export interface ForgotPasswordPayloadInterface {
    email: string;
}

export interface ResetPasswordPayloadInterface {
    password: string;
    token: string;
}

export interface LogoutPayloadInterface {
    refreshToken: string;
}

export interface SelectOrganizationPayloadInterface {
    organizationId: string;
}

export interface Organization {
    id: string;
    name: string;
}


export interface Account {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    avatar?: string | null;
    avatarKey?: string | null;
    role?: string;
    accountType?: 'client' | 'internal';
    isVerified?: boolean;
    status?: 'active' | 'disabled';
    twoFactorEnabled?: boolean;
}

export interface QueryResult {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
export interface TokenPayload {
    token: string;
    expires: Date;
}

export interface Access {
    access: TokenPayload;
    refresh: TokenPayload;
}

export interface authStore {
    access?: TokenPayload;
    refresh?: TokenPayload;
    account?: Account;
    organization?: Organization;
    permissions?: string[];
}

export interface IAuthStore extends authStore {
    setAccount: (payload: Account) => void;
    setAccess: (payload: Access) => void;
    setOrganization: (payload: Organization) => void;
    setPermissions: (payload: string[]) => void;
    clearStore: () => void;
}
