"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    useVerifyOnboardingToken,
    useAcceptInvite,
} from "@/services/auth.services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VerifyTokenResponseInterface } from "@/interfaces/auth.interfaces";
import { useCreateProject } from "@/services/projects.services";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const { mutate: verifyToken, isPending: isVerifying } = useVerifyOnboardingToken();
    const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite();

    // States
    const [view, setView] = useState<"loading" | "accept-invite" | "owner-setup" | "error">("loading");
    const [onboardingData, setOnboardingData] = useState<VerifyTokenResponseInterface | null>(null);
    const [ownerStep, setOwnerStep] = useState<"password" | "project" | "members" | "complete">("password");

    useEffect(() => {
        if (token) {
            verifyToken(
                { token },
                {
                    onSuccess: (data) => {
                        debugger
                        setOnboardingData(data);
                        if (data.projectMembership) {
                            setView("accept-invite");
                        } else if (data.organizationMembership) {
                            if (data.organizationMembership.role === "owner") {
                                setView("owner-setup");
                                setOwnerStep("password");
                            } else {
                                setView("accept-invite");
                            }
                        } else {
                            setView("error");
                        }
                    },
                    onError: () => {
                        setView("error");
                    },
                }
            );
        } else {
            setView("error");
        }
    }, [token, verifyToken]);

    const handleAccept = () => {
        if (!token) return;
        acceptInvite(
            { token },
            {
                onSuccess: () => {
                    toast.success("Invitation accepted!");
                    router.push("/projects");
                },
                onError: (error) => {
                    toast.error("Failed to accept invitation");
                },
            }
        );
    };

    if (view === "loading" || isVerifying) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (view === "error") {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Invalid or Expired Token</h1>
                <p>Please check your link and try again.</p>
                <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
            </div>
        );
    }

    if (view === "accept-invite") {
        return (
            <div className="mx-auto flex h-screen max-w-md flex-col justify-center gap-6 p-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Join {onboardingData?.organizationMembership?.organization?.name || "Organization"}</h1>
                    {onboardingData?.projectMembership && (
                        <p className="text-muted-foreground">
                            You have been invited to join project <strong>{onboardingData.projectMembership.project.name}</strong>.
                        </p>
                    )}
                    {!onboardingData?.projectMembership && (
                        <p className="text-muted-foreground">
                            You have been invited to join organization as <strong>{onboardingData?.organizationMembership.role}</strong>.
                        </p>
                    )}
                </div>
                <Button onClick={handleAccept} disabled={isAccepting} className="w-full">
                    {isAccepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Accept Invite"}
                </Button>
            </div>
        );
    }

    if (view === "owner-setup") {
        return <OwnerOnboardingWizard token={token!} user={onboardingData!.user} step={ownerStep} setStep={setOwnerStep} />;
    }

    return null;
}

function OwnerOnboardingWizard({ token, user, step, setStep }: { token: string, user: any, step: string, setStep: (s: any) => void }) {
    const router = useRouter();
    const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite();

    const onPasswordSubmit = (pass: string) => {
        acceptInvite({ token, password: pass }, {
            onSuccess: () => {
                setStep("project");
            },
            onError: () => toast.error("Failed to set password")
        });
    };

    if (step === "password") {
        return (
            <div className="mx-auto flex h-screen max-w-md flex-col justify-center gap-6 p-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Set up your account</h1>
                    <p className="text-muted-foreground">Create a password to get started.</p>
                </div>
                <PasswordForm onSubmit={onPasswordSubmit} isLoading={isAccepting} />
            </div>
        );
    }

    if (step === "project") {
        return <CreateProjectStep onNext={() => setStep("members")} />;
    }

    if (step === "members") {
        return <AddMembersStep onNext={() => setStep("complete")} />;
    }

    if (step === "complete") {
        return (
            <div className="mx-auto flex h-screen max-w-md flex-col justify-center gap-6 p-6 text-center">
                <h1 className="text-2xl font-bold">You're all set!</h1>
                <Button onClick={() => router.push("/projects")}>Go to Dashboard</Button>
            </div>
        );
    }

    return null;
}

function PasswordForm({ onSubmit, isLoading }: { onSubmit: (p: string) => void, isLoading: boolean }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        onSubmit(password);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
            </Button>
        </form>
    );
}

function CreateProjectStep({ onNext }: { onNext: () => void }) {
    const { mutate: createProject, isPending } = useCreateProject();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProject({ name, description }, {
            onSuccess: () => {
                toast.success("Project created");
                onNext();
            },
            onError: () => toast.error("Failed to create project")
        });
    };

    return (
        <div className="mx-auto flex h-screen max-w-md flex-col justify-center gap-6 p-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Create your first project</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Project"}
                </Button>
            </form>
        </div>
    )
}

function AddMembersStep({ onNext }: { onNext: () => void }) {
    return (
        <div className="mx-auto flex h-screen max-w-md flex-col justify-center gap-6 p-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Invite Team Members</h1>
                <p className="text-muted-foreground">Skip this step for now.</p>
            </div>
            <Button variant="outline" onClick={onNext} className="w-full">
                Skip
            </Button>
        </div>
    )
}
