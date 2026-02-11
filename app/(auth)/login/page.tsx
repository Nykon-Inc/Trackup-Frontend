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
                const { account, organization, credentials, permissions } = await loginMutation.mutateAsync(values);
                if (account.accountType === "client") {
                    router.push(`/dashboard/${organization?.id}`);
                } else {
                    router.push(`/internal`);
                }
            } catch (error) {
                toast.error("Invalid email or password");
            }
        },
    });

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Sign in</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            {...formik.getFieldProps("email")}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="text-sm text-red-500">{formik.errors.email}</div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            {...formik.getFieldProps("password")}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-sm text-red-500">{formik.errors.password}</div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex mt-2 flex-col gap-4">
                    <Button type="submit" className="w-full" loading={loginMutation.isPending} disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        <Link href="/forgot-password" className="hover:text-primary underline underline-offset-4">
                            Forgot your password?
                        </Link>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/signup" className="hover:text-primary underline underline-offset-4">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
