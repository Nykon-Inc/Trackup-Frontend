import { useMutation, useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { setCookie } from "nookies";
import { routes } from "@/services/routes";
import {
    LoginPayloadInterface,
    LoginResultInterface,
    ForgotPasswordPayloadInterface,
    ResetPasswordPayloadInterface,
    LogoutPayloadInterface,
    VerifyPayloadInterface,
} from "@/interfaces/auth.interfaces";
import { cookieKey, useAuthStore } from "@/stores/auth.store";
import { InvitationData } from "@/interfaces/users.interfaces";

export const useLogin = () => {
    const { setAccount, setAccess, setOrganization, setPermissions } = useAuthStore();

    return useMutation({
        mutationFn: async (payload: LoginPayloadInterface) => {
            const data = await http.post({
                url: routes.auth.login,
                body: payload,
            });
            return data as LoginResultInterface;
        },
        onSuccess: (data) => {
            setAccount(data.account);
            setAccess(data.credentials);
            if (data.account.accountType === "client" && data.organization) {
                setOrganization(data.organization);
            }
            if (data.account.accountType === "internal" && data.permissions) {
                setPermissions(data.permissions);
                setCookie(null, "PERMISSIONS", JSON.stringify(data.permissions), {
                    path: "/",
                });
            }
            setCookie(null, cookieKey, data.credentials.access.token, {
                path: "/",
            });


        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const data = await http.post({
                url: routes.auth.register,
                body: payload,
            });
            return data as LoginResultInterface;
        },
    });
};

export const useVerify = () => {
    const { setAccount, setAccess, setOrganization, setPermissions } = useAuthStore();

    return useMutation({
        mutationFn: async (payload: VerifyPayloadInterface) => {
            const data = await http.post({
                url: routes.auth.verify,
                body: payload,
            });
            return data as LoginResultInterface;
        },
        onSuccess: (data) => {
            setAccount(data.account);
            setAccess(data.credentials);
            if (data.account.accountType === "client" && data.organization) {
                setOrganization(data.organization);
            }
            if (data.account.accountType === "internal" && data.permissions) {
                setPermissions(data.permissions);
                setCookie(null, "PERMISSIONS", JSON.stringify(data.permissions), {
                    path: "/",
                });
            }
            setCookie(null, cookieKey, data.credentials.access.token, {
                path: "/",
            });
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (payload: ForgotPasswordPayloadInterface) => {
            return await http.post({
                url: routes.auth.forgotPassword,
                body: payload,
            });
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (payload: ResetPasswordPayloadInterface) => {
            return await http.post({
                url: routes.auth.resetPassword,
                body: payload,
            });
        },
    });
};

export const useLogout = () => {
    return useMutation({
        mutationFn: async (payload: LogoutPayloadInterface) => {
            return await http.post({
                url: routes.auth.logout,
                body: payload,
            });
        },
        onSuccess: () => {
            localStorage.clear();
            window.location.href = "/login";
        },
    });
};


export const useValidateInvitation = (params: { token: string; type: string }) => {
    return useQuery({
        queryKey: ["validate-invitation", params],
        queryFn: async () => {
            const data = await http.get({
                url: routes.auth.invitation,
                query: params,
            });
            return data as InvitationData;
        },
        enabled: !!params.token && !!params.type,
        retry: false,
    });
};

export const useRejectInvitation = () => {
    return useMutation({
        mutationFn: async (payload: { token: string, type: string }) => {
            return await http.post({
                url: routes.auth.rejectInvitation,
                body: payload,
            });
        },
    });
};
