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
            <Card className="w-full border-slate-200 shadow-xl rounded-[32px] overflow-hidden gap-1">
                <CardHeader className="pt-10 pb-10 text-center bg-slate-50/50">
                    <CardTitle className="text-destructive font-bold font-logo uppercase">Invalid Link</CardTitle>
                    <CardDescription className="px-6 pt-4 text-slate-500 font-medium leading-relaxed">
                        This password reset link is invalid or has expired. Please request a new link to continue.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="pb-8 flex justify-center">
                    <Link href="/forgot-password">
                        <Button variant="outline" className="rounded-xl px-8 h-12">Request New Link</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden gap-1">
            <CardHeader className="space-y-3 pt-10 pb-8 text-center bg-slate-50/30">
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 font-logo uppercase">New Password</CardTitle>
                <CardDescription className="text-slate-500 font-medium px-4 text-sm leading-relaxed">
                    Set a strong password to protect your Watchtower account.
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-7 pt-5 px-8">
                    <div className="grid gap-2.5">
                        <Label htmlFor="password" title="New Password" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                            disabled={isLoading}
                            {...formik.getFieldProps("password")}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-xs font-bold text-destructive mt-1 ml-1">{formik.errors.password}</div>
                        )}
                    </div>
                    <div className="grid gap-2.5">
                        <Label htmlFor="confirmPassword" title="Confirm Password" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                            disabled={isLoading}
                            {...formik.getFieldProps("confirmPassword")}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                            <div className="text-xs font-bold text-destructive mt-1 ml-1">{formik.errors.confirmPassword}</div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-6 pt-10 pb-10 px-8">
                    <Button
                        type="submit"
                        className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 rounded-xl text-base font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Updating Password..." : "Update Password"}
                    </Button>
                    <div className="text-center text-sm text-slate-500 font-medium">
                        <Link href="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">
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
