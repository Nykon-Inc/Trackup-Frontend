"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerCalendar } from "@/components/ui/date-picker-calendar"
import { toast } from "sonner"
import { ProjectMemberRole } from "@/interfaces/projects.interfaces"

function toDate(value?: string) {
    if (!value) return undefined
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? undefined : d
}

export function EditStaffInfoModal({
    open,
    onOpenChange,
    staffName,
    jobTitle,
    payRate,
    startDate,
    birthday,
    notes,
    onSave,
    isSaving,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    staffName: string
    jobTitle: string
    payRate?: number
    startDate?: string
    birthday?: string
    notes?: string
    onSave?: (payload: {
        fullName: string
        jobTitle: string
        payRate?: number
        startDate?: string | null
        birthday?: string | null
        notes?: string
    }) => Promise<void> | void
    isSaving?: boolean
}) {
    const [name, setName] = useState(staffName)
    const [title, setTitle] = useState(jobTitle)
    const [rate, setRate] = useState(payRate !== undefined ? String(payRate) : "")
    const [start, setStart] = useState<Date | undefined>(toDate(startDate))
    const [bday, setBday] = useState<Date | undefined>(toDate(birthday))
    const [note, setNote] = useState(notes || "")

    useEffect(() => {
        if (open) {
            setName(staffName)
            setTitle(jobTitle)
            setRate(payRate !== undefined ? String(payRate) : "")
            setStart(toDate(startDate))
            setBday(toDate(birthday))
            setNote(notes || "")
        }
    }, [open, staffName, jobTitle, payRate, startDate, birthday, notes])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Edit Staff Info</DialogTitle>
                    <DialogDescription>Update profile details for this staff member.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="staff-name">Full Name</Label>
                            <Input
                                id="staff-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Amanda Liu"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="staff-title">Job Title</Label>
                            <select
                                id="staff-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value={ProjectMemberRole.MEMBER}>Member</option>
                                <option value={ProjectMemberRole.MANAGER}>Manager</option>
                                <option value={ProjectMemberRole.VIEWER}>Viewer</option>
                                <option value={ProjectMemberRole.OWNER}>Owner</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <DatePickerCalendar
                                selected={start}
                                onSelect={setStart}
                                placeholder="Pick start date"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Birthday</Label>
                            <DatePickerCalendar
                                selected={bday}
                                onSelect={setBday}
                                placeholder="Pick birthday"
                                toYear={new Date().getFullYear()}
                            />
                        </div>

                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="staff-payrate">Pay Rate ($/hr)</Label>
                        <Input
                            id="staff-payrate"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            placeholder="52"
                        />
                    </div>                    

                    <div className="grid gap-2">
                        <Label htmlFor="staff-notes">Notes</Label>
                        <Textarea
                            id="staff-notes"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add notes about this staff member..."
                            className="min-h-[96px] resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={isSaving}
                        onClick={async () => {
                            const payload = {
                                fullName: name,
                                jobTitle: title,
                                payRate: rate ? Number(rate) : undefined,
                                startDate: start ? start.toISOString() : null,
                                birthday: bday ? bday.toISOString() : null,
                                notes: note,
                            }
                            if (onSave) {
                                await onSave(payload)
                            } else {
                                toast.success("Changes saved")
                            }
                            onOpenChange(false)
                        }}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
