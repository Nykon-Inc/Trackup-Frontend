import { useMutation, useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { queryClient } from "@/lib/react-query";
import {
    Ticket,
    TicketMessage,
    CreateTicketPayload,
    ListTicketsParams,
    UpdateTicketPayload,
    AddMessagePayload,
    TicketStatus,
    TicketPriority
} from "@/interfaces/tickets.interfaces";
import { PaginatedResult } from "@/interfaces/common.interface";

// Client Hooks

export const useCreateTicket = () => {
    return useMutation({
        mutationFn: async ({ organizationId, ...payload }: CreateTicketPayload & { organizationId: string }) => {
            const formData = new FormData();
            formData.append("title", payload.title);
            formData.append("description", payload.description);
            if (payload.priority) formData.append("priority", payload.priority);
            if (payload.attachments) {
                payload.attachments.forEach((file) => formData.append("attachments", file));
            }
            const data = await http.upload({
                url: routes.tickets.client.index(organizationId),
                data: formData,
            });
            return data as Ticket;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["client-tickets"] });
        },
    });
};

export const useGetTickets = (params: ListTicketsParams = {}) => {
    return useQuery({
        queryKey: ["client-tickets", params],
        queryFn: async () => {
            if (!params.organizationId) throw new Error("organizationId is required");
            const data = await http.get({
                url: routes.tickets.client.index(params.organizationId),
                query: params,
            });
            return data as PaginatedResult<Ticket>;
        },
        enabled: !!params.organizationId,
    });
};

export const useGetTicket = (id: string, organizationId: string) => {
    return useQuery({
        queryKey: ["client-ticket", id],
        queryFn: async () => {
            const data = await http.get({
                url: routes.tickets.client.detail(organizationId, id),
            });
            return data as Ticket;
        },
        enabled: !!id && !!organizationId,
    });
};

export const useUpdateTicket = () => {
    return useMutation({
        mutationFn: async ({ id, organizationId, ...payload }: UpdateTicketPayload & { id: string; organizationId: string }) => {
            const data = await http.patch({
                url: routes.tickets.client.detail(organizationId, id),
                body: payload,
            });
            return data as Ticket;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["client-tickets"] });
            queryClient.invalidateQueries({ queryKey: ["client-ticket", id] });
        },
    });
};

export const useResolveTicket = () => {
    return useMutation({
        mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
            const data = await http.post({
                url: routes.tickets.client.resolve(organizationId, id),
                body: {},
            });
            return data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["client-tickets"] });
            queryClient.invalidateQueries({ queryKey: ["client-ticket", id] });
        },
    });
};

export const useReopenTicket = () => {
    return useMutation({
        mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
            const data = await http.post({
                url: routes.tickets.client.reopen(organizationId, id),
                body: {},
            });
            return data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["client-tickets"] });
            queryClient.invalidateQueries({ queryKey: ["client-ticket", id] });
        },
    });
};

export const useAddTicketMessage = () => {
    return useMutation({
        mutationFn: async ({ ticketId, organizationId, ...payload }: AddMessagePayload & { ticketId: string; organizationId: string }) => {
            const formData = new FormData();
            formData.append("message", payload.message);
            if (payload.attachments) {
                payload.attachments.forEach((file) => formData.append("attachments", file));
            }
            const data = await http.upload({
                url: routes.tickets.client.messages(organizationId, ticketId),
                data: formData,
            });
            return data as TicketMessage;
        },
        onSuccess: (_, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: ["client-ticket-messages", ticketId] });
            queryClient.invalidateQueries({ queryKey: ["client-ticket", ticketId] });
        },
    });
};

export const useGetTicketMessages = (ticketId: string, organizationId: string) => {
    return useQuery({
        queryKey: ["client-ticket-messages", ticketId],
        queryFn: async () => {
            const data = await http.get({
                url: routes.tickets.client.messages(organizationId, ticketId),
            });
            return data as TicketMessage[];
        },
        enabled: !!ticketId && !!organizationId,
    });
};

export const useGetTicketsInternal = (params: ListTicketsParams = {}) => {
    return useQuery({
        queryKey: ["internal-tickets", params],
        queryFn: async () => {
            const { acct, ...rest } = params
            const data = await http.get({
                url: routes.tickets.internal.index,
                query: rest,
            });
            return data as PaginatedResult<Ticket>;
        },
    });
};


export const useGetTicketInternal = (id: string) => {
    return useQuery({
        queryKey: ["internal-ticket", id],
        queryFn: async () => {
            const data = await http.get({
                url: routes.tickets.internal.detail(id),
            });
            return data as Ticket;
        },
        enabled: !!id,
    });
};

export const useUpdateTicketInternal = () => {
    return useMutation({
        mutationFn: async ({ id, ...payload }: UpdateTicketPayload & { id: string }) => {
            const data = await http.patch({
                url: routes.tickets.internal.detail(id),
                body: payload,
            });
            return data as Ticket;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["internal-tickets"] });
            queryClient.invalidateQueries({ queryKey: ["internal-ticket", id] });
        },
    });
};

export const useResolveTicketInternal = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const data = await http.post({
                url: routes.tickets.internal.resolve(id),
                body: {},
            });
            return data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["internal-tickets"] });
            queryClient.invalidateQueries({ queryKey: ["internal-ticket", id] });
        },
    });
};

export const useReopenTicketInternal = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const data = await http.post({
                url: routes.tickets.internal.reopen(id),
                body: {},
            });
            return data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["internal-tickets"] });
            queryClient.invalidateQueries({ queryKey: ["internal-ticket", id] });
        },
    });
};

export const useAddTicketMessageInternal = () => {
    return useMutation({
        mutationFn: async ({ ticketId, ...payload }: AddMessagePayload & { ticketId: string }) => {
            const formData = new FormData();
            formData.append("message", payload.message);
            if (payload.attachments) {
                payload.attachments.forEach((file) => formData.append("attachments", file));
            }
            const data = await http.upload({
                url: routes.tickets.internal.messages(ticketId),
                data: formData,
            });
            return data as TicketMessage;
        },
        onSuccess: (_, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: ["internal-ticket-messages", ticketId] });
            queryClient.invalidateQueries({ queryKey: ["internal-ticket", ticketId] });
        },
    });
};

export const useGetTicketMessagesInternal = (ticketId: string) => {
    return useQuery({
        queryKey: ["internal-ticket-messages", ticketId],
        queryFn: async () => {
            const data = await http.get({
                url: routes.tickets.internal.messages(ticketId),
            });
            return data as TicketMessage[];
        },
        enabled: !!ticketId,
    });
};
