"use client";

import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { acceptInviteSchema } from "@/validators/auth";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

import {
    useRegisterInvitedUser,
    useSelectOrganization,
    useVerifyOnboardingToken,
} from "@/services/auth.services";
import { useAcceptInvitation, useRejectInvitation } from "@/services/organization.services";
import type { VerifyTokenResponseInterface } from "@/interfaces/auth.interfaces";

export default function AcceptInvitePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [step, setStep] = useState<"decision" | "register">("decision");

    const [inviteData, setInviteData] = useState<VerifyTokenResponseInterface | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);

    const { mutate: verifyToken, isPending: isVerifying } = useVerifyOnboardingToken();
    const { mutate: registerInvitedUser, isPending: isRegistering } = useRegisterInvitedUser();
    const { mutate: selectOrganization, isPending: isSelectingOrg } = useSelectOrganization();
    const { mutate: acceptOrgInvite, isPending: isAccepting } = useAcceptInvitation();
    const { mutate: rejectOrgInvite, isPending: isRejecting } = useRejectInvitation();

    const organizationId = inviteData?.organizationId;

    useEffect(() => {
        if (!token) {
            setVerifyError("Missing invitation token");
            return;
        }

        verifyToken(
            { token },
            {
                onSuccess: (data) => {
                    setInviteData(data);
                    setVerifyError(null);
                },
                onError: (err: unknown) => {
                    const apiError = err as { response?: { data?: { message?: string } } };
                    setVerifyError(apiError?.response?.data?.message || "Invalid or expired invitation token.");
                },
            }
        );
    }, [token, verifyToken]);

    const inviterName = useMemo(() => {
        const projectName = inviteData?.projectMembership?.project?.name;
        const orgName = inviteData?.organizationMembership?.organization?.name || inviteData?.invitation?.organization?.name;
        return projectName || orgName || "Acme Inc";
    }, [inviteData]);

    const formik = useFormik({
        initialValues: {
            name: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: acceptInviteSchema,
        onSubmit: async (values) => {
            if (!token) return;

            registerInvitedUser(
                { token, name: values.name, password: values.password },
                {
                    onSuccess: (data) => {
                        const orgId = data.organization?.id || organizationId;
                        if (orgId) {
                            selectOrganization(
                                { organizationId: orgId },
                                {
                                    onSuccess: () => {
                                        toast.success("Account created successfully!");
                                        window.location.href = `/dashboard/${orgId}`;
                                    },
                                    onError: () => {
                                        window.location.href = "/auth/select-organization";
                                    },
                                }
                            );
                        } else {
                            window.location.href = "/auth/select-organization";
                        }
                    },
                    onError: (err: unknown) => {
                        const apiError = err as { response?: { data?: { message?: string } } };
                        toast.error(apiError?.response?.data?.message || "Failed to create account");
                    },
                }
            );
        },
    });

    const handleReject = async () => {
        if (!organizationId || !token) return;
        rejectOrgInvite(
            { organizationId, token },
            {
                onSuccess: () => {
                    toast.success("Invitation rejected");
                    window.location.href = "/login";
                },
                onError: () => {
                    toast.error("Failed to reject invitation");
                },
            }
        );
    };

    if (isVerifying) {
        // ... existing skeleton code
        return (
            <Card>
                <CardHeader className="space-y-1">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (verifyError) {
        // ... existing error code
        return (
            <Card>
                {/* ... existing error UI */}
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center text-destructive">Invitation Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-destructive/15 text-destructive p-4 rounded-md flex gap-3 items-start">
                        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                            <h5 className="font-medium leading-none tracking-tight">Error</h5>
                            <div className="text-sm opacity-90">
                                {verifyError}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = "/login"}>Go to Login</Button>
                </CardFooter>
            </Card>
        );
    }

    if (!inviteData) {
        return null;
    }

    if (step === "decision") {
        return (
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Invitation</CardTitle>
                    <CardDescription className="text-center">
                        You have been invited to join <strong>{inviterName}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        Click accept to proceed with your account creation.
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button
                        className="w-full"
                        onClick={() => {
                            if (inviteData.flowType === "signup") {
                                setStep("register");
                                return;
                            }
                            if (!organizationId || !token) return;
                            acceptOrgInvite(
                                { organizationId, token },
                                {
                                    onSuccess: () => {
                                        selectOrganization(
                                            { organizationId },
                                            {
                                                onSuccess: () => {
                                                    toast.success("Invitation accepted!");
                                                    window.location.href = `/dashboard/${organizationId}`;
                                                },
                                                onError: () => {
                                                    window.location.href = "/auth/select-organization";
                                                },
                                            }
                                        );
                                    },
                                    onError: () => {
                                        toast.error("Failed to accept invitation");
                                    },
                                }
                            );
                        }}
                        disabled={isAccepting || isSelectingOrg}
                    >
                        {(isAccepting || isSelectingOrg) ? "Accepting..." : "Accept Invitation"}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={handleReject}
                        disabled={isRejecting}
                    >
                        {isRejecting ? "Rejecting..." : "Decline Invitation"}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Join the Team</CardTitle>
                <CardDescription className="text-center">
                    Complete your account setup to join <strong>{inviterName}</strong>
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-4">
                    {/* ... form fields */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={inviteData?.email || "invited@example.com"} disabled />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Jane Doe"
                            {...formik.getFieldProps("name")}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="text-sm text-red-500">{formik.errors.name}</div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Set Password</Label>
                        <Input
                            id="password"
                            type="password"
                            {...formik.getFieldProps("password")}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-sm text-red-500">{formik.errors.password}</div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            {...formik.getFieldProps("confirmPassword")}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                            <div className="text-sm text-red-500">{formik.errors.confirmPassword}</div>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full mb-2"
                            onClick={() => setStep("decision")}
                        >
                            Back
                        </Button>
                        <Button type="submit" className="w-full" disabled={isRegistering || isSelectingOrg}>
                            {(isRegistering || isSelectingOrg) ? "Creating Account..." : "Complete Setup"}
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
}
