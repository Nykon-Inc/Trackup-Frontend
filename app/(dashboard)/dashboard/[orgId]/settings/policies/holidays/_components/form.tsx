import { Button } from "@/components/ui/button"
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar"
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IHolidayItem } from "@/interfaces/holiday.interfaces"
import { formatDate } from "date-fns"
import { useFormik } from "formik"
import * as Yup from "yup"



type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingHoliday: IHolidayItem | null
    handleCloseModal: () => void
    onSave: (payload: { holidayId?: string, name?: string, date?: string }, resetForm: () => void) => void
    isSubmitting: boolean
}
const validationSchema = Yup.object({
    name: Yup.string().trim().required('Holiday name is required'),
    date: Yup.date().required('Date is required').nullable(),
})


export const HolidayForm = ({ open, onOpenChange, editingHoliday, onSave, handleCloseModal, isSubmitting }: Props) => {

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: editingHoliday?.name ?? '',
            date: editingHoliday?.date ? new Date(editingHoliday.date) : null as Date | null,
        },
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            const dateStr = values.date ? formatDate(values.date, 'yyyy-MM-dd') : ''
            onSave({ name: values.name, date: dateStr }, resetForm)
        },
    })
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-115">
                <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Holiday Name</Label>
                        <Input
                            id="name"
                            {...formik.getFieldProps('name')}
                            placeholder="e.g. Independence Day"
                        />
                        {formik.touched.name && formik.errors.name && (
                            <p className="text-xs text-red-500">{formik.errors.name}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label>Date</Label>
                        <DatePickerCalendar
                            selected={formik.values.date || undefined}
                            onSelect={(date) => formik.setFieldValue('date', date ?? null)}
                            placeholder="Pick a date"
                            error={!!(formik.touched.date && formik.errors.date)}
                            classname="w-full"
                        />
                        {formik.touched.date && formik.errors.date && (
                            <p className="text-xs text-red-500">{formik.errors.date as string}</p>
                        )}
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">
                            {
                                editingHoliday
                                    ? isSubmitting
                                        ? 'Saving...'
                                        : 'Save Changes'
                                    : isSubmitting
                                        ? 'Adding...'
                                        : 'Add Holiday'
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}