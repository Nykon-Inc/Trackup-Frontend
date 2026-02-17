import { useMutation, useQuery } from "@tanstack/react-query"
import http from "./base"
import { routes } from "./routes"
import { IPTOPolicy } from "@/interfaces/paid-time-offs.interfaces"
import { queryClient } from "@/lib/react-query"
import { toast } from "sonner"

export const useCreatePtoPolicy = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            return await http.post({
                url: routes.organization.pTOPolicy(payload.organizationId),
                body: payload,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pto-policies"] })
            toast.success("Policy created");
        },
        onError: (error) => {
            toast.error("Failed to create policy");
        }

    })
}
export const useUpdatePtoPolicy = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            return await http.patch({
                url: routes.organization.updatePTOPolicy(payload.organizationId, payload.id),
                body: payload,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pto-policies"] })
            toast.success("Policy updated");
        },
        onError: (error) => {
            toast.error("Failed to update policy");
        }

    })
}

export const useGetPtoPolicies = (organizationId: string) => {
    return useQuery<IPTOPolicy[]>({
        queryKey: ["pto-policies"],
        queryFn: async () => {
            const data = await http.get({
                url: routes.organization.pTOPolicy(organizationId),
            })

            return data.results
        },
    })
}