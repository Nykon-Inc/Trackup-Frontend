"use client";

import Link from "next/link";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema } from "@/validators/auth";
import { useLogin } from "@/services/auth.services";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
    const loginMutation = useLogin();
    const router = useRouter();
    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            try {
                const { account } = await loginMutation.mutateAsync(values);
                if (account.accountType === "client") {
                    router.push(`/select-organization`);
                } else {
                    router.push(`/internal`);
                }
            } catch (error: any) {
                const message = error?.response?.data?.message || "Invalid email or password";
                toast.error(message);
            }
        },
    });

    const isLoading = loginMutation.isPending;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-3xl font-bold tracking-tight">Sign in</CardTitle>
                <CardDescription className="text-base">
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-6">
                    <div className="grid gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            autoComplete="email"
                            disabled={isLoading}
                            {...formik.getFieldProps("email")}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="text-xs font-medium text-destructive">{formik.errors.email}</div>
                        )}
                    </div>
                    <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-medium text-primary hover:underline underline-offset-4"
                                tabIndex={-1}
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            disabled={isLoading}
                            {...formik.getFieldProps("password")}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-xs font-medium text-destructive">{formik.errors.password}</div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-5 pt-5 pb-2">
                    <Button
                        type="submit"
                        className="w-full text-base py-5"
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
