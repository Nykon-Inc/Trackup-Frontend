import { Account } from "./auth.interfaces";

export enum ActivityLogType {
    PROJECT = 'project',
    ORGANIZATION = 'organization',
    USER = 'user',
    SYSTEM = 'system'
}

export enum ActivityLogAction {
    // Project Actions
    PROJECT_CREATED = 'project_created',
    PROJECT_UPDATED = 'project_updated',
    PROJECT_ARCHIVED = 'project_archived',
    PROJECT_DELETED = 'project_deleted',
    PROJECT_MEMBER_ADDED = 'project_member_added',
    PROJECT_MEMBER_REMOVED = 'project_member_removed',
    PROJECT_MEMBER_UPDATED = 'project_member_updated',

    // Auth & User Actions
    USER_LOGIN = 'user_login',
    USER_REGISTERED = 'user_registered',
    USER_PROFILE_UPDATED = 'user_profile_updated',
    USER_2FA_UPDATED = 'user_2fa_updated',
    USER_PROFILE_IMAGE_DELETED = 'user_profile_image_deleted',
    USER_PROFILE_IMAGE_UPDATED = 'user_profile_image_updated',
    USER_CREATED_INTERNAL = 'user_created_internal',
    USER_DISABLED = 'user_disabled',
    USER_ENABLED = 'user_enabled',
    USER_PASSWORD_RESET = 'user_password_reset',
    USER_PASSWORD_CHANGED = 'user_password_changed',

    // Timesheet Actions
    TIMESHEET_UPDATED = 'timesheet_updated',
    TIMESHEET_DELETED = 'timesheet_deleted',

    // PTO Actions
    PTO_REQUEST_CREATED = 'pto_request_created',
    PTO_REQUEST_UPDATED = 'pto_request_updated',
    PTO_POLICY_CREATED = 'pto_policy_created',
    PTO_POLICY_UPDATED = 'pto_policy_updated',

    // Holiday Actions
    HOLIDAY_CREATED = 'holiday_created',
    HOLIDAY_UPDATED = 'holiday_updated',
    HOLIDAY_DELETED = 'holiday_deleted',

    // Organization Actions
    ORG_CREATED = 'org_created',
    ORG_UPDATED = 'org_updated',
    ORG_ENABLED = 'org_enabled',
    ORG_DISABLED = 'org_disabled',
    ORG_MEMBER_INVITED = 'org_member_invited',
    ORG_MEMBER_ADDED = 'org_member_added',
    ORG_MEMBER_UPDATED = 'org_member_updated',
    ORG_MEMBER_JOINED = 'org_member_joined',
    ORG_MEMBER_REJECTED = 'org_member_rejected',
    ORG_INVITATION_UPDATED = 'org_invitation_updated',
    ORG_INVITATION_RESENT = 'org_invitation_resent',
    ORG_INVITATION_REMOVED = 'org_invitation_removed',

    // Staff Actions
    STAFF_ACTIVITY_DELETED = 'staff_activity_deleted',

    // RBAC/Governance Actions
    RBAC_OVERRIDE_ADDED = 'rbac_override_added',
    RBAC_OVERRIDE_REMOVED = 'rbac_override_removed',
    RBAC_ROLE_PERMISSION_TOGGLED = 'rbac_role_permission_toggled'
}

export enum ActivityTargetType {
    USER = 'user',
    PROJECT = 'project',
    ORGANIZATION = 'organization',
    TIMESHEET = 'timesheet',
    PTO_REQUEST = 'pto_request',
    PTO_POLICY = 'pto_policy',
    HOLIDAY = 'holiday',
    INVITATION = 'invitation',
    ROLE = 'role',
    OTHER = 'other'
}

export interface IActivityLogTarget {
    id: string;
    type: ActivityTargetType;
    name?: string;
    email?: string;
    href?: string;
}

export interface IActivityLog {
    id?: string;
    _id?: string;
    type: ActivityLogType;
    action: ActivityLogAction;
    description: string;
    organizationId?: string;
    projectId?: string;
    actorId: string; // User who performed the action
    actor: Account
    targetId?: string; // ID of the entity being acted upon (e.g. user added)
    targetType?: ActivityTargetType;
    targetSnapshot?: Record<string, unknown>;
    target?: IActivityLogTarget;
    project?: { id: string; name?: string; href?: string };
    organization?: { id: string; name?: string; href?: string };
    createdAt?: string;
    metadata?: Record<string, unknown>;
}
