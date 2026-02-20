import { useQuery, useMutation } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { useAuthStore } from "@/stores/auth.store";
import { LoginResultInterface } from "@/interfaces/auth.interfaces";
import { setCookie } from "nookies";

// Define return types that exclude credentials since they aren't returned by these endpoints
type InternalUserResponse = Omit<LoginResultInterface, "credentials" | "organization">;
type ClientUserResponse = Omit<LoginResultInterface, "credentials" | "permissions">;

export const useFetchLoggedinInternalUser = () => {
    const { setAccount, setPermissions } = useAuthStore();

    return useQuery({
        queryKey: ["me", "internal"],
        queryFn: async () => {
            const data = await http.get({
                url: routes.users.meInternal,
            }) as InternalUserResponse;

            if (data.account) {
                setAccount(data.account);
            }
            if (data.permissions) {
                setPermissions(data.permissions);
                setCookie(null, "PERMISSIONS", JSON.stringify(data.permissions), {
                    path: "/",
                });
            }

            return data;
        },
    });
};

export const useFetchLoggedinClientUser = () => {
    const { setAccount, setOrganization } = useAuthStore();

    return useQuery({
        queryKey: ["me", "client"],
        queryFn: async () => {
            const data = await http.get({
                url: routes.users.meClient,
            }) as ClientUserResponse;

            if (data.account) {
                setAccount(data.account);
            }
            if (data.organization) {
                setOrganization(data.organization);
            }

            return data;
        },
    });
};

export const useFetchInternalUsers = (params?: any) => {
    return useQuery({
        queryKey: ["internal-users", params],
        queryFn: async () => {
            return await http.get({
                url: routes.users.internal,
                query: params,
            });
        },
    });
};

export const useCreateInternalUser = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            return await http.post({
                url: routes.users.internal,
                body: data,
            });
        },
    });
};

export const useResetUserPassword = () => {
    return useMutation({
        mutationFn: async ({ userId, password }: { userId: string, password: string }) => {
            return await http.post({
                url: routes.users.internalResetPassword(userId),
                body: { password },
            });
        },
    });
};

export const useDisableUser = () => {
    return useMutation({
        mutationFn: async (userId: string) => {
            return await http.post({
                url: routes.users.internalDisable(userId),
                body: {},
            });
        },
    });
};

export const useRestoreUser = () => {
    return useMutation({
        mutationFn: async (userId: string) => {
            return await http.post({
                url: routes.users.internalRestore(userId),
                body: {},
            });
        },
    });
};
export const useUpdateInternalUser = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            return await http.patch({
                url: routes.users.internalUpdate(id),
                body: data,
            });
        },
    });
};
