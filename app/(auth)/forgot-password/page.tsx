"use client";

import Link from "next/link";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordSchema } from "@/validators/auth";
import { useForgotPassword } from "@/services/auth.services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const forgotPasswordMutation = useForgotPassword();
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: forgotPasswordSchema,
        onSubmit: async (values) => {
            try {
                await forgotPasswordMutation.mutateAsync(values);
                toast.success("Password reset link sent to your email");
                router.push("/login");
            } catch (error: any) {
                const message = error?.response?.data?.message || "Failed to send reset link";
                toast.error(message);
            }
        },
    });

    const isLoading = forgotPasswordMutation.isPending;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
                <CardDescription className="text-base">
                    Enter your email address and we'll send you a link to reset your password
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-6">
                    <div className="grid gap-2.5">
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
                </CardContent>
                <CardFooter className="flex flex-col gap-5 pb-2 pt-5">
                    <Button
                        type="submit"
                        className="w-full text-base py-5"
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
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
