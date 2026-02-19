"use client";

import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { acceptInviteSchema } from "@/validators/auth";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useValidateInvitation, useRejectInvitation } from "@/services/auth.services";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

import { useCreateUser } from "@/services/users";
import { InvitationData } from "@/interfaces/users.interfaces";
// ... existing imports

export default function AcceptInvitePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const type = searchParams.get("type") || "project";
    const [step, setStep] = useState<"decision" | "register">("decision");

    const { data: inviteData, isLoading, isRefetching, isError, error } = useValidateInvitation({ token, type });
    const { mutateAsync: rejectInvitation, isPending: isRejecting } = useRejectInvitation();
    const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();

    const invitationData = inviteData as InvitationData;

    const formik = useFormik({
        initialValues: {
            name: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: acceptInviteSchema,
        onSubmit: async (values) => {
            if (!invitationData) return;

            try {
                await createUser({
                    name: values.name,
                    email: invitationData.email,
                    password: values.password,
                    role: invitationData.role || "member", // Fallback if role is missing
                });
                toast.success("Account created successfully. Please login.");
                window.location.href = "/login";
            } catch (error: any) {
                toast.error((error as any)?.response?.data?.message || "Failed to create account.");
            }
        },
    });

    const handleReject = async () => {
        try {
            await rejectInvitation({ token, type });
            toast.success("Invitation rejected");
            window.location.href = "/login";
        } catch (error) {
            toast.error("Failed to reject invitation");
        }
    };

    if (isLoading || isRefetching) {
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

    if (isError) {
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
                                {(error as any)?.response?.data?.message || "Invalid or expired invitation token."}
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


    const inviterName = invitationData?.organization?.name || invitationData?.project?.name || "Acme Inc";

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
                    <Button className="w-full" onClick={() => setStep("register")}>
                        Accept Invitation
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
                        <Input id="email" type="email" value={invitationData?.email || "invited@example.com"} disabled />
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
                        <Button type="submit" className="w-full" disabled={isCreating}>
                            {isCreating ? "Creating Account..." : "Complete Setup"}
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
}
