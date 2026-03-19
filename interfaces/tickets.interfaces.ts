import { Account } from "./auth.interfaces";

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export interface TicketAttachment {
    id: string;
    messageId: string;
    fileUrl: string;
    fileKey: string;
    metadata?: any;
    uploadedBy: string; // userId
    createdAt: string;
    updatedAt: string;
}

export enum TicketSenderType {
    CLIENT = 'client',
    INTERNAL = 'internal'
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    message: string;
    attachments: TicketAttachment[];
    senderType: TicketSenderType
    createdAt: string;
    updatedAt: string;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority?: TicketPriority;
    createdBy: string; // userId
    organizationId: string;
    assignedTo?: string | null; // userId
    resolvedBy?: string | null; // userId
    messages?: TicketMessage[];
    attachments?: TicketAttachment[]; // Combined from messages for detail view
    createdAt: string;
    updatedAt: string;
    cc?: string[];
    // populated data
    author?: Account
    ccUsers?: Account[]
    assigned?: Account
}

export interface CreateTicketPayload {
    title: string;
    description: string;
    priority?: TicketPriority;
    attachments?: File[];
}

export interface ListTicketsParams {
    status?: string | TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
    createdBy?: string;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    search?: string;
    limit?: number;

    acct?: string
}

export interface UpdateTicketPayload {
    status?: TicketStatus;
    assignedTo?: string;
    cc?: string[];
}

export interface AddMessagePayload {
    message: string;
    attachments?: File[];
}
