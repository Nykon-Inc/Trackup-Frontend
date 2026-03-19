"use client"

import React, { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCreateTicket } from "@/services/tickets.services"
import { TicketPriority } from "@/interfaces/tickets.interfaces"
import { SelectControlled } from "@/components/ui/select-controlled"
import { toast } from "sonner"
import { Paperclip, X, Loader2 } from "lucide-react"

interface CreateTicketModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orgId: string
}

const priorities = [
    { id: TicketPriority.LOW, label: "Low" },
    { id: TicketPriority.MEDIUM, label: "Medium" },
    { id: TicketPriority.HIGH, label: "High" },
    { id: TicketPriority.URGENT, label: "Urgent" }
]

export function CreateTicketModal({ open, onOpenChange, orgId }: CreateTicketModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM)
    const [attachments, setAttachments] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const createTicket = useCreateTicket()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !description.trim()) {
            toast.error("Title and description are required")
            return
        }

        createTicket.mutate({
            organizationId: orgId,
            title,
            description,
            priority,
            attachments: attachments.length > 0 ? attachments : undefined
        }, {
            onSuccess: () => {
                toast.success("Ticket created successfully")
                resetForm()
                onOpenChange(false)
            },
            onError: () => {
                toast.error("Failed to create ticket")
            }
        })
    }

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setPriority(TicketPriority.MEDIUM)
        setAttachments([])
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-border rounded-2xl p-0 overflow-hidden bg-white shadow-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold text-neutral-900 tracking-tight">Create New Ticket</DialogTitle>
                    <DialogDescription className="text-neutral-500 font-sans text-sm mt-1">
                        Explain your issue or feedback in detail. Our team will get back to you soon.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6 lg:p-6 lg:pt-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Subject / Title</Label>
                            <Input
                                id="title"
                                placeholder="What's the issue?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-10 border-border focus-visible:ring-primary rounded-lg text-sm bg-white"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Provide more details about the issue..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[120px] border-border focus-visible:ring-primary rounded-xl text-sm bg-white resize-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Priority</Label>
                                <SelectControlled
                                    mode="single"
                                    items={priorities}
                                    value={priorities.find(p => p.id === priority)}
                                    getId={(p) => p.id}
                                    getLabel={(p) => p.label}
                                    onChange={(p) => p && setPriority(p.id)}
                                    onSearch={() => {}}
                                    searchable={false}
                                    buttonClassName="h-10 border-border rounded-lg text-sm bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Attachments</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-10 border-dashed border-border hover:border-primary hover:bg-neutral-50 rounded-lg text-sm justify-start font-normal text-muted-foreground"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="mr-2 h-4 w-4" />
                                    {attachments.length > 0 ? `${attachments.length} file(s) selected` : "Attach files (optional)"}
                                </Button>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-neutral-100 px-2 py-1 rounded-md text-[10px] font-medium text-neutral-600 border border-neutral-200">
                                        <span className="truncate max-w-[120px]">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="text-neutral-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t border-muted/30">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-neutral-500 hover:bg-neutral-100 font-bold uppercase tracking-widest text-[10px] h-10 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createTicket.isPending}
                            className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] h-10 px-8 rounded-lg shadow-md lg:h-10"
                        >
                            {createTicket.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Creating...
                                </>
                            ) : "Create Ticket"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
