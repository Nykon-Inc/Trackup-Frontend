"use client";

import Link from "next/link";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signupSchema } from "@/validators/auth";
import { useRegister } from "@/services/auth.services";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const registerMutation = useRegister();
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            name: "",
            organizationName: "",
            workEmail: "",
            password: "",
        },
        validationSchema: signupSchema,
        onSubmit: async (values) => {
            await registerMutation.mutateAsync(values);
            const encodedEmail = encodeURIComponent(values.workEmail);
            router.push(`/verify?email=${encodedEmail}`);
        },
    });

    const isLoading = registerMutation.isPending;

    return (
        <Card className="w-full border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden gap-1">
            <CardHeader className="space-y-3 pt-10 pb-8 text-center bg-slate-50/30">
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 font-logo uppercase">Create Account</CardTitle>
                <CardDescription className="text-slate-500 font-medium px-4">
                    Join hundreds of high-performing teams already using Watchtower.
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-6 pt-5 px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="grid gap-2.5">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                                disabled={isLoading}
                                {...formik.getFieldProps("name")}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="text-xs font-bold text-destructive mt-1 ml-1">{formik.errors.name}</div>
                            )}
                        </div>
                        <div className="grid gap-2.5">
                            <Label htmlFor="organizationName" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Company Name</Label>
                            <Input
                                id="organizationName"
                                type="text"
                                placeholder="Acme Inc."
                                className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                                disabled={isLoading}
                                {...formik.getFieldProps("organizationName")}
                            />
                            {formik.touched.organizationName && formik.errors.organizationName && (
                                <div className="text-xs font-bold text-destructive mt-1 ml-1">{formik.errors.organizationName}</div>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-2.5">
                        <Label htmlFor="workEmail" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Work Email</Label>
                        <Input
                            id="workEmail"
                            type="email"
                            placeholder="john@acme.com"
                            className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                            disabled={isLoading}
                            {...formik.getFieldProps("workEmail")}
                        />
                        {formik.touched.workEmail && formik.errors.workEmail && (
                            <div className="text-xs font-bold text-destructive mt-1 ml-1">{formik.errors.workEmail}</div>
                        )}
                    </div>
                    <div className="grid gap-2.5">
                        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Create Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                            disabled={isLoading}
                            {...formik.getFieldProps("password")}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-xs font-bold text-destructive mt-1 ml-1">{formik.errors.password}</div>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-400 text-center px-6 leading-relaxed">
                        By signing up, you agree to our Terms of Service and Privacy Policy. We'll send you a verification email to get you started.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-6 pt-8 pb-10 px-8">
                    <Button
                        type="submit"
                        className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 rounded-xl text-base font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating Account..." : "Create Free Account"}
                    </Button>
                    <div className="text-center text-sm text-slate-500 font-medium">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
