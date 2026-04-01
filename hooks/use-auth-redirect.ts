"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export const useAuthRedirect = () => {
    const router = useRouter();
    const { access, account } = useAuthStore();

    useEffect(() => {
        if (access && account) {
            if (account.accountType === "client") {
                router.push("/select-organization");
            } else {
                router.push("/internal");
            }
        }
    }, [access, account, router]);
};
