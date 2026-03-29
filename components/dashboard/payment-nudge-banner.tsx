"use client";

import { useWorkspace } from "@/components/providers/workspace-provider";
import { OrganizationMemberRole } from "@/interfaces/organizations.interfaces";
import { useCreateSetupSession } from "@/services/billing.services";
import { CreditCard, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PaymentNudgeBanner() {
    const { activeOrg } = useWorkspace();
    const [isVisible, setIsVisible] = useState(true);
    const createSession = useCreateSetupSession();

    if (!activeOrg || !isVisible) return null;

    // Only show to owners and managers
    const isPrivileged =
        activeOrg.role === OrganizationMemberRole.OWNER ||
        activeOrg.role === OrganizationMemberRole.MANAGER;

    if (!isPrivileged) return null;

    const organization = activeOrg.organization;

    // Check if nudge is needed (setup fee not paid OR no payment integrations)
    const needsSetupFee = organization.setupFeePaid === false;

    if (!needsSetupFee) return null;

    const handleAction = async () => {
        if (needsSetupFee) {
            try {
                toast.loading("Redirecting to checkout...", { id: "setup-session" });
                const { url } = await createSession.mutateAsync({ organizationId: organization.id });
                if (url) {
                    window.location.href = url;
                } else {
                    toast.error("Failed to generate payment session.", { id: "setup-session" });
                }
            } catch (error) {
                toast.error("An error occurred. Please try again.", { id: "setup-session" });
            }
        } else {
            // Just go to billing settings
            window.location.href = `/dashboard/${organization.id}/settings/billing`;
        }
    };

    return (
        <div className="bg-amber-50/80 backdrop-blur-sm border-b border-amber-100/50 px-4 py-1.5 transition-all group overflow-hidden relative">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 min-h-6 relative">
                <div className="flex items-center gap-2 justify-center flex-1">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        {createSession.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-center">
                        <p className="text-[13px] font-medium text-amber-900 leading-none">
                            {needsSetupFee
                                ? "Organization setup fee payment required."
                                : "Add a payment method to ensure uninterrupted service."}
                        </p>
                        <button
                            onClick={handleAction}
                            disabled={createSession.isPending}
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2 transition-colors inline-block leading-none disabled:opacity-50"
                        >
                            {needsSetupFee ? "Pay Setup Fee" : "Configure Billing"}
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-amber-400 hover:text-amber-600 transition-colors p-1 rounded-md hover:bg-amber-100/50 absolute right-0"
                    aria-label="Dismiss banner"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-y-0 -left-full w-1/3 bg-linear-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-[shimmer_8s_infinite] transition-all" />
            </div>
        </div>
    );
}

// Add shimmer animation to global CSS if not present, 
// or I can just use a tailwind class if defined. 
// For now I'll just use simple classes.
