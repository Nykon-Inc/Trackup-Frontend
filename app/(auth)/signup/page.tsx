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

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                <CardDescription className="text-center">
                    Get started with Watchtower today
                </CardDescription>
            </CardHeader>
            <form onSubmit={formik.handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            {...formik.getFieldProps("name")}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="text-sm text-red-500">{formik.errors.name}</div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="organizationName">Company Name</Label>
                        <Input
                            id="organizationName"
                            type="text"
                            placeholder="Acme Inc."
                            {...formik.getFieldProps("organizationName")}
                        />
                        {formik.touched.organizationName && formik.errors.organizationName && (
                            <div className="text-sm text-red-500">{formik.errors.organizationName}</div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="workEmail">Work Email</Label>
                        <Input
                            id="workEmail"
                            type="email"
                            placeholder="john@acme.com"
                            {...formik.getFieldProps("workEmail")}
                        />
                        {formik.touched.workEmail && formik.errors.workEmail && (
                            <div className="text-sm text-red-500">{formik.errors.workEmail}</div>
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
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="hover:text-primary underline underline-offset-4">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
