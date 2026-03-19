import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { useAuthStore } from "@/stores/auth.store";
import { LoginResultInterface } from "@/interfaces/auth.interfaces";
import { setCookie } from "nookies";

// Define return types that exclude credentials since they aren't returned by these endpoints
type InternalUserResponse = Omit<LoginResultInterface, "credentials" | "organization">;
type ClientUserResponse = Omit<LoginResultInterface, "credentials" | "permissions">;

const getMyProfileImageRoute = (accountType?: "client" | "internal") => {
    return accountType === "internal" ? routes.users.meProfileImageInternal : routes.users.meProfileImageClient;
};

const getMyProfileRoute = (accountType?: "client" | "internal") => {
    return accountType === "internal" ? routes.users.meProfileInternal : routes.users.meProfileClient;
};

const getMyTwoFactorRoute = (accountType?: "client" | "internal") => {
    return accountType === "internal" ? routes.users.meTwoFactorInternal : routes.users.meTwoFactorClient;
};

const getMyPasswordRoute = (accountType?: "client" | "internal") => {
    return accountType === "internal" ? routes.users.mePasswordInternal : routes.users.mePasswordClient;
};

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

export const useFetchInternalUsers = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: ["internal-users", params],
        queryFn: async () => {
            return await http.get({
                url: routes.users.internal,
                query: params,
            });
        },
        placeholderData: keepPreviousData,
    });
};

export const useCreateInternalUser = () => {
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
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
        mutationFn: async ({ id, data }: { id: string, data: Record<string, unknown> }) => {
            return await http.patch({
                url: routes.users.internalUpdate(id),
                body: data,
            });
        },
    });
};

export const useSaveOrEditMyProfileImage = () => {
    return useMutation({
        mutationFn: async ({ image, fileExt }: { image: string; fileExt?: string }) => {
            const accountType = useAuthStore.getState().account?.accountType;
            return await http.post({
                url: getMyProfileImageRoute(accountType),
                body: { image, fileExt },
            });
        },
    });
};

export const useDeleteMyProfileImage = () => {
    return useMutation({
        mutationFn: async () => {
            const accountType = useAuthStore.getState().account?.accountType;
            return await http.delete({
                url: getMyProfileImageRoute(accountType),
            });
        },
    });
};

export const useUpdateMyTwoFactor = () => {
    return useMutation({
        mutationFn: async ({ enabled }: { enabled: boolean }) => {
            const accountType = useAuthStore.getState().account?.accountType;
            return await http.patch({
                url: getMyTwoFactorRoute(accountType),
                body: { enabled },
            });
        },
    });
};

export const useUpdateMyProfile = () => {
    return useMutation({
        mutationFn: async ({ name, phoneNumber }: { name: string; phoneNumber: string }) => {
            const accountType = useAuthStore.getState().account?.accountType;
            return await http.patch({
                url: getMyProfileRoute(accountType),
                body: { name, phoneNumber },
            });
        },
    });
};

export const useChangeMyPassword = () => {
    return useMutation({
        mutationFn: async ({ currentPassword, password }: { currentPassword: string; password: string }) => {
            const accountType = useAuthStore.getState().account?.accountType;
            return await http.patch({
                url: getMyPasswordRoute(accountType),
                body: { currentPassword, password },
            });
        },
    });
};
