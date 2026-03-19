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
        <Card className="w-full border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden gap-1">
            <CardHeader className="space-y-3 pt-6 pb-8 text-center bg-slate-50/30">
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 font-logo uppercase">Reset Password</CardTitle>
                <CardDescription className="text-slate-500 font-medium px-4 text-sm leading-relaxed">
                    Don't worry! Enter your email address and we'll send you a secure link to reset your password.
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-7 pt-5 px-8">
                    <div className="grid gap-2.5">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Recovery Email</Label>
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
                </CardContent>
                <CardFooter className="flex flex-col gap-6 pt-10 pb-10 px-8">
                    <Button
                        type="submit"
                        className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 rounded-xl text-base font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending Link..." : "Send Reset Link"}
                    </Button>
                    <div className="text-center text-sm text-slate-500 font-medium">
                        <Link href="/login" className="text-blue-600 font-bold hover:underline underline-offset-4 flex items-center justify-center gap-2">
                            Back to Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
