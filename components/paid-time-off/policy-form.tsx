import { useFormik } from 'formik'
import * as Yup from 'yup'
import { format, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface Policy {
    id: string
    name: string
    maxDaysPerYear: number
    effectiveDate: string
    description: string
    enabled: boolean
    userCount: number
}

interface PolicyFormProps {
    open: boolean
    onClose: () => void
    onSave: (policy: Omit<Policy, 'id' | 'userCount'>, resetForm: () => void) => void
    policy?: Policy | null
}

const validationSchema = Yup.object({
    name: Yup.string().trim().required('Policy name is required'),
    maxDaysPerYear: Yup.number()
        .typeError('Must be a positive number')
        .positive('Must be a positive number')
        .required('Days allowed is required'),
    effectiveDate: Yup.string().required('Effective date is required'),
    description: Yup.string(),
})

export function PolicyForm({ open, onClose, onSave, policy }: PolicyFormProps) {
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: policy?.name ?? '',
            maxDaysPerYear: policy?.maxDaysPerYear ?? '',
            effectiveDate: policy?.effectiveDate ?? '',
            description: policy?.description ?? '',
        },
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            onSave(
                {
                    name: values.name,
                    maxDaysPerYear: Number(values.maxDaysPerYear),
                    effectiveDate: values.effectiveDate,
                    description: values.description,
                    enabled: policy?.enabled ?? true,
                },
                resetForm
            )
        },
    })

    const handleClose = () => {
        formik.resetForm()
        onClose()
    }

    const handleDateSelect = (date: Date | undefined) => {
        formik.setFieldValue('effectiveDate', date ? format(date, 'yyyy-MM-dd') : '')
        formik.setFieldTouched('effectiveDate', true)
    }

    const selectedDate = formik.values.effectiveDate
        ? parseISO(formik.values.effectiveDate)
        : undefined

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
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !selectedDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {formik.touched.effectiveDate && formik.errors.effectiveDate && (
                                <p className="text-xs text-red-500">{formik.errors.effectiveDate}</p>
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
                    </div>
                    <DialogFooter className="mt-3">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {
                                policy
                                    ? formik.isSubmitting
                                        ? "Saving..."
                                        : "Save Policy"
                                    : formik.isSubmitting
                                        ? "Creating..."
                                        : "Create New Policy"
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}