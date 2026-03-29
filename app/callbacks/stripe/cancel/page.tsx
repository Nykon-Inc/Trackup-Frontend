"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

export default function StripeCancelPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { organization } = useAuthStore();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        toast.info("Payment was canceled. No charges were made.");

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const redirectTimer = setTimeout(() => {
            const orgId = searchParams.get("organization_id") || organization?.id;
            if (orgId) {
                router.push(`/dashboard/${orgId}`);
            } else {
                router.push("/dashboard");
            }
        }, 3000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirectTimer);
        };
    }, [organization, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                        <XCircle className="w-8 h-8" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h1 className="text-xl font-bold text-slate-900 font-outfit">Payment Canceled</h1>
                    <p className="text-slate-500 text-sm">
                        You've canceled the checkout session. No charges were applied to your account.
                    </p>
                </div>

                <div className="pt-4 border-t">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Returning to billing in {countdown}s...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
