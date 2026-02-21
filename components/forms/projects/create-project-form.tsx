"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectControlled } from "@/components/ui/select-controlled";
import { useGetInternalOrganizations } from "@/services/organization.services";
import { useCreateProjectInternal } from "@/services/projects.services";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Organization } from "@/interfaces/organizations.interfaces";

interface CreateProjectFormProps {
    onClose?: () => void;
}

export function CreateProjectForm({ onClose }: CreateProjectFormProps) {
    const [orgSearch, setOrgSearch] = useState("");

    // Fetch organizations with pagination/searching
    const { data: orgData, isLoading: isLoadingOrgs } = useGetInternalOrganizations({
        search: orgSearch,
        limit: 30,
        page: 1
    });

    const createProjectMutation = useCreateProjectInternal();

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            organization: null as Organization | null,
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Project name is required"),
            description: Yup.string().optional(),
            organization: Yup.object().nullable().required("Organization is required"),
        }),
        onSubmit: async (values) => {
            if (!values.organization) return;

            try {
                await createProjectMutation.mutateAsync({
                    name: values.name,
                    description: values.description,
                    organizationId: values.organization.id,
                });
                toast.success("Project created successfully");
                onClose?.();
            } catch (error) {
                toast.error("Failed to create project");
                console.error(error);
            }
        },
    });

    // Handle the internal org data structure (assuming generic pagination response)
    const organizations = (orgData as any)?.results || [];

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Website Redesign"
                    {...formik.getFieldProps("name")}
                />
                {formik.touched.name && formik.errors.name && (
                    <div className="text-sm text-red-500">{formik.errors.name}</div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <SelectControlled<Organization>
                    mode="single"
                    value={formik.values.organization}
                    onChange={(val) => formik.setFieldValue("organization", val)}
                    onSearch={setOrgSearch}
                    items={organizations}
                    isLoading={isLoadingOrgs}
                    getId={(item) => item.id}
                    getLabel={(item) => item.name}
                    placeholder="Select organization..."
                    searchable
                />
                {formik.touched.organization && formik.errors.organization && (
                    <div className="text-sm text-red-500">{formik.errors.organization as string}</div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Brief description of the project..."
                    {...formik.getFieldProps("description")}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Project
                </Button>
            </div>
        </form>
    );
}
