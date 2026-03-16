"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMyOrganizations } from "@/services/organization.services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, ArrowRight } from "lucide-react";

import { useSelectOrganization } from "@/services/auth.services";
import { useAuthStore } from "@/stores/auth.store";

export default function SelectOrganizationPage() {
    const router = useRouter();
    const { account } = useAuthStore()
    const { data: organizations, isLoading } = useGetMyOrganizations(account?.id);
    const { mutate: selectOrganization, isPending: isSelecting } = useSelectOrganization();

    useEffect(() => {
        if (!isLoading && organizations) {
            if (organizations.length === 1) {
                const orgId = organizations[0].organizationId;
                handleSelectOrganization(orgId)
            }
        }
    }, [organizations, isLoading]);

    const handleSelectOrganization = (orgId: string) => {
        selectOrganization({ organizationId: orgId }, {
            onSuccess: () => {
                router.push(`/dashboard/${orgId}`);
            }
        });
    };

    if (isLoading || isSelecting) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Organizations...</p>
            </div>
        );
    }

    if (!organizations || organizations.length === 0) {
        return (
            <Card className="w-full max-w-md mx-auto border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden">
                <CardHeader className="space-y-3 pt-12 pb-8 text-center bg-slate-50/30">
                    <CardTitle className="text-2xl font-bold font-logo uppercase text-slate-950 tracking-tight">No Workspace Found</CardTitle>
                    <CardDescription className="text-slate-500 font-medium px-4 leading-relaxed">
                        You don't seem to be a member of any organization yet.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-10 pb-10 px-8">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => router.push("/login")}
                        className="w-full h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50"
                    >
                        Return to Login
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Don't render anything while redirecting for single org case to prevent flash
    if (organizations.length === 1) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Redirecting to Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 font-logo uppercase">Select Workspace</h1>
                <p className="text-slate-500 font-medium text-lg">Choose the organization you'd like to access</p>
            </div>

            <div className="grid gap-5">
                {organizations.map((member) => (
                    <Card
                        key={member.organization.id}
                        className="group cursor-pointer border-slate-200/60 shadow-lg shadow-slate-100/50 rounded-[28px] overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-100/30 hover:border-blue-200 active:scale-[0.98] gap-0"
                        onClick={() => handleSelectOrganization(member.organization.id)}
                    >
                        <CardContent className="flex items-center justify-between px-7">
                            <div className="flex items-center gap-6">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-xl font-bold leading-none tracking-tight text-slate-900 font-logo uppercase">
                                        {member.organization.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                            {member.role || 'Member'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1">
                                <ArrowRight className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center pt-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/login")}
                    className="text-slate-400 font-bold hover:text-slate-600"
                >
                    Sign in with a different account
                </Button>
            </div>
        </div>
    );
}
