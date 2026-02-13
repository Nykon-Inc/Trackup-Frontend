"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMyOrganizations } from "@/services/organization.services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, ArrowRight } from "lucide-react";

import { useSelectOrganization } from "@/services/auth.services";

export default function SelectOrganizationPage() {
    const router = useRouter();
    const { data: organizations, isLoading } = useGetMyOrganizations();
    const { mutate: selectOrganization, isPending: isSelecting } = useSelectOrganization();

    useEffect(() => {
        if (!isLoading && organizations) {
            if (organizations.length === 1) {
                const orgId = organizations[0].organizationId;
                selectOrganization({ organizationId: orgId }, {
                    onSuccess: () => {
                        router.push(`/dashboard/${orgId}`);
                    }
                });
            }
        }
    }, [organizations, isLoading, router, selectOrganization]);

    const handleSelectOrganization = (orgId: string) => {
        selectOrganization({ organizationId: orgId }, {
            onSuccess: () => {
                router.push(`/dashboard/${orgId}`);
            }
        });
    };

    if (isLoading || isSelecting) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!organizations || organizations.length === 0) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>No Organizations Found</CardTitle>
                        <CardDescription>
                            You don't seem to be a member of any organization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => router.push("/login")}>
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Don't render anything while redirecting for single org case to prevent flash
    if (organizations.length === 1) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50/50 p-4">
            <div className="w-full max-w-lg space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Select Organization</h1>
                    <p className="text-muted-foreground">Choose which organization you would like to access</p>
                </div>

                <div className="grid gap-4">
                    {organizations.map((member) => (
                        <Card
                            key={member.organization.id}
                            className="group cursor-pointer transition-all hover:border-primary hover:shadow-md"
                            onClick={() => handleSelectOrganization(member.organization.id)}
                        >
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold leading-none tracking-tight">
                                            {member.organization.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {member.role || 'Member'}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
