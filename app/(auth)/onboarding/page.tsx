"use client";
import { useBulkInviteOnboarding, useAcceptInvitation, useRejectInvitation } from "@/services/organization.services";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    useVerifyOnboardingToken,
    useAcceptInvite,
    useSetupPassword,
    useCompleteRegistration,
    useRegisterInvitedUser,
    useSelectOrganization,
} from "@/services/auth.services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Account, VerifyTokenResponseInterface } from "@/interfaces/auth.interfaces";
import { useCreateProjectOnboarding } from "@/services/projects.services";
import { Loader2, FileText, Users, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { Stepper } from "@/components/ui/stepper";

import { OnboardingStep, OrganizationMember, BulkInviteMember } from "@/interfaces/organizations.interfaces";
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
    const { mutate: acceptOrgInvite, isPending: isAcceptingOrg } = useAcceptInvitation();
    const { mutate: rejectOrgInvite, isPending: isRejectingOrg } = useRejectInvitation();
    const { mutate: selectOrganization, isPending: isSelecting } = useSelectOrganization();

    // States
    const [view, setView] = useState<"loading" | "accept-invite" | "owner-setup" | "signup" | "error" | "member-complete">("loading");
    const [onboardingData, setOnboardingData] = useState<VerifyTokenResponseInterface | null>(null);
    const [ownerStep, setOwnerStep] = useState<"password" | "project" | "members" | "complete">("password");

    useEffect(() => {
        if (token) {
            verifyToken(
                { token },
                {
                    onSuccess: (data) => {
                        setOnboardingData(data);

                        if (data.flowType === "acceptance") {
                            setView("accept-invite");
                        } else if (data.flowType === "signup") {
                            setView("signup");
                        } else if (data.flowType === "setup" && data.organizationMembership) {
                            setView("owner-setup");
                            const onboarding = data.organizationMembership.organization?.onboarding;

                            if (onboarding) {
                                const { currentStep } = onboarding;
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
                                setOwnerStep("password");
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
        const orgId = onboardingData?.organizationId;
        if (!orgId) return;
        acceptOrgInvite({ organizationId: orgId, token: token! }, {
            onSuccess: () => {
                selectOrganization({ organizationId: orgId }, {
                    onSuccess: () => {
                        toast.success("Invitation accepted!");
                        setView("member-complete");
                    }
                });
            },
            onError: () => {
                toast.error("Failed to accept invitation");
            },
        });
    };

    const handleReject = () => {
        const orgId = onboardingData?.organizationId;
        if (!orgId) return;
        rejectOrgInvite({ organizationId: orgId, token: token! }, {
            onSuccess: () => {
                toast.success("Invitation rejected");
                router.push("/login");
            },
            onError: () => {
                toast.error("Failed to reject invitation");
            },
        });
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
                        <Button size="sm" onClick={() => router.push("/login")}>Go to Login</Button>
                    </CardContent>
                </Card>
            ) : view === "accept-invite" ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="space-y-1 text-center pb-2">
                        <CardTitle className="text-lg font-semibold">
                            Join {onboardingData?.organizationMembership?.organization?.name || onboardingData?.invitation?.organization?.name || "Organization"}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {onboardingData?.projectMembership ? (
                                <>You have been invited to join project <strong>{onboardingData.projectMembership.project.name}</strong>.</>
                            ) : (
                                <>You have been invited to join organization as <strong>{onboardingData?.organizationMembership?.role || onboardingData?.invitation?.role}</strong>.</>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-2 gap-3">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleReject}
                            disabled={isRejectingOrg}
                        >
                            {isRejectingOrg ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Reject Invite"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            disabled={isAcceptingOrg || isSelecting}
                        >
                            {(isAcceptingOrg || isSelecting) ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Accept Invite"}
                        </Button>
                    </CardContent>
                </Card>
            ) : view === "owner-setup" ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <OwnerOnboardingWizard
                            token={token!}
                            user={onboardingData!.user!}
                            organizationMembership={onboardingData!.organizationMembership!}
                            step={ownerStep}
                            setStep={setOwnerStep}
                        />
                    </CardContent>
                </Card>
            ) : view === "signup" ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="space-y-1 text-center pb-2">
                        <CardTitle className="text-lg font-semibold">Create your account</CardTitle>
                        <CardDescription className="text-sm">
                            Join {onboardingData?.invitation?.organization?.name || "the organization"} by completing your profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <SignupView
                            token={token!}
                            email={onboardingData?.email || ""}
                            onComplete={() => setView("member-complete")}
                        />
                    </CardContent>
                </Card>
            ) : view === "member-complete" ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <OnboardingSuccessView
                            onComplete={() => router.push(`/dashboard/${onboardingData?.organizationId}`)}
                            isCompleting={false}
                        />
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}

function SignupView({ token, email, onComplete }: { token: string, email: string, onComplete: () => void }) {
    const router = useRouter();
    const { mutate: registerInvitedUser, isPending } = useRegisterInvitedUser();
    const { mutate: selectOrganization, isPending: isSelecting } = useSelectOrganization();
    const [name, setName] = useState("");
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

        registerInvitedUser({ token, name, password }, {
            onSuccess: (data) => {
                const orgId = data.organization?.id;
                if (orgId) {
                    selectOrganization({ organizationId: orgId }, {
                        onSuccess: () => {
                            toast.success("Account created successfully!");
                            onComplete();
                        }
                    });
                } else {
                    toast.success("Account created successfully!");
                    router.push("/auth/select-organization");
                }
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to create account");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    disabled
                    className="h-9 bg-muted"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                    className="h-9"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="confirm-signup-password">Confirm Password</Label>
                <Input
                    id="confirm-signup-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-9"
                />
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={isPending || isSelecting}>
                {(isPending || isSelecting) ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Complete Registration"}
            </Button>
        </form>
    );
}

function OnboardingSuccessView({ onComplete, isCompleting }: { onComplete: () => void, isCompleting: boolean }) {
    return (
        <div className="mx-auto flex max-w-[320px] flex-col justify-center gap-4 text-center">
            <div className="flex justify-center mb-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
            </div>
            <div className="space-y-1">
                <h1 className="text-xl font-bold">You're all set!</h1>
                <p className="text-sm text-muted-foreground">
                    You have successfully joined the organization. Download the desktop app to start tracking your work.
                </p>
            </div>

            <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-11"
                asChild
            >
                <a href="/app-download/Trackup_0.1.0_aarch64.dmg" download>
                    <Download className="h-4 w-4" />
                    Download Desktop App
                </a>
            </Button>

            <Button size="sm" onClick={onComplete} disabled={isCompleting} className="w-full h-11">
                {isCompleting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Go to Dashboard"}
            </Button>
        </div>
    );
}

function OwnerOnboardingWizard({ token, user, organizationMembership, step, setStep }: { token: string, user: Account, organizationMembership: OrganizationMember, step: string, setStep: (s: any) => void }) {
    const router = useRouter();
    const { mutate: setupPassword, isPending: isSettingPassword } = useSetupPassword();
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
            <OnboardingSuccessView
                onComplete={handleComplete}
                isCompleting={isCompleting}
            />
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
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                        id="project-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-9"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="project-description">Description (Optional)</Label>
                    <Input
                        id="project-description"
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
        const mappedMembers: BulkInviteMember[] = members.map(m => ({
            email: m.email,
            role: m.role as 'manager' | 'member'
        }));

        bulkInvite({ organizationId, members: mappedMembers, token }, {
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
