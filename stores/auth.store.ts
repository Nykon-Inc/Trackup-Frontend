import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { IAuthStore } from "@/interfaces/auth.interfaces";
export const cookieKey = "AUTH_TOKEN_WATCHTOWER";

export const useAuthStore = create(
    persist<IAuthStore>(
        (set, get) => ({
            setAccount: (obj) => set({ account: obj }),
            setAccess: (obj) => {
                set({ access: obj.access, refresh: obj.refresh });
            },
            setOrganization: (obj) => {
                set({ organization: obj });
            },
            setPermissions: (permissions) => set({ permissions }),
            clearStore: () => set({ account: undefined, access: undefined, refresh: undefined, organization: undefined, permissions: undefined }),
        }),
        {
            name: "watchtower-auth-storage",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
