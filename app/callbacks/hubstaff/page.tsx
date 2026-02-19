"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useExchangeHubstaffToken } from "@/services/organization.services";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function HubstaffCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This is the orgId
    const { mutate: exchangeToken, isPending } = useExchangeHubstaffToken();
    const hasExchanged = useRef(false);

    useEffect(() => {
        if (code && state && !hasExchanged.current) {
            hasExchanged.current = true;
            exchangeToken(
                { organizationId: state, code },
                {
                    onSuccess: () => {
                        toast.success("Hubstaff connected successfully");
                        router.push(`/dashboard/${state}`);
                    },
                    onError: () => {
                        toast.error("Failed to connect Hubstaff");
                        router.push(`/dashboard/${state}`);
                    },
                }
            );
        } else if (!code || !state) {
            // If missing code or state, we can't do much but redirect to root or show error
            // Since we don't have orgId (state), we might not know where to redirect properly if state is missing.
            // But if we have state but no code, we can redirect to that org.
            if (state) {
                toast.error("Invalid callback URL");
                router.push(`/dashboard/${state}`);
            } else {
                toast.error("Invalid callback URL");
                router.push("/dashboard");
            }
        }
    }, [code, state, exchangeToken, router]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Connecting to Hubstaff...</p>
        </div>
    );
}
