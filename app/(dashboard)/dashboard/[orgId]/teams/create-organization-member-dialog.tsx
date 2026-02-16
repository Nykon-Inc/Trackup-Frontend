"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Stepper, Step } from "@/components/ui/stepper";
import { useGetProjects } from "@/services/projects.services";
import { ProjectMemberRole } from "@/interfaces/projects.interfaces";
import { Plus, User, Briefcase, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useBulkInvite } from "@/services/organization.services";
import { BulkInviteMember } from "@/interfaces/organizations.interfaces";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

// Organization member roles
enum OrganizationMemberRole {
    MANAGER = 'manager',
    MEMBER = 'member',
}

// Validation schema for step 1
const Step1Schema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    orgRole: Yup.string().required("Organization role is required"),
    payRate: Yup.number().positive("Pay rate must be positive").required("Pay rate is required"),
    startDate: Yup.date().required("Start date is required"),
});

interface ProjectAssignment {
    projectId: string;
    role: ProjectMemberRole;
}

const STEPS: Step[] = [
    { title: "Basic Info", value: "basic", icon: User },
    { title: "Projects", value: "projects", icon: Briefcase },
    { title: "Confirm", value: "confirm", icon: CheckCircle },
];

export function AddOrganizationMember() {
    const [open, setOpen] = useState(false);
    const { account } = useAuthStore()
    const [currentStep, setCurrentStep] = useState("basic");
    const [selectedProjects, setSelectedProjects] = useState<ProjectAssignment[]>([]);
    const { activeOrgId } = useWorkspace();
    const { mutateAsync: bulkInvite } = useBulkInvite();

    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({
        organizationId: activeOrgId || "",
        userId: account?.id || "",
    });

    const formik = useFormik({
        initialValues: {
            email: "",
            orgRole: "" as OrganizationMemberRole | "",
            payRate: "",
            startDate: null as Date | null,
            birthday: null as Date | null,
        },
        validationSchema: Step1Schema,
        validateOnMount: false,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            if (!activeOrgId) return;
            try {
                const memberData: BulkInviteMember = {
                    email: values.email,
                    role: values.orgRole as 'manager' | 'member',
                    birthday: values.birthday ? values.birthday.toISOString() : undefined,
                    startDate: values.startDate ? values.startDate.toISOString() : undefined,
                    projects: selectedProjects.map(p => ({
                        projectId: p.projectId,
                        role: p.role as 'viewer' | 'member' | 'manager'
                    }))
                };

                await bulkInvite({
                    organizationId: activeOrgId,
                    members: [memberData]
                });

                toast.success("Invitation sent successfully");
                setOpen(false);
                resetForm();
                setCurrentStep("basic");
                setSelectedProjects([]);
            } catch (error: any) {
                console.error("Failed to add team member:", error);
                toast.error(error?.response?.data?.message || "Failed to send invitation");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            formik.resetForm();
            setCurrentStep("basic");
            setSelectedProjects([]);
        }
    };

    const handleNext = async () => {
        if (currentStep === "basic") {
            const errors = await formik.validateForm();
            if (Object.keys(errors).length === 0) {
                setCurrentStep("projects");
            } else {
                formik.setTouched({
                    email: true,
                    orgRole: true,
                    payRate: true,
                    startDate: true,
                });
            }
        } else if (currentStep === "projects") {
            setCurrentStep("confirm");
        } else if (currentStep === "confirm") {
            formik.handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep === "projects") {
            setCurrentStep("basic");
        } else if (currentStep === "confirm") {
            setCurrentStep("projects");
        }
    };

    const toggleProject = (projectId: string) => {
        const exists = selectedProjects.find(p => p.projectId === projectId);
        if (exists) {
            setSelectedProjects(selectedProjects.filter(p => p.projectId !== projectId));
        } else {
            setSelectedProjects([...selectedProjects, { projectId, role: ProjectMemberRole.MEMBER }]);
        }
    };

    const updateProjectRole = (projectId: string, role: ProjectMemberRole) => {
        setSelectedProjects(selectedProjects.map(p =>
            p.projectId === projectId ? { ...p, role } : p
        ));
    };

    const isProjectSelected = (projectId: string) => {
        return selectedProjects.some(p => p.projectId === projectId);
    };

    const getProjectRole = (projectId: string) => {
        return selectedProjects.find(p => p.projectId === projectId)?.role || ProjectMemberRole.MEMBER;
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Team Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Add a new team member to your organization.
                    </DialogDescription>
                </DialogHeader>

                <Stepper steps={STEPS} currentStep={currentStep} className="mb-6" />

                <form onSubmit={formik.handleSubmit} className="contents">
                    {/* Step 1: Basic Info */}
                    {currentStep === "basic" && (
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="e.g., john.smith@example.com"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <p className="text-sm text-red-500">{formik.errors.email}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="orgRole">Organization Role *</Label>
                                    <select
                                        id="orgRole"
                                        name="orgRole"
                                        value={formik.values.orgRole}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            formik.touched.orgRole && formik.errors.orgRole ? "border-red-500" : ""
                                        )}
                                    >
                                        <option value="">Select role</option>
                                        <option value={OrganizationMemberRole.MEMBER}>Member</option>
                                        <option value={OrganizationMemberRole.MANAGER}>Manager</option>
                                    </select>
                                    {formik.touched.orgRole && formik.errors.orgRole && (
                                        <p className="text-sm text-red-500">{formik.errors.orgRole}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="payRate">Pay Rate ($/hr) *</Label>
                                    <Input
                                        id="payRate"
                                        name="payRate"
                                        type="number"
                                        placeholder="e.g., 50"
                                        value={formik.values.payRate}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={formik.touched.payRate && formik.errors.payRate ? "border-red-500" : ""}
                                    />
                                    {formik.touched.payRate && formik.errors.payRate && (
                                        <p className="text-sm text-red-500">{formik.errors.payRate}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Start Date *</Label>
                                    <DatePickerCalendar
                                        selected={formik.values.startDate || undefined}
                                        onSelect={(date: Date | undefined) => formik.setFieldValue("startDate", date)}
                                        placeholder="Pick date"
                                        error={!!(formik.touched.startDate && formik.errors.startDate)}
                                    />
                                    {formik.touched.startDate && formik.errors.startDate && (
                                        <p className="text-sm text-red-500">{formik.errors.startDate as string}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Birthday (optional)</Label>
                                    <DatePickerCalendar
                                        selected={formik.values.birthday || undefined}
                                        onSelect={(date: Date | undefined) => formik.setFieldValue("birthday", date)}
                                        placeholder="Pick date"
                                        fromYear={1940}
                                        toYear={new Date().getFullYear()}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Projects */}
                    {currentStep === "projects" && (
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Assign this team member to one or more projects. You can also do this later.
                            </p>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {isLoadingProjects ? (
                                    <p className="text-sm text-muted-foreground">Loading projects...</p>
                                ) : projectsData?.results && projectsData.results.length > 0 ? (
                                    projectsData.results.map((project) => {
                                        const selected = isProjectSelected(project.id);
                                        return (
                                            <div
                                                key={project.id}
                                                className={cn(
                                                    "flex items-start gap-3 p-4 border rounded-lg transition-colors",
                                                    selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
                                                )}
                                            >
                                                <Checkbox
                                                    id={`project-${project.id}`}
                                                    checked={selected}
                                                    onCheckedChange={() => toggleProject(project.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={`project-${project.id}`}
                                                        className="font-medium cursor-pointer"
                                                    >
                                                        {project.name}
                                                    </label>
                                                    <p className="text-sm text-muted-foreground">{project.description}</p>

                                                    {selected && (
                                                        <div className="mt-3">
                                                            <Label className="text-xs mb-2 block">Project Role</Label>
                                                            <RadioGroup
                                                                value={getProjectRole(project.id)}
                                                                onValueChange={(value: string) => updateProjectRole(project.id, value as ProjectMemberRole)}
                                                                className="flex gap-4"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={ProjectMemberRole.MANAGER} id={`${project.id}-manager`} />
                                                                    <Label htmlFor={`${project.id}-manager`} className="text-sm font-normal cursor-pointer">Manager</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={ProjectMemberRole.MEMBER} id={`${project.id}-member`} />
                                                                    <Label htmlFor={`${project.id}-member`} className="text-sm font-normal cursor-pointer">Member</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={ProjectMemberRole.VIEWER} id={`${project.id}-viewer`} />
                                                                    <Label htmlFor={`${project.id}-viewer`} className="text-sm font-normal cursor-pointer">Viewer</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground">No projects available.</p>
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground">
                                {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} selected
                            </p>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {currentStep === "confirm" && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-semibold">Member Details</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Email</p>
                                        <p className="font-medium">{formik.values.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Organization Role</p>
                                        <p className="font-medium capitalize">{formik.values.orgRole}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Pay Rate</p>
                                        <p className="font-medium">${formik.values.payRate}/hr</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Start Date</p>
                                        <p className="font-medium">
                                            {formik.values.startDate ? format(formik.values.startDate, "PPP") : "N/A"}
                                        </p>
                                    </div>
                                    {formik.values.birthday && (
                                        <div>
                                            <p className="text-muted-foreground">Birthday</p>
                                            <p className="font-medium">{format(formik.values.birthday, "PPP")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedProjects.length > 0 && (
                                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-semibold">Project Assignments</h4>
                                    <div className="space-y-2">
                                        {selectedProjects.map((assignment) => {
                                            const project = projectsData?.results.find(p => p.id === assignment.projectId);
                                            return (
                                                <div key={assignment.projectId} className="flex justify-between items-center text-sm">
                                                    <span>{project?.name}</span>
                                                    <span className="text-muted-foreground capitalize">{assignment.role}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        {currentStep !== "basic" && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={formik.isSubmitting}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>
                        )}
                        {currentStep === "basic" && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={formik.isSubmitting}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={handleNext}
                            disabled={formik.isSubmitting}
                        >
                            {currentStep === "confirm" ? (
                                formik.isSubmitting ? "Adding..." : "Add Member"
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
