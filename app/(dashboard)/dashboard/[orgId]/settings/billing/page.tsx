"use client";

import { PageHeader } from "@/components/page-header";
import { useParams } from "next/navigation";
import {
    CreditCard,
    Plus,
    Trash2,
    CheckCircle2,
    Calendar,
    Star,
    AlertCircle,
    Loader2,
    MoreVertical,
    Clock,
    ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    useGetPaymentMethods,
    useSetDefaultPaymentMethod,
    useDeletePaymentMethod,
    useCreateSetupSession
} from "@/services/billing.services";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BillingSettingsPage() {
    const params = useParams();
    const orgId = params?.orgId as string;
    const { activeOrg } = useWorkspace();
    const organization = activeOrg?.organization;

    const { data: paymentMethods, isLoading: isLoadingMethods } = useGetPaymentMethods(orgId);
    const setDefaultMethod = useSetDefaultPaymentMethod();
    const deleteMethod = useDeletePaymentMethod();
    const createSetupSession = useCreateSetupSession();

    const handleAddPaymentMethod = async () => {
        try {
            toast.loading("Preparing secure checkout...", { id: "setup-session" });
            const { url } = await createSetupSession.mutateAsync({ organizationId: orgId });
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            toast.error("Failed to initiate payment setup. Please try again.", { id: "setup-session" });
        }
    };

    const handleSetDefault = async (methodId: string) => {
        try {
            await setDefaultMethod.mutateAsync({ organizationId: orgId, paymentMethodId: methodId });
            toast.success("Default payment method updated");
        } catch (error) {
            toast.error("Failed to update default payment method");
        }
    };

    const handleDelete = async (methodId: string) => {
        if (!confirm("Are you sure you want to remove this payment method?")) return;
        try {
            await deleteMethod.mutateAsync({ organizationId: orgId, paymentMethodId: methodId });
            toast.success("Payment method removed");
        } catch (error) {
            toast.error("Failed to remove payment method");
        }
    };

    const isTrialing = organization?.subscriptionStatus === "trialing";
    const trialEndDate = organization?.trialEndsAt ? DateTime.fromISO(organization.trialEndsAt) : null;
    const planName = organization?.subscriptionType || "Starter";

    return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA]">
            <PageHeader
                title="Billing & Plans"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${orgId}`, active: false },
                    { label: "Settings", href: `/dashboard/${orgId}/settings`, active: false },
                    { label: "Billing", href: `/dashboard/${orgId}/settings/billing`, active: true }
                ]}
            />

            <div className="flex-1 p-4 lg:p-8 w-full max-w-4xl space-y-12">
                {/* Subscription Info Section */}
                <section className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Subscription Plan</h3>
                        <p className="text-neutral-500 text-xs mt-1">Your current billing cycle and usage tier.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Star className="h-4 w-4 fill-current" />
                                </div>
                                <p className="text-lg font-bold text-neutral-900 leading-none">
                                    <span className="capitalize">{planName}</span> <span className="text-xs font-normal text-muted-foreground ml-2">Plan</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant={isTrialing ? "secondary" : "default"} className="capitalize px-3 py-0.5 text-[10px] rounded-full">
                                    {organization?.subscriptionStatus || "Active"}
                                </Badge>
                                {isTrialing && trialEndDate && (
                                    <span className="text-xs text-amber-600 font-medium">
                                        Trial ends {trialEndDate.toLocaleString(DateTime.DATE_MED)}
                                    </span>
                                )}
                            </div>

                            {isTrialing && trialEndDate && !organization?.setupFeePaid && (
                                <div className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100 max-w-md">
                                    <Clock className="h-3.5 w-3.5 text-amber-600 mt-0.5" />
                                    <p className="text-[11px] text-amber-700 leading-relaxed">
                                        Your free trial will expire in <strong>{Math.ceil(trialEndDate.diffNow('days').days)} days</strong>. Add a payment method to ensure uninterrupted service after the trial ends.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {planName.toLowerCase() === "starter" && (
                                <>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Setup Fee Status</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {organization?.setupFeePaid ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm font-medium text-green-700">Setup fee paid and verified</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                                    <span className="text-sm font-medium text-amber-700">Setup fee payment required</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {!organization?.setupFeePaid && (
                                        <Button 
                                            onClick={handleAddPaymentMethod}
                                            className="h-9 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold uppercase tracking-wider px-6"
                                        >
                                            Pay Setup Fee
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {planName.toLowerCase() === "starter" && (
                    <>
                        <div className="h-px bg-neutral-200" />

                        {/* Payment Methods Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Payment Methods</h3>
                                    <p className="text-neutral-500 text-xs mt-1">Saved credit cards for automated billing.</p>
                                </div>
                                <Button 
                                    onClick={handleAddPaymentMethod} 
                                    disabled={createSetupSession.isPending}
                                    variant="outline"
                                    size="sm" 
                                    className="gap-2 h-8 px-3 text-[10px] font-bold uppercase tracking-wider border-neutral-300"
                                >
                                    {createSetupSession.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                    Add New
                                </Button>
                            </div>

                            <div className="grid gap-4 max-w-2xl">
                                {isLoadingMethods ? (
                                    <div className="flex items-center gap-3 py-8">
                                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                                        <p className="text-xs text-neutral-500 font-sans">Syncing with Stripe...</p>
                                    </div>
                                ) : paymentMethods?.length === 0 ? (
                                    <div className="py-10 border border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-center bg-white">
                                        <CreditCard className="h-6 w-6 text-neutral-300 mb-2" />
                                        <p className="text-xs text-neutral-500 font-medium">No saved payment methods</p>
                                        <p className="text-[10px] text-neutral-400 mt-1">Add a card to manage your subscription.</p>
                                    </div>
                                ) : (
                                    paymentMethods?.map((method) => (
                                        <div 
                                            key={method.id} 
                                            className={cn(
                                                "flex items-center justify-between p-4 bg-white border rounded-xl group relative transition-all",
                                                method.isDefault ? "border-primary/20 bg-primary/2" : "border-neutral-200 hover:border-neutral-300"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-7 bg-neutral-100 rounded flex items-center justify-center border border-neutral-200">
                                                    <span className="text-[8px] font-black uppercase text-neutral-400">{method.card.brand}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-bold text-neutral-900 leading-none">•••• {method.card.last4}</p>
                                                        {method.isDefault && (
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Default</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-neutral-500 mt-1">Expires {method.card.exp_month}/{method.card.exp_year}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        {!method.isDefault && (
                                                            <DropdownMenuItem onClick={() => handleSetDefault(method.id)} className="text-[11px] font-medium">
                                                                Set as default
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(method.id)}
                                                            className="text-red-500 focus:text-red-500 text-[11px] font-medium"
                                                        >
                                                            Remove card
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <div className="pt-8 border-t max-w-2xl">
                            <div className="flex gap-4 items-start grayscale opacity-60">
                                <ShieldCheck className="h-4 w-4 text-neutral-400 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Secure Infrastructure</p>
                                    <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">
                                        Payments are securely processed by Stripe. We do not store sensitive card information on our servers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
