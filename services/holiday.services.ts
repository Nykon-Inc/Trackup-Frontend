import { useMutation, useQuery } from "@tanstack/react-query";
import http from "./base";
import { routes } from "./routes";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import { IHoliday } from "@/interfaces/holiday.interfaces";

export const useGetHolidays = (organizationId: string, year: number) => {
    return useQuery<IHoliday>({
        queryKey: ["holidays", organizationId, year],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.holidays(organizationId),
                query: { year },
            });
            return data;
        },
    });
}

export const useCreateHoliday = (organizationId: string) => {
    return useMutation({
        mutationFn: async (payload: any) => {
            return await http.post({
                url: routes.organization.holidays(organizationId),
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
            toast.success("Holiday created");
        },
        onError: (error) => {
            console.error("Failed to create holiday:", error);
            toast.error(`Failed to create holiday:${error.message}`);
        },
    });
}

export const useUpdateHoliday = (organizationId: string,) => {
    return useMutation({
        mutationFn: async (payload: { holidayId: string, name?: string, date?: string }) => {
            return await http.patch({
                url: routes.organization.holiday(organizationId, payload.holidayId),
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
            toast.success("Holiday updated");
        },
        onError: (error) => {
            console.error("Failed to update holiday:", error);
            toast.error(`Failed to update holiday:${error.message}`);
        },
    });
}

export const useDeleteHoliday = (organizationId: string) => {
    return useMutation({
        mutationFn: async (holidayId: string) => {
            return await http.delete({
                url: routes.organization.holiday(organizationId, holidayId),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
            toast.success("Holiday deleted");
        },
        onError: (error) => {
            console.error("Failed to delete holiday:", error);
            toast.error(`Failed to delete holiday:${error.message}`);
        },
    });
}