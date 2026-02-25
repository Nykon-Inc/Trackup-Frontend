import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { DatePickerCalendar } from '@/components/ui/date-picker-calendar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { DailyBreakdown } from './pto-daily-breakdown';
import { BalanceSummary } from './pto-balance-summary';
import { FileUpload } from '@/components/file-upload';
import { buildDaysArray, DayEntry } from '@/utils/paid-time-off.utils';
import { SelectControlled } from '@/components/ui/select-controlled';
import { useGetProjectMemberProfile, useGetProjects } from '@/services/projects.services';
import { useGetMyUsedHours, useGetPtoPolicies } from '@/services/paid-time-off.services';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

interface Project {
    id: string;
    name: string;
}

interface PTORequestFormProps {
    isSubmitting: boolean;
    isFormOpen: boolean;
    onClose: () => void;
    holidays?: string[];
    onSubmit: (request: {
        projectId: string;
        policyId: string;
        excludeWeekends: boolean;
        excludeHolidays: boolean;
        days: { date: string; hours: number; }[];
        reason: string;
        files: File[];
        startTime: string;
        endTime: string;
    }, resetForm: () => void) => void;
}

const ALL_DAY_START = '00:00';
const ALL_DAY_END = '23:59';

const isAllDayTime = (start: string, end: string) =>
    start === ALL_DAY_START && end === ALL_DAY_END;

const validationSchema = Yup.object({
    projectId: Yup.string().required('Please select a project'),
    policyId: Yup.string().required('Please select a policy'),
    startDate: Yup.date().required('Start date is required').nullable(),
    endDate: Yup.date()
        .required('End date is required')
        .nullable()
        .test('is-after', 'End date must be on or after start date', function (value) {
            const { startDate } = this.parent;
            return !startDate || !value || value >= startDate;
        }),
    reason: Yup.string(),
    excludeWeekends: Yup.boolean(),
    excludeHolidays: Yup.boolean(),
    startTime: Yup.string().required('Start time is required'),
    endTime: Yup.string().required('End time is required'),
});

