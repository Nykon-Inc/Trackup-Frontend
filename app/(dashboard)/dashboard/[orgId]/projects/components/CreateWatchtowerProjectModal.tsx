"use client"

import { useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useCreateProject, useInviteMembersToProject } from "@/services/projects.services";
import { useGetOrganizationMembers } from "@/services/organization.services";
import { toast } from "sonner";
import { Stepper, Step } from "@/components/ui/stepper";
import { ClipboardList, Users, CheckCircle2, Search, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ProjectMemberRole } from "@/interfaces/projects.interfaces";
import { OrganizationMember, OrganizationMemberRole } from "@/interfaces/organizations.interfaces";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const CreateWatchtowerProjectSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .required("Project name is required"),
    description: Yup.string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
});

interface CreateWatchtowerProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const steps: Step[] = [
    { title: "Project Details", value: "details", icon: ClipboardList },
    { title: "Team Members", value: "team", icon: Users },
    { title: "Confirm", value: "confirm", icon: CheckCircle2 },
];

export function CreateWatchtowerProjectModal({ open, onOpenChange }: CreateWatchtowerProjectModalProps) {
    const { activeOrgId } = useWorkspace();
    const [currentStep, setCurrentStep] = useState("details");
    const [memberSearch, setMemberSearch] = useState("");

    const createProjectMutation = useCreateProject();
    const inviteMembersMutation = useInviteMembersToProject();

    const { data: orgMembers, isLoading: isLoadingMembers } = useGetOrganizationMembers({
        organizationId: activeOrgId || "",
        query: { limit: 100 } // Fetch more for selection
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            allowScreenshots: false,
            allowManualTimeEdits: true,
            selectedMembers: [] as string[], // array of user emails or IDs
        },
        validationSchema: currentStep === "details" ? CreateWatchtowerProjectSchema : Yup.object(),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            if (!activeOrgId) return;

            try {
                // 1. Create Project
                const project = await createProjectMutation.mutateAsync({
                    name: values.name,
                    description: values.description,
                    organizationId: activeOrgId,
                    type: "watchtower",
                    screenshotsEnabled: values.allowScreenshots,
                    manualTimeEditsEnabled: values.allowManualTimeEdits,
                });

                // 2. Add Members if any selected
                if (values.selectedMembers.length > 0) {
                    const membersToInvite = values.selectedMembers.map(email => ({
                        email,
                        role: ProjectMemberRole.MEMBER
                    }));

                    await inviteMembersMutation.mutateAsync({
                        projectId: project.id,
                        members: membersToInvite,
                        organizationId: activeOrgId
                    });
                }

                toast.success("Project created successfully");
                // Small delay to allow user to see success state if needed
                setTimeout(() => {
                    handleClose();
                    resetForm();
                }, 100);
            } catch (error: unknown) {
                console.error("Failed to create project:", error);
                const message =
                    typeof error === "object" &&
                        error !== null &&
                        "response" in error &&
                        (error as { response?: { data?: { message?: string } } }).response?.data?.message
                        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                        : "Failed to create project";

                toast.error(message);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const filteredMembers = useMemo(() => {
        if (!orgMembers) return [];
        return orgMembers.results.filter((member: OrganizationMember) => {
            const nameMatch = member.user.name?.toLowerCase().includes(memberSearch.toLowerCase());
            const emailMatch = member.user.email?.toLowerCase().includes(memberSearch.toLowerCase());
            return (nameMatch || emailMatch) && member.role !== OrganizationMemberRole.OWNER;
        });
    }, [orgMembers, memberSearch]);

    const handleNext = async () => {
        if (currentStep === "details") {
            const errors = await formik.validateForm();
            if (Object.keys(errors).length > 0) {
                formik.setTouched({ name: true, description: true });
                return;
            }
            setCurrentStep("team");
        } else if (currentStep === "team") {
            setCurrentStep("confirm");
        }
    };

    const handleBack = () => {
        if (currentStep === "team") setCurrentStep("details");
        if (currentStep === "confirm") setCurrentStep("team");
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => setCurrentStep("details"), 300); // Reset after animation
    };

    const toggleMember = (memberEmail: string) => {
        const current = formik.values.selectedMembers;
        if (current.includes(memberEmail)) {
            formik.setFieldValue("selectedMembers", current.filter(id => id !== memberEmail));
        } else {
            formik.setFieldValue("selectedMembers", [...current, memberEmail]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold">Create Project</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">Set up your project in a few simple steps.</p>
                </DialogHeader>

                <div className="px-6 py-4">
                    <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

                    {currentStep === "details" && (
                        <div className="space-y-3 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Project Name *</label>
                                <Input
                                    placeholder="e.g., Website Redesign"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    name="name"
                                    className={cn(
                                        "h-12 text-base",
                                        formik.touched.name && formik.errors.name && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="text-xs text-destructive">{formik.errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Description / Client</label>
                                <Textarea
                                    placeholder="Optional description or client name"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    name="description"
                                    className="min-h-[120px] resize-none text-base"
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-0">
                                <Checkbox
                                    id="allowScreenshots"
                                    checked={!formik.values.allowScreenshots}
                                    onCheckedChange={(checked) => formik.setFieldValue("allowScreenshots", !checked)}
                                />
                                <label
                                    htmlFor="allowScreenshots"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Disable screenshots
                                </label>
                            </div>

                            <div className="flex items-center space-x-2 pt-0">
                                <Checkbox
                                    id="allowManualTimeEdits"
                                    checked={!formik.values.allowManualTimeEdits}
                                    onCheckedChange={(checked) => formik.setFieldValue("allowManualTimeEdits", !checked)}
                                />
                                <label
                                    htmlFor="allowManualTimeEdits"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Disable manual time edits
                                </label>
                            </div>
                        </div>
                    )}

                    {currentStep === "team" && (
                        <div className="space-y-4 py-2">
                            <label className="text-sm font-semibold">Select Team Members</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search team members..."
                                    className="pl-10 h-10"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                />
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <div className="max-h-[300px] overflow-y-auto">
                                    {isLoadingMembers ? (
                                        <div className="p-8 flex justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : filteredMembers.length === 0 ? (
                                        <div className="p-8 text-center text-sm text-muted-foreground">
                                            No members found
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {filteredMembers.map((member: OrganizationMember) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                                    onClick={() => toggleMember(member.user.email)}
                                                >
                                                    <Checkbox
                                                        checked={formik.values.selectedMembers.includes(member.user.email)}
                                                        onCheckedChange={() => toggleMember(member.user.email)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${member.user.email}`} />
                                                        <AvatarFallback>{member.user.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium leading-none truncate">{member.user.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-1 truncate capitalize">{member.role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-[12px] text-muted-foreground">
                                Don't see a team member? <Link href={`/dashboard/${activeOrgId}/teams`} className="font-semibold text-foreground cursor-pointer hover:underline">Add them under the Team tab</Link>
                            </p>
                        </div>
                    )}

                    {currentStep === "confirm" && (
                        <div className="space-y-6 py-4">
                            <div className="bg-muted/30 border rounded-xl p-6 space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Project Name</h3>
                                    <p className="text-lg font-bold">{formik.values.name}</p>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Team Members</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {formik.values.selectedMembers.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">No members selected</p>
                                        ) : (
                                            formik.values.selectedMembers.map((email) => {
                                                const member = orgMembers?.results?.find((m: OrganizationMember) => m.user.email === email);
                                                return (
                                                    <div key={email} className="flex items-center gap-2 bg-white border rounded-full px-2 py-1 pr-3">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={`https://i.pravatar.cc/150?u=${email}`} />
                                                            <AvatarFallback>{member?.user.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-medium">{member?.user.name}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Settings</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "flex h-5 w-5 items-center justify-center rounded-full text-white",
                                                formik.values.allowScreenshots ? "bg-black" : "bg-muted-foreground"
                                            )}>
                                                {formik.values.allowScreenshots ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            </div>
                                            <span className="text-sm font-medium">
                                                {formik.values.allowScreenshots ? "Screenshots enabled" : "Screenshots disabled"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "flex h-5 w-5 items-center justify-center rounded-full text-white",
                                                formik.values.allowManualTimeEdits ? "bg-black" : "bg-muted-foreground"
                                            )}>
                                                {formik.values.allowManualTimeEdits ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            </div>
                                            <span className="text-sm font-medium">
                                                {formik.values.allowManualTimeEdits ? "Manual time edits enabled" : "Manual time edits disabled"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                Review the details above and click "Create Project" to confirm.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-2 border-t flex flex-row items-center justify-between sm:justify-between sm:space-x-0">
                    {currentStep === "details" ? (
                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleClose}
                            className="px-6 h-11"
                        >
                            Cancel
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleBack}
                            className="gap-2 px-6 h-11"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </Button>
                    )}

                    {currentStep === "confirm" ? (
                        <Button
                            type="button"
                            onClick={() => formik.handleSubmit()}
                            className="px-8 h-11 bg-black text-white hover:bg-black/90"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Project"
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="gap-2 px-8 h-11 bg-black text-white hover:bg-black/90"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
