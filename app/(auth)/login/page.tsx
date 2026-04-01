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
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

export default function LoginPage() {
    useAuthRedirect();
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
        <Card className="w-full border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden gap-1">
            <CardHeader className="space-y-3 pt-6 pb-8 text-center bg-slate-50/30">
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 font-logo uppercase">Sign in</CardTitle>
                <CardDescription className="text-slate-500 font-medium px-4">
                    Welcome back! Please enter your credentials to access your workspace.
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-7 pt-5 px-8">
                    <div className="grid gap-2.5">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Work Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            autoComplete="email"
                            className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                            disabled={isLoading}
                            {...formik.getFieldProps("email")}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="text-xs font-bold text-destructive mt-1 ml-1">{formik.errors.email}</div>
                        )}
                    </div>
                    <div className="grid gap-2.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
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
                            className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                            disabled={isLoading}
                            {...formik.getFieldProps("password")}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-xs font-bold text-destructive mt-1 ml-1">{formik.errors.password}</div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-6 pt-10 pb-8 px-8">
                    <Button
                        type="submit"
                        className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 rounded-xl text-base font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Authenticating..." : "Sign In to Workspace"}
                    </Button>
                    <div className="text-center text-sm text-slate-500 font-medium">
                        New to Watchtower?{" "}
                        <Link href="/signup" className="text-blue-600 font-bold hover:underline underline-offset-4">
                            Create an account
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
