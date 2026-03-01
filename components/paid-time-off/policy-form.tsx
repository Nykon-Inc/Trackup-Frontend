import { useFormik } from 'formik'
import * as Yup from 'yup'
import { format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePickerCalendar } from '@/components/ui/date-picker-calendar'
import { SelectControlled } from '@/components/ui/select-controlled'
import { useGetProjects } from '@/services/projects.services'
import React, { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { IPTOPolicy } from '@/interfaces/paid-time-offs.interfaces'

export interface Policy {
    id: string
    name: string
    maxDaysPerYear: number
    effectiveDate: string
    description: string
    enabled: boolean
    userCount: number
    projectIds: string[]
}

interface Project {
    id: string
    name: string
}

interface PolicyFormProps {
    open: boolean
    onClose: () => void
    onSave: (policy: Omit<Policy, 'id' | 'userCount'>, resetForm: () => void) => void
    policy?: IPTOPolicy | null
}

const validationSchema = Yup.object({
    name: Yup.string().trim().required('Policy name is required'),
    maxDaysPerYear: Yup.number()
        .typeError('Must be a positive number')
        .positive('Must be a positive number')
        .required('Days allowed is required'),
    effectiveDate: Yup.date().required('Effective date is required'),
    description: Yup.string(),
    allProjects: Yup.boolean(),
    selectedProjects: Yup.array().when('allProjects', {
        is: false,
        then: (schema) =>
            schema.min(1, 'Please select at least one project'),
        otherwise: (schema) => schema,
    }),
})

export function PolicyForm({ open, onClose, onSave, policy }: PolicyFormProps) {
    const [projectSearch, setProjectSearch] = React.useState('')
    const params = useParams();
    const { account } = useAuthStore();

    const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useGetProjects({
        organizationId: params?.orgId as string,
        userId: account?.id || "",
        query: projectSearch ? { search: projectSearch } : undefined,
    })

    const allFetchedProjects: Project[] = projectsData?.results ?? []

    const getInitialProjectValues = () => {
        if (!policy?.projectIds?.length) {
            return { allProjects: false, selectedProjects: [] as Project[] }
        }

        if (!allFetchedProjects.length) {
            return { allProjects: true, selectedProjects: [] as Project[] }
        }

        const allIds = new Set(allFetchedProjects.map((p) => p.id))
        const policyIds = new Set(policy.projectIds)

        const isAll =
            policyIds.size === allIds.size &&
            [...policyIds].every((id) => allIds.has(id))

        if (isAll) {
            return { allProjects: true, selectedProjects: [] as Project[] }
        }

        return {
            allProjects: false,
            selectedProjects: allFetchedProjects.filter((p) => policyIds.has(p.id)),
        }
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: policy?.name ?? '',
            maxDaysPerYear: policy?.maxDaysPerYear ?? '',
            effectiveDate: policy?.effectiveDate ? parseISO(policy.effectiveDate) : null as Date | null,
            description: policy?.description ?? '',
            ...getInitialProjectValues(),
        },
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            const projectIds = values.allProjects
                ? allFetchedProjects.map((p) => p.id)
                : values.selectedProjects.map((p) => p.id)

            onSave(
                {
                    name: values.name,
                    maxDaysPerYear: Number(values.maxDaysPerYear),
                    effectiveDate: values.effectiveDate ? format(values.effectiveDate, 'yyyy-MM-dd') : '',
                    description: values.description,
                    enabled: policy?.enabled ?? true,
                    projectIds,
                },
                resetForm
            )
        },
    })

    const handleClose = () => {
        formik.resetForm()
        onClose()
    }

    const handleAllProjectsToggle = (checked: boolean) => {
        formik.setFieldValue('allProjects', checked)
        // Clear manual selection when toggling back to "all"
        if (checked) {
            formik.setFieldValue('selectedProjects', [])
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogTitle>
                    {policy ? 'Edit Policy' : 'Create New Policy'}
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="name">Policy Name</Label>
                            <Input
                                id="name"
                                {...formik.getFieldProps('name')}
                                placeholder="e.g., Annual Leave"
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-xs text-red-500">{formik.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="maxDaysPerYear">Days Allowed per Year</Label>
                            <Input
                                id="maxDaysPerYear"
                                type="number"
                                {...formik.getFieldProps('maxDaysPerYear')}
                                placeholder="e.g., 20"
                                min="0"
                            />
                            {formik.touched.maxDaysPerYear && formik.errors.maxDaysPerYear && (
                                <p className="text-xs text-red-500">{formik.errors.maxDaysPerYear}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label>Effective Date</Label>
                            <DatePickerCalendar
                                selected={formik.values.effectiveDate || undefined}
                                onSelect={(date: Date | undefined) => formik.setFieldValue('effectiveDate', date ?? null)}
                                placeholder="Pick a date"
                                classname='w-full'
                                error={!!(formik.touched.effectiveDate && formik.errors.effectiveDate)}
                            />
                            {formik.touched.effectiveDate && formik.errors.effectiveDate && (
                                <p className="text-xs text-red-500">{formik.errors.effectiveDate as string}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...formik.getFieldProps('description')}
                                placeholder="Brief description of the policy..."
                            />
                        </div>

                        {/* Project assignment */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="allProjects"
                                    checked={formik.values.allProjects}
                                    onCheckedChange={(checked) => handleAllProjectsToggle(!!checked)}
                                />
                                <Label htmlFor="allProjects" className="cursor-pointer font-normal">
                                    Add all current projects to this policy
                                </Label>
                            </div>

                            {!formik.values.allProjects && (
                                <div className="space-y-1">
                                    <Label>Select Projects</Label>
                                    <SelectControlled<Project>
                                        mode="multiple"
                                        value={formik.values.selectedProjects}
                                        onChange={(projects) => formik.setFieldValue('selectedProjects', projects)}
                                        onSearch={setProjectSearch}
                                        items={allFetchedProjects}
                                        isLoading={projectsLoading}
                                        error={projectsError ? 'Failed to load projects' : null}
                                        getId={(p) => p.id}
                                        getLabel={(p) => p.name}
                                        placeholder="Search projects…"
                                        searchMinChars={1}
                                    />
                                    {formik.touched.selectedProjects && formik.errors.selectedProjects && (
                                        <p className="text-xs text-red-500">
                                            {formik.errors.selectedProjects as string}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-3">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {policy
                                ? formik.isSubmitting ? "Saving..." : "Save Policy"
                                : formik.isSubmitting ? "Creating..." : "Create New Policy"
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}