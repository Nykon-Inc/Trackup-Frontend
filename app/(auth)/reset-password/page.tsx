"use client";

import Link from "next/link";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPasswordSchema } from "@/validators/auth";
import { useResetPassword } from "@/services/auth.services";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
    const resetPasswordMutation = useResetPassword();
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code") || searchParams.get("token");

    const formik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        validationSchema: resetPasswordSchema,
        onSubmit: async (values) => {
            if (!code) {
                toast.error("Invalid reset link. Please try requesting a new one.");
                return;
            }

            try {
                await resetPasswordMutation.mutateAsync({
                    password: values.password,
                    token: code,
                });
                toast.success("Password reset successfully");
                router.push("/login");
            } catch (error: any) {
                const message = error?.response?.data?.message || "Failed to reset password";
                toast.error(message);
            }
        },
    });

    const isLoading = resetPasswordMutation.isPending;

    if (!code) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Invalid Link</CardTitle>
                    <CardDescription className="text-base text-destructive">
                        This password reset link is invalid or has expired.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Link href="/forgot-password">
                        <Button variant="outline">Request New Link</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-3xl font-bold tracking-tight">Set New Password</CardTitle>
                <CardDescription className="text-base">
                    Please enter your new password below.
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-6">
                    <div className="grid gap-1.5">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...formik.getFieldProps("password")}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-xs font-medium text-destructive">{formik.errors.password}</div>
                        )}
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...formik.getFieldProps("confirmPassword")}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                            <div className="text-xs font-medium text-destructive">{formik.errors.confirmPassword}</div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-5 pb-2 pt-5">
                    <Button
                        type="submit"
                        className="w-full text-base py-5"
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                            Back to Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