export function PTORequestForm({ onSubmit, isSubmitting, isFormOpen, onClose, holidays = [] }: PTORequestFormProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [projectSearch, setProjectSearch] = useState('');
    const params = useParams();
    const { account } = useAuthStore();
    const orgId = params?.orgId as string;

    const formik = useFormik({
        initialValues: {
            projectId: '',
            selectedProject: null as Project | null,
            policyId: '',
            startDate: null as Date | null,
            endDate: null as Date | null,
            reason: '',
            excludeWeekends: true,
            excludeHolidays: true,
            isAllDay: true,
            startTime: ALL_DAY_START,
            endTime: ALL_DAY_END,
            days: [] as DayEntry[],
        },
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            onSubmit({
                projectId: values.projectId,
                policyId: values.policyId,
                excludeWeekends: values.excludeWeekends,
                excludeHolidays: values.excludeHolidays,
                days: values.days.map(({ date, hours }) => ({ date, hours })),
                reason: values.reason,
                files,
                startTime: values.startTime,
                endTime: values.endTime,
            }, () => { resetForm(); setFiles([]); });
        },
    });

    const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useGetProjects({
        organizationId: orgId,
        userId: account?.id || '',
        query: projectSearch ? { search: projectSearch } : undefined,
    });

    const { data: policiesData, isLoading: policiesLoading } = useGetPtoPolicies({
        organizationId: orgId,
        query: {
            status: "active",
            ...(formik.values.projectId && { projectId: formik.values.projectId }),
        },
        enabled: !!formik.values.projectId,
    });

    const { data: profileData, isLoading: profileLoading } = useGetProjectMemberProfile({
        organizationId: orgId,
        projectId: formik.values.projectId,
        userId: account?.id || '',
    });

    const { data: myUsedHoursData, isLoading: myUsedHoursLoading } = useGetMyUsedHours({
        orgId: orgId,
        policyId: formik.values.policyId,
        projectId: formik.values.projectId,
    });

    const allProjects: Project[] = projectsData?.results ?? [];
    const filteredPolicies = policiesData?.results ?? [];
    const selectedPolicyData = filteredPolicies.find(p => p.id === formik.values.policyId);
    const projectSelected = !!formik.values.projectId;

    const handleProjectChange = (project: Project | null) => {
        formik.setFieldValue('selectedProject', project);
        formik.setFieldValue('projectId', project?.id ?? '');
        formik.setFieldValue('policyId', '');
        formik.setFieldValue('days', []);
        formik.setFieldValue('startDate', null);
        formik.setFieldValue('endDate', null);
    };

    const HOURS_PER_DAY = profileData?.member.dailyLimitHours || 0;
    const USED_HOURS = myUsedHoursData?.usedHours || 0;
    const MAX_HOURS = (selectedPolicyData?.maxDaysPerYear || 0) * HOURS_PER_DAY;

    const rebuildDays = (startDate: Date | null, endDate: Date | null, excludeWeekends: boolean, excludeHolidays: boolean) => {
        if (!startDate || !endDate || endDate < startDate) {
            formik.setFieldValue('days', []);
            return;
        }
        formik.setFieldValue('days', buildDaysArray(startDate, endDate, excludeWeekends, excludeHolidays, holidays, HOURS_PER_DAY));
    };

    const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
        const value = date ?? null;
        formik.setFieldValue(field, value);
        const startDate = field === 'startDate' ? value : formik.values.startDate;
        const endDate = field === 'endDate' ? value : formik.values.endDate;
        rebuildDays(startDate, endDate, formik.values.excludeWeekends, formik.values.excludeHolidays);
    };

    const handleToggleChange = (field: 'excludeWeekends' | 'excludeHolidays', value: boolean) => {
        formik.setFieldValue(field, value);
        const excludeWeekends = field === 'excludeWeekends' ? value : formik.values.excludeWeekends;
        const excludeHolidays = field === 'excludeHolidays' ? value : formik.values.excludeHolidays;
        rebuildDays(formik.values.startDate, formik.values.endDate, excludeWeekends, excludeHolidays);
    };

    // When a time input changes, update the field and re-derive isAllDay
    const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
        const startTime = field === 'startTime' ? value : formik.values.startTime;
        const endTime = field === 'endTime' ? value : formik.values.endTime;
        formik.setFieldValue(field, value);
        formik.setFieldValue('isAllDay', isAllDayTime(startTime, endTime));
    };

    // When the All Day toggle is flipped, set times accordingly
    const handleAllDayToggle = (checked: boolean) => {
        formik.setFieldValue('isAllDay', checked);
        if (checked) {
            formik.setFieldValue('startTime', ALL_DAY_START);
            formik.setFieldValue('endTime', ALL_DAY_END);
        } else {
            // Clear to a sensible default so the user picks their own times
            formik.setFieldValue('startTime', '09:00');
            formik.setFieldValue('endTime', '17:00');
        }
    };

    const handleDayHoursChange = (index: number, hours: number) => {
        const updated = [...formik.values.days];
        updated[index] = { ...updated[index], hours };
        formik.setFieldValue('days', updated);
    };

    const totalSelectedHours = formik.values.days.reduce((acc, d) => acc + d.hours, 0);
    const isOverBalance = (MAX_HOURS - USED_HOURS - totalSelectedHours) < 0;

    return (
        <Dialog open={isFormOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl overflow-hidden flex flex-col">
                <DialogTitle>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Request Time Off</h2>
                    </div>
                </DialogTitle>

                <form onSubmit={formik.handleSubmit}>
                    <div className="space-y-5">

                        {/* Step 1 — Project Selection */}
                        <div className="space-y-1">
                            <Label>Project</Label>
                            <SelectControlled<Project>
                                mode="single"
                                value={formik.values.selectedProject}
                                onChange={handleProjectChange}
                                onSearch={setProjectSearch}
                                items={allProjects}
                                isLoading={projectsLoading}
                                error={projectsError ? 'Failed to load projects' : null}
                                getId={(p) => p.id}
                                getLabel={(p) => p.name}
                                placeholder="Select a project…"
                                searchMinChars={1}
                            />
                            {formik.touched.projectId && formik.errors.projectId && (
                                <p className="text-xs text-red-500">{formik.errors.projectId}</p>
                            )}
                        </div>

                        {/* Step 2 — Rest of form, gated on project selection */}
                        {projectSelected && (
                            <>
                                <div className='space-y-5 lg:grid lg:grid-cols-2 lg:gap-3'>
                                    {/* Policy */}
                                    <div className="space-y-1">
                                        <Label htmlFor="policyId">Policy Type</Label>
                                        {policiesLoading ? (
                                            <p className="text-sm text-muted-foreground py-2">Loading policies…</p>
                                        ) : filteredPolicies.length === 0 ? (
                                            <p className="text-sm text-muted-foreground py-2">
                                                No policies are assigned to this project.
                                            </p>
                                        ) : (
                                            <select
                                                id="policyId"
                                                {...formik.getFieldProps('policyId')}
                                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            >
                                                <option value="" disabled>Select a policy</option>
                                                {filteredPolicies.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        )}
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

                                    {/* Date Pickers */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label>Start Date</Label>
                                            <DatePickerCalendar
                                                selected={formik.values.startDate || undefined}
                                                onSelect={(date) => handleDateChange('startDate', date)}
                                                placeholder="Pick a date"
                                                error={!!(formik.touched.startDate && formik.errors.startDate)}
                                                classname="w-full"
                                            />
                                            {formik.touched.startDate && formik.errors.startDate && (
                                                <p className="text-xs text-red-500">{formik.errors.startDate as string}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <Label>End Date</Label>
                                            <DatePickerCalendar
                                                selected={formik.values.endDate || undefined}
                                                onSelect={(date) => handleDateChange('endDate', date)}
                                                placeholder="Pick a date"
                                                error={!!(formik.touched.endDate && formik.errors.endDate)}
                                                classname="w-full"
                                            />
                                            {formik.touched.endDate && formik.errors.endDate && (
                                                <p className="text-xs text-red-500">{formik.errors.endDate as string}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="overflow-y-auto lg:row-start-1 lg:row-span-2 lg:col-start-2">
                                        <BalanceSummary
                                            totalHours={MAX_HOURS}
                                            usedHours={USED_HOURS}
                                            selectedHours={totalSelectedHours}
                                        />
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="isAllDay"
                                            checked={formik.values.isAllDay}
                                            onCheckedChange={handleAllDayToggle}
                                        />
                                        <Label htmlFor="isAllDay" className="text-sm font-normal cursor-pointer">All Day</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="excludeWeekends"
                                            checked={formik.values.excludeWeekends}
                                            onCheckedChange={(val) => handleToggleChange('excludeWeekends', val)}
                                        />
                                        <Label htmlFor="excludeWeekends" className="text-sm font-normal cursor-pointer">Exclude Weekends</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="excludeHolidays"
                                            checked={formik.values.excludeHolidays}
                                            onCheckedChange={(val) => handleToggleChange('excludeHolidays', val)}
                                        />
                                        <Label htmlFor="excludeHolidays" className="text-sm font-normal cursor-pointer">Exclude Holidays</Label>
                                    </div>
                                </div>

                                {/* Start/End Time — always visible, drives isAllDay */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="startTime">Start Time</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={formik.values.startTime}
                                            onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                            className="w-full cursor-pointer [&::-webkit-datetime-edit-ampm-field]:bg-primary/10 [&::-webkit-datetime-edit-ampm-field]:text-primary [&::-webkit-datetime-edit-ampm-field]:rounded [&::-webkit-datetime-edit-ampm-field]:px-1"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="endTime">End Time</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={formik.values.endTime}
                                            onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                            className="w-full cursor-pointer [&::-webkit-datetime-edit-ampm-field]:bg-primary/10 [&::-webkit-datetime-edit-ampm-field]:text-primary [&::-webkit-datetime-edit-ampm-field]:rounded [&::-webkit-datetime-edit-ampm-field]:px-1"
                                        />
                                    </div>
                                </div>

                                {/* Daily Breakdown */}
                                {formik.values.days.length > 0 && (
                                    <DailyBreakdown
                                        days={formik.values.days}
                                        excludeWeekends={formik.values.excludeWeekends}
                                        excludeHolidays={formik.values.excludeHolidays}
                                        totalSelectedHours={totalSelectedHours}
                                        onHoursChange={handleDayHoursChange}
                                    />
                                )}

                                {/* Reason */}
                                <div className="space-y-1">
                                    <Label htmlFor="reason">Reason (Optional)</Label>
                                    <Textarea
                                        id="reason"
                                        {...formik.getFieldProps('reason')}
                                        placeholder="Add any additional information..."
                                    />
                                </div>

                                {/* Attachments */}
                                <FileUpload files={files} onChange={setFiles} />
                            </>
                        )}
                    </div>

                    <div className="border-t pt-4 mt-4 flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="outline" onClick={() => { formik.resetForm(); setFiles([]); }}>
                            Clear
                        </Button>
                        <Button type="submit" disabled={!projectSelected || isSubmitting || isOverBalance || totalSelectedHours === 0}>
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}