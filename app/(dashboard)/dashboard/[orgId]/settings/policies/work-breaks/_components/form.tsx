"use client"

import React, { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SelectControlled } from "@/components/ui/select-controlled"
import { useGetProjects } from "@/services/projects.services"
import { IWorkBreakPolicy, CreateWorkBreakPolicyPayload } from "@/interfaces/work-break.interfaces"
import { useAuthStore } from "@/stores/auth.store"
import { Project } from "@/interfaces/projects.interfaces"

const WorkBreakSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    duration: Yup.number().integer().min(1, "Duration must be at least 1 minute").required("Duration is required"),
    paid: Yup.boolean().default(false),
    enabled: Yup.boolean().default(true),
    projectIds: Yup.array().of(Yup.string()).min(1, "Select at least one project").required("Projects are required"),
})

interface WorkBreakFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orgId: string
    editingPolicy?: IWorkBreakPolicy | null
    onSave: (payload: CreateWorkBreakPolicyPayload) => void
    isSubmitting: boolean
}

export function WorkBreakForm({
    open,
    onOpenChange,
    orgId,
    editingPolicy,
    onSave,
    isSubmitting,
}: WorkBreakFormProps) {
    const { account } = useAuthStore()
    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({
        organizationId: orgId,
        userId: account?.id || "",
        query: {
            projectType: "watchtower"
        }
    })

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            duration: 15,
            paid: false,
            enabled: true,
            projectIds: [] as string[],
        },
        validationSchema: WorkBreakSchema,
        onSubmit: (values) => {
            onSave(values)
        },
    })

    useEffect(() => {
        if (open) {
            if (editingPolicy) {
                formik.resetForm({
                    values: {
                        name: editingPolicy.name,
                        description: editingPolicy.description,
                        duration: editingPolicy.duration,
                        paid: editingPolicy.paid,
                        enabled: editingPolicy.enabled,
                        projectIds: editingPolicy.projectIds,
                    },
                })
            } else {
                formik.resetForm({
                    values: {
                        name: "",
                        description: "",
                        duration: 15,
                        paid: false,
                        enabled: true,
                        projectIds: [] as string[],
                    },
                })
            }
        }
    }, [editingPolicy, open])

    const handleProjectChange = (selected: Project[]) => {
        formik.setFieldValue("projectIds", selected.map((p) => p.id))
    }

    const [projectSearch, setProjectSearch] = useState("")

    const projects: Project[] = projectsData?.results || []

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase())
    )

    const selectedProjects = projects.filter((p) => formik.values.projectIds.includes(p.id))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{editingPolicy ? "Edit" : "Create"} Work Break Policy</DialogTitle>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Policy Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g., Afternoon Tea, Lunch Break"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-xs text-red-500">{formik.errors.name as string}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Explain what this break is for)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Briefly describe the policy"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.description && formik.errors.description && (
                                <p className="text-xs text-red-500">{formik.errors.description as string}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration (Minutes)</Label>
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    value={formik.values.duration}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.duration && formik.errors.duration && (
                                    <p className="text-xs text-red-500">{formik.errors.duration as string}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 justify-center pt-6">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="paid"
                                        checked={formik.values.paid}
                                        onCheckedChange={(checked) => formik.setFieldValue("paid", checked)}
                                    />
                                    <Label htmlFor="paid">This break is paid</Label>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Attach to Projects</Label>
                            <SelectControlled<Project>
                                items={filteredProjects}
                                value={selectedProjects}
                                onChange={handleProjectChange}
                                getId={(p) => p.id}
                                getLabel={(p) => p.name}
                                searchable
                                placeholder="Select watchtower projects"
                                onSearch={setProjectSearch}
                                isLoading={isLoadingProjects}
                            />
                            {formik.touched.projectIds && formik.errors.projectIds && (
                                <p className="text-xs text-red-500">{formik.errors.projectIds as string}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground">Select watchtower projects for user to select which projects(projectIds) to attach to this policy</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="enabled"
                                checked={formik.values.enabled}
                                onCheckedChange={(checked) => formik.setFieldValue("enabled", checked)}
                            />
                            <Label htmlFor="enabled">Policy is active</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : (editingPolicy ? "Update Policy" : "Create Policy")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
