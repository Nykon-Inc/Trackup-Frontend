import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IPTOPolicy } from '@/interfaces/paid-time-offs.interfaces';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

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
    startDate: Yup.string().required('Start date is required'),
    endDate: Yup.string()
        .required('End date is required')
        .test('is-after', 'End date must be after start date', function (value) {
            const { startDate } = this.parent;
            return !startDate || !value || new Date(value) >= new Date(startDate);
        }),
    reason: Yup.string(),
    isStartHalfDay: Yup.boolean(),
    isEndHalfDay: Yup.boolean(),
});

export function PTORequestForm({ policies, onSubmit, isSubmitting, isFormOpen, onClose }: PTORequestFormProps) {
    const formik = useFormik({
        initialValues: {
            policyId: '',
            startDate: '',
            endDate: '',
            reason: '',
            isStartHalfDay: false,
            isEndHalfDay: false,
        },
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            const days = calculateDays(values.startDate, values.endDate, values.isStartHalfDay, values.isEndHalfDay);
            onSubmit({ ...values, days }, resetForm);
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

    const daysRequested = calculateDays(
        formik.values.startDate,
        formik.values.endDate,
        formik.values.isStartHalfDay,
        formik.values.isEndHalfDay,
    );
    const selectedPolicyData = policies.find((p) => p.id === formik.values.policyId);
    const isOverBalance = false;

    const handleDateSelect = (field: 'startDate' | 'endDate', date: Date | undefined) => {
        const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
        formik.setFieldValue(field, formattedDate, true);
        formik.setFieldTouched(field, true, false);
    };

    const renderDateField = (field: 'startDate' | 'endDate', label: string) => {
        const val = formik.values[field];
        const date = val ? parseISO(val) : undefined;
        const halfDayField = field === 'startDate' ? 'isStartHalfDay' : 'isEndHalfDay';

        return (
            <div className="space-y-1">
                <Label>{label}</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !date && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP') : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => handleDateSelect(field, d)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {formik.touched[field] && formik.errors[field] && (
                    <p className="text-xs text-red-500">{formik.errors[field]}</p>
                )}
                {date && (
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
                                    <span>Available: <strong>{5} days</strong></span>
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