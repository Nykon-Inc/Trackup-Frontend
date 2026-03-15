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
import { Loader2, FileText, Users, CheckCircle, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Stepper } from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";

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
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Initializing Onboarding...</p>
                </div>
            ) : view === "error" ? (
                <Card className="w-full max-w-md mx-auto border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden">
                    <CardContent className="flex flex-col items-center justify-center gap-6 pt-12 pb-10 text-center px-8">
                        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                            <X className="h-8 w-8" />
                        </div>
                        <h1 className="text-2xl font-bold font-logo uppercase text-slate-950 tracking-tight">Invalid or Expired Link</h1>
                        <p className="text-slate-500 font-medium leading-relaxed">The link you followed may have expired or is incorrect. Please request a new one from your workspace owner.</p>
                        <Button size="lg" className="h-12 px-8 bg-slate-950 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98] w-full" onClick={() => router.push("/login")}>Go to Login</Button>
                    </CardContent>
                </Card>
            ) : view === "accept-invite" ? (
                <Card className="w-full max-w-md mx-auto border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden">
                    <CardHeader className="space-y-3 pt-12 pb-8 text-center bg-slate-50/30">
                        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 font-logo uppercase">
                            Join Workspace
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium px-4 leading-relaxed">
                            {onboardingData?.projectMembership ? (
                                <>You have been invited to join project <span className="text-slate-950 font-bold">{onboardingData.projectMembership.project.name}</span> in <span className="text-slate-950 font-bold">{onboardingData?.organizationMembership?.organization?.name || onboardingData?.invitation?.organization?.name}</span>.</>
                            ) : (
                                <>You have been invited to join <span className="text-slate-950 font-bold">{onboardingData?.organizationMembership?.organization?.name || onboardingData?.invitation?.organization?.name}</span> as a <span className="text-blue-600 font-bold">{onboardingData?.organizationMembership?.role || onboardingData?.invitation?.role}</span>.</>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-10 pb-10 px-8 grid grid-cols-2 gap-4">
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={handleReject}
                            className="h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                            disabled={isRejectingOrg}
                        >
                            {isRejectingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : "Decline"}
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleAccept}
                            className="h-12 bg-slate-950 text-white hover:bg-slate-800 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                            disabled={isAcceptingOrg || isSelecting}
                        >
                            {(isAcceptingOrg || isSelecting) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept Invitation"}
                        </Button>
                    </CardContent>
                </Card>
            ) : view === "owner-setup" ? (
                <Card className="w-full max-w-xl mx-auto border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden">
                    <CardContent className="pt-10 pb-10 px-10">
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
                <Card className="w-full max-w-md mx-auto border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden">
                    <CardHeader className="space-y-3 pt-12 pb-8 text-center bg-slate-50/30">
                        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 font-logo uppercase">Complete Profile</CardTitle>
                        <CardDescription className="text-slate-500 font-medium px-4 leading-relaxed text-sm">
                            Join <span className="text-slate-950 font-bold">{onboardingData?.invitation?.organization?.name || "the organization"}</span> by setting up your profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-10 pb-10 px-8">
                        <SignupView
                            token={token!}
                            email={onboardingData?.email || ""}
                            onComplete={() => setView("member-complete")}
                        />
                    </CardContent>
                </Card>
            ) : view === "member-complete" ? (
                <Card className="w-full max-w-md mx-auto border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden">
                    <CardContent className="pt-12 pb-12 px-10">
                        <OnboardingSuccessView
                            onComplete={() => {
                                router.push("/select-organization");
                            }}
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
                <Label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</Label>
                <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    disabled
                    className="h-12 px-4 rounded-xl border-slate-200 bg-slate-50 text-slate-400 font-medium"
                />
            </div>
            <div className="space-y-2.5">
                <Label htmlFor="signup-name" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</Label>
                <Input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                    className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                />
            </div>
            <div className="space-y-2.5">
                <Label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Create Password</Label>
                <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                />
                {error && <p className="text-xs font-bold text-red-500 mt-1 ml-1">{error}</p>}
            </div>
            <div className="space-y-2.5">
                <Label htmlFor="confirm-signup-password" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Confirm Password</Label>
                <Input
                    id="confirm-signup-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                />
            </div>
            <Button type="submit" className="w-full h-12 bg-slate-950 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all mt-4" disabled={isPending || isSelecting}>
                {(isPending || isSelecting) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete My Registration"}
            </Button>
        </form>
    );
}

function OnboardingSuccessView({ onComplete, isCompleting }: { onComplete: () => void, isCompleting: boolean }) {
    return (
        <div className="mx-auto flex max-w-[350px] flex-col justify-center gap-6 text-center">
            <div className="flex justify-center">
                <div className="bg-green-50 p-5 rounded-full ring-8 ring-green-50/50">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-logo uppercase tracking-tight text-slate-950">You're all set!</h1>
                <p className="text-slate-500 font-medium leading-relaxed">
                    You have successfully joined the organization. Welcome aboard!
                </p>
            </div>

            <Button size="lg" onClick={onComplete} disabled={isCompleting} className="w-full h-14 rounded-2xl bg-slate-950 text-white font-bold shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                {isCompleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Go to Dashboard"}
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
                router.push("/select-organization");
            },
            onError: () => {
                toast.error("Failed to complete registration");
            }
        });
    };

    if (step === "password") {
        return (
            <div className="mx-auto flex max-w-[350px] flex-col justify-center gap-8 py-4">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold font-logo uppercase text-slate-950 tracking-tight text-center">Set up account</h1>
                    <p className="text-slate-500 font-medium text-sm">Create a strong password to get started.</p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
                <Label htmlFor="password" title="Password" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                />
                {error && <p className="text-xs font-bold text-red-500 mt-1 ml-1">{error}</p>}
            </div>
            <div className="space-y-2.5">
                <Label htmlFor="confirmPassword" title="Confirm Password" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                />
            </div>
            <Button type="submit" size="lg" className="w-full h-12 bg-slate-950 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all mt-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue Setup"}
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
        <div className="mx-auto flex max-w-[350px] flex-col justify-center gap-8 py-4">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold font-logo uppercase text-slate-950 tracking-tight text-center">First Project</h1>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">Let's create your first project to start tracking time.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2.5">
                    <Label htmlFor="project-name" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Project Name</Label>
                    <Input
                        id="project-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Website Overhaul"
                        className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary transition-all text-base"
                    />
                </div>
                <div className="space-y-2.5">
                    <Label htmlFor="project-description" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Description (Optional)</Label>
                    <Textarea
                        id="project-description"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        placeholder="What is this project about?"
                        className="h-24 px-4 py-3 rounded-xl border-slate-200 focus:border-primary transition-all text-base resize-none"
                    />
                </div>
                <Button type="submit" size="lg" className="w-full h-12 bg-slate-950 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all mt-4" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Project & Continue"}
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
        <div className="mx-auto flex flex-col justify-center gap-8 py-4">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold font-logo uppercase text-slate-950 tracking-tight text-center">Build your Team</h1>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">Invite your team members to join this workspace.</p>
            </div>
            
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                <AddOrganizationMembers onSubmit={handleSubmit} isLoading={isPending} />
            </div>

            <Button size="lg" variant="ghost" onClick={onNext} className="w-full h-12 rounded-xl font-bold text-slate-500 hover:text-slate-900">
                Continue without inviting members
            </Button>
        </div>
    )
}
