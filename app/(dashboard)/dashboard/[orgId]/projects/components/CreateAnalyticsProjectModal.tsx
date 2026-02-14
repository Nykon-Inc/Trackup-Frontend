"use client"

import { useState, useMemo, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProject } from "@/services/projects.services";
import { useGetHubstaffProjects } from "@/services/organization.services";
import { SelectControlled } from "@/components/ui/select-controlled";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

const CreateAnalyticsProjectSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .required("Project name is required"),
    description: Yup.string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
});

interface CreateAnalyticsProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateAnalyticsProjectModal({ open, onOpenChange }: CreateAnalyticsProjectModalProps) {
    const createProjectMutation = useCreateProject();
    const { activeOrgId, activeOrg } = useWorkspace();

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            hubstaffProjectId: "",
        },
        validationSchema: CreateAnalyticsProjectSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            if (!activeOrgId) return;
            try {
                await createProjectMutation.mutateAsync({
                    ...values,
                    organizationId: activeOrgId,
                    type: "analytics"
                });
                toast.success("Analytics project created successfully");
                onOpenChange(false);
                resetForm();
            } catch (error) {
                console.error("Failed to create analytics project:", error);
                toast.error("Failed to create analytics project");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const isHubstaffConnected = !!activeOrg?.organization?.isHubstaffConnected;

    const [hubstaffSearch, setHubstaffSearch] = useState("");

    // Reset search when modal closes
    useEffect(() => {
        if (!open) setHubstaffSearch("");
    }, [open]);

    const { data: hubstaffProjects, isLoading: isLoadingHubstaff } = useGetHubstaffProjects(activeOrgId || "", isHubstaffConnected);

    const filteredProjects = useMemo(() => {
        const list = Array.isArray(hubstaffProjects) ? hubstaffProjects : [];
        if (!hubstaffSearch) return list;
        return list.filter((p: any) => p.name.toLowerCase().includes(hubstaffSearch.toLowerCase()));
    }, [hubstaffProjects, hubstaffSearch]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Analytics Project</DialogTitle>
                    <DialogDescription>
                        Create a project for data analysis and reporting.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
                    {!isHubstaffConnected ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Hubstaff not connected</p>
                                <p className="text-sm">
                                    To create an Analytics project, please go to{" "}
                                    <Link
                                        href={`/dashboard/${activeOrgId}/settings`}
                                        className="font-bold underline hover:text-amber-900"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        Settings
                                    </Link>{" "}
                                    and connect your Hubstaff account.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Select Hubstaff Project
                                </label>
                                <SelectControlled
                                    mode="single"
                                    items={filteredProjects}
                                    isLoading={isLoadingHubstaff}
                                    onSearch={setHubstaffSearch}
                                    getId={(item: any) => item.id.toString()}
                                    getLabel={(item: any) => item.name}
                                    value={filteredProjects.find((p: any) => p.id.toString() === formik.values.hubstaffProjectId)}
                                    onChange={(project: any) => {
                                        if (project) {
                                            formik.setFieldValue("hubstaffProjectId", project.id.toString());
                                            formik.setFieldValue("name", project.name);
                                        } else {
                                            formik.setFieldValue("hubstaffProjectId", "");
                                            formik.setFieldValue("name", "");
                                        }
                                    }}
                                    placeholder="Search and select a project..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Name
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Q1 Sales Analysis"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    aria-invalid={formik.touched.name && !!formik.errors.name}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="text-xs text-destructive">{formik.errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">
                                    Description
                                </label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Optional project description..."
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                        </>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            disabled={formik.isSubmitting || !formik.isValid || !isHubstaffConnected}
                        >
                            {formik.isSubmitting ? "Creating..." : "Create Analytics Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
