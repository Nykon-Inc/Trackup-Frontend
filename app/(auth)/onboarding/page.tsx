"use client";
import { useBulkInviteOnboarding } from "@/services/organization.services";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    useVerifyOnboardingToken,
    useAcceptInvite,
    useSetupPassword,
    useCompleteRegistration,
} from "@/services/auth.services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Account, VerifyTokenResponseInterface } from "@/interfaces/auth.interfaces";
import { useCreateProject, useCreateProjectOnboarding } from "@/services/projects.services";
import { Loader2, FileText, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Stepper } from "@/components/ui/stepper";

import { OnboardingStep, OrganizationMember } from "@/interfaces/organizations.interfaces";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddOrganizationMembers } from "@/components/forms/add-organization-members";
import { InviteUserPayload } from "@/interfaces/projects.interfaces";
import { useAuthStore } from "@/stores/auth.store";

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
                        setOnboardingData(data);
                        if (data.projectMembership) {
                            setView("accept-invite");
                        } else if (data.organizationMembership) {
                            if (data.organizationMembership.role === "owner") {
                                const onboarding = data.organizationMembership.organization.onboarding;

                                if (onboarding) {
                                    const { currentStep, completedSteps } = onboarding;
                                    const requiredSteps = [
                                        OnboardingStep.OWNER_INVITED,
                                        OnboardingStep.OWNER_VERIFIED,
                                        OnboardingStep.PROJECT_CREATED,
                                    ];

                                    const isFullyOnboarded = requiredSteps.every((step) => completedSteps.includes(step));

                                    // if (isFullyOnboarded) {
                                    //     toast.success("Onboarding already completed. Please login.");
                                    //     router.push("/auth/login");
                                    //     return;
                                    // }

                                    setView("owner-setup");

                                    if (currentStep === OnboardingStep.OWNER_INVITED) {
                                        setOwnerStep("password");
                                    } else if (currentStep === OnboardingStep.OWNER_VERIFIED) {
                                        setOwnerStep("project");
                                    } else if (currentStep === OnboardingStep.PROJECT_CREATED) {
                                        setOwnerStep("members");
                                    } else if (currentStep === OnboardingStep.STAFF_INVITED) {
                                        setOwnerStep("complete");
                                    } else {
                                        setOwnerStep("password");
                                    }
                                } else {
                                    setView("owner-setup");
                                    setOwnerStep("password");
                                }
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

    // calculate steps dynamically
    const steps = view === "owner-setup" ? [
        { title: "Account", value: "password", icon: FileText },
        { title: "Project", value: "project", icon: FileText },
        { title: "Team", value: "members", icon: Users },
        { title: "Confirm", value: "complete", icon: CheckCircle },
    ] : [];

    return (
        <div className="w-full">
            {steps.length > 0 && (
                <div className="mb-8">
                    <Stepper steps={steps} currentStep={ownerStep} />
                </div>
            )}

            {view === "loading" || isVerifying ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : view === "error" ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardContent className="flex flex-col items-center justify-center gap-4 pt-6 text-center">
                        <h1 className="text-lg font-semibold">Invalid or Expired Token</h1>
                        <p className="text-sm text-muted-foreground">Please check your link and try again.</p>
                        <Button size="sm" onClick={() => router.push("/auth/login")}>Go to Login</Button>
                    </CardContent>
                </Card>
            ) : view === "accept-invite" ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="space-y-1 text-center pb-2">
                        <CardTitle className="text-lg font-semibold">
                            Join {onboardingData?.organizationMembership?.organization?.name || "Organization"}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {onboardingData?.projectMembership ? (
                                <>You have been invited to join project <strong>{onboardingData.projectMembership.project.name}</strong>.</>
                            ) : (
                                <>You have been invited to join organization as <strong>{onboardingData?.organizationMembership.role}</strong>.</>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <Button size="sm" onClick={handleAccept} disabled={isAccepting} className="w-full">
                            {isAccepting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Accept Invite"}
                        </Button>
                    </CardContent>
                </Card>
            ) : view === "owner-setup" ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <OwnerOnboardingWizard
                            token={token!}
                            user={onboardingData!.user}
                            organizationMembership={onboardingData!.organizationMembership}
                            step={ownerStep}
                            setStep={setOwnerStep}
                        />
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}



// ... (in OwnerOnboardingWizard component)

function OwnerOnboardingWizard({ token, user, organizationMembership, step, setStep }: { token: string, user: Account, organizationMembership: OrganizationMember, step: string, setStep: (s: any) => void }) {
    const router = useRouter();
    const { mutate: setupPassword, isPending: isSettingPassword } = useSetupPassword();
    const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite();
    const { organization } = useAuthStore()
    const { mutate: completeRegistration, isPending: isCompleting } = useCompleteRegistration();

    const onPasswordSubmit = (pass: string) => {
        setupPassword({ token, password: pass }, {
            onSuccess: () => {
                setStep("project");
            },
            onError: () => toast.error("Failed to set password")
        });
    };

    const handleComplete = () => {
        completeRegistration({ token }, {
            onSuccess: () => {
                router.push(`/dashboard/${organization?.id}`);
            },
            onError: () => {
                toast.error("Failed to complete registration");
            }
        });
    };


    if (step === "password") {
        return (
            <div className="mx-auto flex max-w-[320px] flex-col justify-center gap-3">
                <div className="space-y-1 text-center">
                    <h1 className="text-lg font-semibold">Set up your account</h1>
                    <p className="text-sm text-muted-foreground">Create a password to get started.</p>
                </div>
                <PasswordForm onSubmit={onPasswordSubmit} isLoading={isSettingPassword} />
            </div>
        );
    }

    if (step === "project") {
        return (
            <CreateProjectStep
                onNext={() => setStep("members")}
                token={token}
                organizationId={organizationMembership.organizationId}
            />
        );
    }

    if (step === "members") {
        return (
            <AddMembersStep
                onNext={() => setStep("complete")}
                token={token}
                organizationId={organizationMembership.organizationId}
            />
        );
    }

    if (step === "complete") {
        return (
            <div className="mx-auto flex max-w-[320px] flex-col justify-center gap-3 text-center">
                <h1 className="text-lg font-semibold">You're all set!</h1>
                <Button size="sm" onClick={handleComplete} disabled={isCompleting}>
                    {isCompleting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Go to Dashboard"}
                </Button>
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
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-9"
                />
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Continue"}
            </Button>
        </form>
    );
}

function CreateProjectStep({ onNext, token, organizationId }: { onNext: () => void, token: string, organizationId: string }) {
    const { mutate: createProject, isPending } = useCreateProjectOnboarding();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProject({ name, description, token, organizationId }, {
            onSuccess: () => {
                toast.success("Project created");
                onNext();
            },
            onError: () => toast.error("Failed to create project")
        });
    };

    return (
        <div className="mx-auto flex max-w-[320px] flex-col justify-center gap-3">
            <div className="space-y-1 text-center">
                <h1 className="text-lg font-semibold">Create your first project</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-9"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-9"
                    />
                </div>
                <Button type="submit" size="sm" className="w-full" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Create Project"}
                </Button>
            </form>
        </div>
    )
}

function AddMembersStep({ onNext, token, organizationId }: { onNext: () => void, token: string, organizationId: string }) {
    const { mutate: bulkInvite, isPending } = useBulkInviteOnboarding();

    const handleSubmit = async (members: InviteUserPayload[]) => {
        bulkInvite({ organizationId, members, token }, {
            onSuccess: () => {
                toast.success("Invitations sent successfully");
                onNext();
            },
            onError: () => {
                toast.error("Failed to send invitations");
            }
        });
    };

    return (
        <div className="mx-auto flex flex-col justify-center gap-3">
            <div className="space-y-1 text-center">
                <h1 className="text-lg font-semibold">Invite Team Members</h1>
                <p className="text-sm text-muted-foreground">Skip this step for now.</p>
            </div>
            <AddOrganizationMembers onSubmit={handleSubmit} isLoading={isPending} />
            <Button size="sm" variant="outline" onClick={onNext} className="w-full">
                Skip
            </Button>
        </div>
    )
}
