"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useVerify, useResendOtp } from "@/services/auth.services";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const verifySchema = Yup.object().shape({
    otp: Yup.string().length(6, "OTP must be exactly 6 digits").required("OTP is required"),
});

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const verifyMutation = useVerify();
    const resendMutation = useResendOtp();
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            otp: "",
        },
        validationSchema: verifySchema,
        onSubmit: async (values) => {
            if (!email) return;
            await verifyMutation.mutateAsync({
                email,
                otp: values.otp,
            });
            router.push("/select-organization");
        },
    });

    if (!email) {
        return (
            <Card className="w-full border-slate-200 shadow-xl rounded-[32px] overflow-hidden">
                <CardHeader className="pt-10 pb-10 text-center bg-slate-50/50">
                    <CardTitle className="text-destructive font-bold font-logo uppercase">Invalid Request</CardTitle>
                    <CardDescription className="px-6 pt-4 text-slate-500 font-medium">
                        Verification email is missing. Please return to the signup page and try again.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="pb-8 flex justify-center">
                    <Link href="/signup">
                        <Button variant="outline" className="rounded-xl px-10">Back to Signup</Button>
                    </Link>
                </CardFooter>
            </Card>
        )
    }

    const isLoading = verifyMutation.isPending;

    return (
        <Card className="w-full border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden">
            <CardHeader className="space-y-3 pt-10 pb-8 text-center bg-slate-50/30">
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 font-logo uppercase">Verify Account</CardTitle>
                <CardDescription className="text-slate-500 font-medium px-4 text-sm leading-relaxed">
                    We've sent a 6-digit verification code to <span className="text-slate-950 font-bold">{email}</span>. Please enter it below.
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="flex flex-col gap-8 pt-10 px-8 items-center text-center">
                    <div className="flex flex-col gap-4 items-center">
                        <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-slate-400">One-Time Password</Label>
                        <InputOTP
                            maxLength={6}
                            value={formik.values.otp}
                            onChange={(value) => formik.setFieldValue("otp", value)}
                            className="gap-3"
                        >
                            <InputOTPGroup className="gap-2">
                                <InputOTPSlot index={0} className="h-14 w-12 rounded-xl border-slate-200 text-xl font-bold" />
                                <InputOTPSlot index={1} className="h-14 w-12 rounded-xl border-slate-200 text-xl font-bold" />
                                <InputOTPSlot index={2} className="h-14 w-12 rounded-xl border-slate-200 text-xl font-bold" />
                            </InputOTPGroup>
                            <InputOTPSeparator className="text-slate-300 mx-1" />
                            <InputOTPGroup className="gap-2">
                                <InputOTPSlot index={3} className="h-14 w-12 rounded-xl border-slate-200 text-xl font-bold" />
                                <InputOTPSlot index={4} className="h-14 w-12 rounded-xl border-slate-200 text-xl font-bold" />
                                <InputOTPSlot index={5} className="h-14 w-12 rounded-xl border-slate-200 text-xl font-bold" />
                            </InputOTPGroup>
                        </InputOTP>

                        {(formik.touched.otp && formik.errors.otp) || verifyMutation.isError ? (
                            <div className="text-xs font-bold text-destructive mt-2">
                                {formik.errors.otp || (verifyMutation.error as any)?.message || "Verification failed. Please try again."}
                            </div>
                        ) : null}

                        <p className="text-xs text-slate-400 font-medium mt-2">
                            Didn't receive the code?{" "}
                            <button
                                type="button"
                                disabled={resendMutation.isPending}
                                onClick={() => {
                                    if (!email) return;
                                    resendMutation.mutate({ email }, {
                                        onSuccess: () => toast.success("OTP resent successfully"),
                                        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to resend OTP")
                                    });
                                }}
                                className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Sending...
                                    </>
                                ) : "Resend OTP"}
                            </button>
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-6 pt-10 pb-10 px-8">
                    <Button
                        type="submit"
                        className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 rounded-xl text-base font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                        loading={isLoading}
                        disabled={isLoading || formik.values.otp.length < 6}
                    >
                        {isLoading ? "Verifying..." : "Complete Verification"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
