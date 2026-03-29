"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

export default function StripeSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { organization } = useAuthStore();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        toast.success("Payment successful! Thank you.");

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 font-outfit">Payment Successful!</h1>
                    <p className="text-slate-500">
                        Your transaction has been processed successfully. Your organization's status is being updated.
                    </p>
                </div>

                <div className="pt-6 border-t flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Redirecting to your dashboard in {countdown}s...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
