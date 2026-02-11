import qs from "query-string";
import axios from "axios";

import type {
    IPut,
    IGet,
    IPost,
    IPatch,
    IDelete,
    IPostMultipart,
} from "@/interfaces/IAxios";
import { useAuthStore } from "@/stores/auth.store";
import { redirect } from "next/navigation";

class HttpFacade {
    private http;
    private httpMultipart;

    private baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    constructor() {
        this.http = axios.create({
            baseURL: this.baseUrl,
            headers: { "Content-Type": "application/json" },
        });
        this.httpMultipart = axios.create({
            baseURL: this.baseUrl,
            headers: { "Content-Type": "multipart/form-data" },
        });

        this.setupRequirements();
    }

    private async setupRequirements() {
        let isRefreshing = false;
        let refreshPromise: Promise<string> | null = null;
        let failedQueue: {
            resolve: (token: string) => void;
            reject: (err: any) => void;
        }[] = [];
        this.http.interceptors.request.use(
            (config) => {
                if (!config.headers.get("Authorization")) {
                    if (typeof window !== "undefined") {
                        // Access the Zustand store only on the client-side
                        try {
                            const { access } =
                                useAuthStore.getState();
                            const token =
                                access?.token;

                            if (token) {
                                config.headers["Authorization"] = `Bearer ${token}`;
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
                return config;
            },
            (error) => Promise.reject(error),
        );

        this.httpMultipart.interceptors.request.use(
            (config) => {
                if (!config.headers.get("Authorization")) {
                    if (typeof window !== "undefined") {
                        // Access the Zustand store only on the client-side
                        try {
                            const { access } =
                                useAuthStore.getState();
                            const token =
                                access?.token;

                            if (token) {
                                config.headers["Authorization"] = `Bearer ${token}`;
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
                return config;
            },
            (error) => Promise.reject(error),
        );

        const refreshToken = async () => {
            try {
                const { refresh } = useAuthStore.getState();
                if (!refresh?.token) {
                    throw new Error("invalid refresh token");
                }
                const response = await this.http.post("/auth/refresh-tokens", {
                    refreshToken: refresh?.token,
                });
                const newTokens = response.data.tokens; // Assuming your API returns a new token
                useAuthStore.setState({
                    access: newTokens.access,
                    refresh: newTokens.refresh,
                });
                return newTokens.access.token;
            } catch (error) {
                console.error("Error refreshing token:", error);
                throw error; // Throw error to be caught where refreshToken is called
            }
        };

        const processQueue = (error: any, token: string | null = null) => {
            failedQueue.forEach((prom) => {
                if (token) {
                    prom.resolve(token);
                } else {
                    prom.reject(error);
                }
            });
            failedQueue = [];
        };

        const refreshTokenWithQueue = async (): Promise<string> => {
            if (isRefreshing && refreshPromise) {
                // Return a promise that resolves when the current refresh finishes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });
            }

            isRefreshing = true;
            const { refresh } = useAuthStore.getState();

            if (!refresh?.token) {
                isRefreshing = false;
                throw new Error("Invalid refresh token");
            }

            refreshPromise = new Promise(async (resolve, reject) => {
                try {
                    const response = await this.http.post("/auth/refresh-tokens", {
                        refreshToken: refresh?.token,
                    });
                    const newTokens = response.data.credentials;
                    const newUser = response.data.user;
                    const newOrganization = response.data.organization;
                    useAuthStore.setState({
                        access: newTokens.access,
                        refresh: newTokens.refresh,
                        account: newUser,
                        organization: newOrganization,
                    });
                    processQueue(null, newTokens.access.token);
                    resolve(newTokens.access.token);
                } catch (err) {
                    processQueue(err, null);
                    reject(err);
                } finally {
                    isRefreshing = false;
                    refreshPromise = null;
                }
            });
            const token = await refreshPromise;
            return token;
        };

        this.http.interceptors.response.use(
            async (response) => {
                return response;
            },
            async (error) => {
                const { response } = error;
                const originalRequest = error.config;
                if (response && response.data) {
                    if (response.data.code === 110) {
                        // token revoked, log user out
                        if (typeof window !== undefined) {
                            window.location.href = "/logout?code=access_revoked";
                        } else {
                            redirect("/logout");
                        }
                    } else if (response.data.code === 401 && !originalRequest._retry) {
                        // expired access token
                        originalRequest._retry = true;
                        try {
                            const newToken = await refreshTokenWithQueue();
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return this.http(originalRequest);
                        } catch (error) {
                            // Handle token refresh error
                            if (typeof window !== undefined) {
                                window.location.href = "/logout?code=access_revoked";
                            } else {
                                redirect("/logout");
                            }
                            // For example, log the user out or redirect to login page
                            console.error("Error refreshing token:", error);
                            // Redirect to login page or log the user out
                        }
                    }
                    return Promise.reject(response.data);
                }
            },
        );

        this.httpMultipart.interceptors.response.use(
            async (response) => {
                return response;
            },
            async (error) => {
                const { response } = error;
                const originalRequest = error.config;
                if (response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newToken = await refreshToken();
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return this.http(originalRequest);
                    } catch (error) {
                        // Handle token refresh error
                        if (typeof window !== undefined) {
                            window.location.href = "/auth/logout";
                        } else {
                            redirect("/auth/logout");
                        }
                        // For example, log the user out or redirect to login page
                        console.error("Error refreshing token:", error);
                        // Redirect to login page or log the user out
                    }
                }
                return Promise.reject(response.data);
            },
        );
    }

    upload = async ({ url, data, headers = {} }: IPostMultipart) => {
        const response = await this.httpMultipart.post(url, data, { headers });
        return response.data;
    };

    post = async ({ url, body, headers = {}, query = {} }: IPost) => {
        let py = { ...body };
        const queryString = qs.stringify({ ...query });
        const response = await this.http.post(`${url + "?" + queryString}`, py, {
            headers,
        });
        return response.data;
    };

    postEntire = async ({ url, body, headers = {} }: IPost) => {
        let py = { ...body };
        const response = await this.http.post(url, py, { headers });

        return response;
    };

    patch = async ({ url, body, headers = {} }: IPatch) => {
        let py = { ...body };
        const response = await this.http.patch(url, py, { headers });
        return response.data;
    };

    get = async ({ url, query = {}, body = {}, headers = {} }: IGet) => {
        let py = { ...query };
        const queryString = qs.stringify(py);
        const response = await this.http.get(`${url + "?" + queryString}`, {
            headers,
        });
        return response.data;
    };

    getBlob = async ({ url, query = {}, headers = {} }: IGet) => {
        let py = { ...query };
        const queryString = qs.stringify(py);
        const response = await this.http.get(`${url + "?" + queryString}`, {
            headers,
            responseType: "blob",
        });
        const disposition = response.headers["content-disposition"];
        let filename = "downloaded_file.csv"; // Default filename
        if (disposition && disposition.indexOf("attachment") !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, "");
            }
        }
        return { data: response.data, filename };
    };

    delete = async ({ url, body = {}, headers = {} }: IDelete) => {
        const response = await this.http.delete(url, { headers, data: body });
        return response.data;
    };

    put = async ({ url, body, headers = {} }: IPut) => {
        let py = { ...body };
        const response = await this.http.put(url, py, { headers });
        return response.data;
    };
}

const http = new HttpFacade();

export default http;
