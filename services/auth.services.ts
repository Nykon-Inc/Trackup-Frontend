import { useMutation } from "@tanstack/react-query";
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
    VerifyOnboardingTokenPayloadInterface,
    VerifyResetTokenPayloadInterface,
    VerifyTokenResponseInterface,
    AcceptInvitePayloadInterface,
    SetupPasswordPayloadInterface,
    SelectOrganizationPayloadInterface,
    RegisterInvitedUserPayloadInterface,
    ResendOtpPayloadInterface,
} from "@/interfaces/auth.interfaces";
import { cookieKey, useAuthStore } from "@/stores/auth.store";
import { queryClient } from "@/lib/react-query";

export const useSelectOrganization = () => {
    const { setAccount, setAccess, setOrganization, setPermissions } = useAuthStore();

    return useMutation({
        mutationFn: async (payload: SelectOrganizationPayloadInterface) => {
            const data = await http.post({
                url: routes.auth.selectOrganization,
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
            queryClient.invalidateQueries({ queryKey: ["my-organizations"] });
        },
    });
};

export const useLogin = () => {
    const { setAccount, setAccess, setOrganization, setPermissions } = useAuthStore();
    //...


    return useMutation({
        mutationFn: async (payload: LoginPayloadInterface) => {
            return http.post({
                url: routes.auth.login,
                body: payload,
            });
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

export const useResendOtp = () => {
    return useMutation({
        mutationFn: async (payload: ResendOtpPayloadInterface) => {
            return await http.post({
                url: routes.auth.resendOtp,
                body: payload,
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

export const useVerifyOnboardingToken = () => {
    return useMutation({
        mutationFn: async (payload: VerifyOnboardingTokenPayloadInterface) => {
            const data = await http.post({
                url: routes.auth.verifyOnboardingToken,
                body: payload,
            });
            return data as VerifyTokenResponseInterface;
        },
    });
};

export const useVerifyResetToken = () => {
    return useMutation({
        mutationFn: async (payload: VerifyResetTokenPayloadInterface) => {
            const data = await http.post({
                url: routes.auth.verifyResetToken,
                body: payload,
            });
            return data as VerifyTokenResponseInterface;
        },
    });
};

export const useAcceptInvite = () => {
    const { setAccount, setAccess, setOrganization, setPermissions } = useAuthStore();
    return useMutation({
        mutationFn: async (payload: AcceptInvitePayloadInterface) => {
            const data = await http.post({
                url: routes.auth.acceptInvite,
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

export const useSetupPassword = () => {
    const { setAccount, setAccess, setOrganization, setPermissions } = useAuthStore();
    return useMutation({
        mutationFn: async (payload: SetupPasswordPayloadInterface) => {
            const data = await http.post({
                url: routes.auth.setupPassword,
                body: payload,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${payload.token}`,
                },
            });
            return data as LoginResultInterface;
        },
        onSuccess: (data) => {
            // setAccount(data.account);
            // setAccess(data.credentials);
            // if (data.account.accountType === "client" && data.organization) {
            //     setOrganization(data.organization);
            // }
            // if (data.account.accountType === "internal" && data.permissions) {
            //     setPermissions(data.permissions);
            //     setCookie(null, "PERMISSIONS", JSON.stringify(data.permissions), {
            //         path: "/",
            //     });
            // }
            // setCookie(null, cookieKey, data.credentials.access.token, {
            //     path: "/",
            // });
        },
    });
};

export const useCompleteRegistration = () => {
    const { setAccount, setAccess, setOrganization, setPermissions } = useAuthStore();
    return useMutation({
        mutationFn: async (payload: { token: string }) => {
            const data = await http.post({
                url: routes.auth.verifyRegistration,
                body: {},
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${payload.token}`,
                },
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

export const useRegisterInvitedUser = () => {
    const { setAccount, setAccess, setOrganization, setPermissions } = useAuthStore();
    return useMutation({
        mutationFn: async (payload: RegisterInvitedUserPayloadInterface) => {
            const data = await http.post({
                url: routes.auth.registerInvitedUser,
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
            queryClient.invalidateQueries({ queryKey: ["my-organizations"] });
        },
    });
};
