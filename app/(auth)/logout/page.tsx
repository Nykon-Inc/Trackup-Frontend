"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { destroyCookie } from "nookies";
import { useAuthStore, cookieKey } from "@/stores/auth.store";

export default function LogoutPage() {
    const router = useRouter();
    const clearStore = useAuthStore((state) => state.clearStore);

    useEffect(() => {
        // Destroy the store
        clearStore();
        useAuthStore.persist.clearStorage();

        // Destroy cookies
        destroyCookie(null, cookieKey, { path: '/' });
        destroyCookie(null, "ACCOUNT_TYPE", { path: '/' });

        // Redirect to login
        router.push("/login"); // or / (auth) which redirects to login
    }, [router, clearStore]);

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Logging out...</p>
        </div>
    );
}
