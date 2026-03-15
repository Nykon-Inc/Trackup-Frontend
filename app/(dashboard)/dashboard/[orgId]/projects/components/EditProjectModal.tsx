"use client"

import { useEffect } from "react";
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
import { useUpdateProject } from "@/services/projects.services";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "@/interfaces/projects.interfaces";
import { cn } from "@/lib/utils";

const EditProjectSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .required("Project name is required"),
    description: Yup.string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
});

interface EditProjectModalProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProjectModal({ project, open, onOpenChange }: EditProjectModalProps) {
    const { activeOrgId } = useWorkspace();
    const updateProjectMutation = useUpdateProject();

    const formik = useFormik({
        initialValues: {
            name: project.name,
            description: project.description || "",
            allowScreenshots: project.screenshotsEnabled ?? true,
            allowManualTimeEdits: project.allowManualTimeEdits ?? true,
        },
        validationSchema: EditProjectSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!activeOrgId) return;

            try {
                await updateProjectMutation.mutateAsync({
                    organizationId: activeOrgId,
                    projectId: project.id,
                    name: values.name,
                    description: values.description,
                    screenshotsEnabled: values.allowScreenshots,
                    allowManualTimeEdits: values.allowManualTimeEdits,
                });

                toast.success("Project updated successfully");
                onOpenChange(false);
            } catch (error: any) {
                console.error("Failed to update project:", error);
                const message = error?.response?.data?.message || "Failed to update project";
                toast.error(message);
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Project</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">Update your project details and settings.</p>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-6 py-6">
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Project Name *</label>
                        <Input
                            placeholder="e.g., Website Redesign"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={cn(
                                "h-11 rounded-xl border-slate-200 focus:border-primary transition-all text-base",
                                formik.touched.name && formik.errors.name && "border-destructive focus-visible:ring-destructive"
                            )}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <p className="text-xs text-destructive font-bold mt-1 ml-1">{formik.errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Description / Client</label>
                        <Textarea
                            placeholder="Briefly describe the project or mention the client"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="min-h-[100px] rounded-xl border-slate-200 focus:border-primary transition-all text-base resize-none"
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-start space-x-3 group">
                            <Checkbox
                                id="edit-allowScreenshots"
                                checked={formik.values.allowScreenshots}
                                onCheckedChange={(checked) => formik.setFieldValue("allowScreenshots", !!checked)}
                                className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="edit-allowScreenshots"
                                    className="text-sm font-bold text-slate-700 cursor-pointer group-hover:text-primary transition-colors"
                                >
                                    Enable screenshots
                                </label>
                                <p className="text-xs text-slate-400">Capture desktop snapshots during active work sessions.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 group">
                            <Checkbox
                                id="edit-allowManualTimeEdits"
                                checked={formik.values.allowManualTimeEdits}
                                onCheckedChange={(checked) => formik.setFieldValue("allowManualTimeEdits", !!checked)}
                                className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="edit-allowManualTimeEdits"
                                    className="text-sm font-bold text-slate-700 cursor-pointer group-hover:text-primary transition-colors"
                                >
                                    Enable manual time edits
                                </label>
                                <p className="text-xs text-slate-400">Allow team members to manually adjust their time logs.</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-6 border-t gap-3 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl font-bold text-slate-500"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={formik.isSubmitting || !formik.dirty}
                            className="rounded-xl px-8 bg-slate-950 text-white hover:bg-slate-800 font-bold shadow-lg shadow-slate-100 transition-all active:scale-[0.98]"
                        >
                            {formik.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
