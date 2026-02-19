import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerCalendar } from '@/components/ui/date-picker-calendar';
import { IPTOPolicy } from '@/interfaces/paid-time-offs.interfaces';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { cn } from '@/lib/utils';

interface PTORequestFormProps {
    policies: IPTOPolicy[]
    isSubmitting: boolean;
    isFormOpen: boolean;
    onClose: () => void;
    onSubmit: (request: {
        policyId: string;
        startDate: string;
        endDate: string;
        days: number;
        reason: string;
        isStartHalfDay: boolean;
        isEndHalfDay: boolean;
    }, resetForm: () => void) => void;
}

const validationSchema = Yup.object({
    policyId: Yup.string().required('Please select a policy'),
    startDate: Yup.date().required('Start date is required').nullable(),
    endDate: Yup.date()
        .required('End date is required')
        .nullable()
        .test('is-after', 'End date must be after start date', function (value) {
            const { startDate } = this.parent;
            return !startDate || !value || value >= startDate;
        }),
    reason: Yup.string(),
    isStartHalfDay: Yup.boolean(),
    isEndHalfDay: Yup.boolean(),
});

export function PTORequestForm({ policies, onSubmit, isSubmitting, isFormOpen, onClose }: PTORequestFormProps) {
    const formik = useFormik({
        initialValues: {
            policyId: '',
            startDate: null as Date | null,
            endDate: null as Date | null,
            reason: '',
            isStartHalfDay: false,
            isEndHalfDay: false,
        },
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            const startStr = values.startDate ? format(values.startDate, 'yyyy-MM-dd') : '';
            const endStr = values.endDate ? format(values.endDate, 'yyyy-MM-dd') : '';
            const days = calculateDays(startStr, endStr, values.isStartHalfDay, values.isEndHalfDay);
            onSubmit({
                policyId: values.policyId,
                startDate: startStr,
                endDate: endStr,
                days,
                reason: values.reason,
                isStartHalfDay: values.isStartHalfDay,
                isEndHalfDay: values.isEndHalfDay,
            }, resetForm);
        },
    });

    const calculateDays = (start: string, end: string, isStartHalfDay: boolean, isEndHalfDay: boolean) => {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        if (e < s) return 0;
        let days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (isStartHalfDay) days -= 0.5;
        if (isEndHalfDay) days -= 0.5;
        return days;
    };

    const startStr = formik.values.startDate ? format(formik.values.startDate, 'yyyy-MM-dd') : '';
    const endStr = formik.values.endDate ? format(formik.values.endDate, 'yyyy-MM-dd') : '';
    const daysRequested = calculateDays(startStr, endStr, formik.values.isStartHalfDay, formik.values.isEndHalfDay);
    const selectedPolicyData = policies.find((p) => p.id === formik.values.policyId);
    const isOverBalance = false;

    const renderDateField = (field: 'startDate' | 'endDate', label: string) => {
        const halfDayField = field === 'startDate' ? 'isStartHalfDay' : 'isEndHalfDay';
        const value = formik.values[field];

        return (
            <div className="space-y-1">
                <Label>{label}</Label>
                <DatePickerCalendar
                    selected={value || undefined}
                    onSelect={(date: Date | undefined) => formik.setFieldValue(field, date ?? null)}
                    placeholder="Pick a date"
                    error={!!(formik.touched[field] && formik.errors[field])}
                    classname='w-full'
                />
                {formik.touched[field] && formik.errors[field] && (
                    <p className="text-xs text-red-500">{formik.errors[field] as string}</p>
                )}
                {value && (
                    <div className="flex items-center gap-2 pt-0.5">
                        <Checkbox
                            id={halfDayField}
                            checked={formik.values[halfDayField]}
                            onCheckedChange={(checked) =>
                                formik.setFieldValue(halfDayField, checked === true)
                            }
                        />
                        <Label htmlFor={halfDayField} className="text-xs text-muted-foreground font-normal cursor-pointer">
                            Half day
                        </Label>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={() => { onClose() }}>
            <DialogContent>
                <DialogTitle>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Request Time Off</h2>
                    </div>
                </DialogTitle>
                <form onSubmit={formik.handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <Label htmlFor="policyId">Policy Type</Label>
                            <select
                                id="policyId"
                                {...formik.getFieldProps('policyId')}
                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="" disabled>Select a policy</option>
                                {policies.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {formik.touched.policyId && formik.errors.policyId && (
                                <p className="text-xs text-red-500">{formik.errors.policyId}</p>
                            )}
                            {selectedPolicyData && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <InfoIcon className="h-4 w-4" />
                                    <span>Maximum days per year: <strong>{selectedPolicyData.maxDaysPerYear}</strong></span>
                                </div>
                            )}
                        </div>

                        {renderDateField('startDate', 'Start Date')}
                        {renderDateField('endDate', 'End Date')}
                    </div>

                    {daysRequested > 0 && (
                        <div className={cn("rounded-md p-4", isOverBalance ? "bg-red-50" : "bg-muted")}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total Days Requested:</span>
                                <Badge variant={isOverBalance ? "destructive" : "secondary"}>
                                    {daysRequested} {daysRequested === 1 ? 'day' : 'days'}
                                </Badge>
                            </div>
                            {isOverBalance && (
                                <p className="mt-2 text-xs text-red-500 font-medium">
                                    This exceeds your available balance of {0} days.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Textarea
                            id="reason"
                            {...formik.getFieldProps('reason')}
                            placeholder="Add any additional information..."
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => formik.resetForm()}>
                            Clear
                        </Button>
                        <Button type="submit" disabled={isSubmitting || isOverBalance}>
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}