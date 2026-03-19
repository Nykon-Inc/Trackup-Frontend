"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from "@/components/page-header"
import {
    useGetTicketInternal,
    useResolveTicketInternal,
    useReopenTicketInternal,
    useAddTicketMessageInternal,
    useUpdateTicketInternal
} from "@/services/tickets.services"
import { useFetchInternalUsers } from "@/services/users"
import { TicketStatus, TicketPriority, TicketSenderType } from "@/interfaces/tickets.interfaces"
import { Account, InternalUserRole } from "@/interfaces/auth.interfaces"
import { useAuthStore } from "@/stores/auth.store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { SelectControlled } from "@/components/ui/select-controlled"
import { format } from "date-fns"
import {
    Send,
    Paperclip,
    CheckCircle2,
    RefreshCw,
    User,
    Clock,
    X,
    MessageSquare,
    Download,
    UserPlus,
    Building2,
    ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function InternalTicketDetailPage() {
    const params = useParams()
    const router = useRouter()
    const ticketId = params.ticketId as string
    const { account } = useAuthStore()
    const myType = account?.accountType || TicketSenderType.INTERNAL

    const [newMessage, setNewMessage] = useState("")
    const [attachments, setAttachments] = useState<File[]>([])
    const [assigneeSearch, setAssigneeSearch] = useState("")
    const [ccSearch, setCcSearch] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const scrollBottomRef = useRef<HTMLDivElement>(null)

    const { data: ticket, isLoading: isLoadingTicket } = useGetTicketInternal(ticketId)
    const messages = ticket?.messages || []

    const resolveTicket = useResolveTicketInternal()
    const reopenTicket = useReopenTicketInternal()
    const addMessage = useAddTicketMessageInternal()
    const updateTicket = useUpdateTicketInternal()

    // Fetch internal users for assignment
    const { data: assigneeData } = useFetchInternalUsers({
        limit: 100,
        role: InternalUserRole.OPERATIONS,
        search: assigneeSearch
    })
    const assigneeStaff = (assigneeData as any)?.results || []

    // Fetch internal users for CC
    const { data: ccData } = useFetchInternalUsers({
        limit: 100,
        role: InternalUserRole.OPERATIONS,
        search: ccSearch
    })
    const ccStaff = (ccData as any)?.results || []

    const isResolved = ticket?.status === TicketStatus.RESOLVED || ticket?.status === TicketStatus.CLOSED
    console.log(account)
    const isAuthorizedToAssign = account?.role === InternalUserRole.LEAD_OPERATIONS || account?.role === InternalUserRole.EXECUTIVE

    useEffect(() => {
        if (scrollBottomRef.current) {
            scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() && attachments.length === 0) return

        addMessage.mutate({
            ticketId,
            message: newMessage,
            attachments: attachments.length > 0 ? attachments : undefined
        }, {
            onSuccess: () => {
                setNewMessage("")
                setAttachments([])
                toast.success("Response sent")
            },
            onError: () => {
                toast.error("Failed to send message")
            }
        })
    }

    const handleResolve = () => {
        resolveTicket.mutate(ticketId, {
            onSuccess: () => toast.success("Ticket resolved"),
            onError: () => toast.error("Failed to resolve ticket")
        })
    }

    const handleReopen = () => {
        reopenTicket.mutate(ticketId, {
            onSuccess: () => toast.success("Ticket reopened"),
            onError: () => toast.error("Failed to reopen ticket")
        })
    }

    const handleAssign = (userId: string) => {
        updateTicket.mutate({
            id: ticketId,
            assignedTo: userId
        }, {
            onSuccess: () => toast.success("Ticket assigned successfully"),
            onError: () => toast.error("Failed to assign ticket")
        })
    }

    const handleCCChange = (selectedUsers: Account[]) => {
        const ccIds = selectedUsers.map(u => u.id)
        updateTicket.mutate({
            id: ticketId,
            cc: ccIds
        }, {
            onSuccess: () => toast.success("CC list updated"),
            onError: () => toast.error("Failed to update CC list")
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA]">
            <PageHeader
                title={isLoadingTicket ? "Loading Ticket..." : ticket ? `Ticket #${ticket.id.slice(-6).toUpperCase()}` : "Ticket Not Found"}
                breadcrumbs={[
                    { label: "Internal", href: "/internal", active: false },
                    { label: "Support", href: "/internal/support", active: false },
                    { label: "Detail", href: "", active: true }
                ]}
                rightElement={
                    <div className="flex items-center gap-2">
                        {(!ticket || ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED) ? (
                            <Button
                                size="sm"
                                onClick={handleResolve}
                                disabled={isLoadingTicket || !ticket || resolveTicket.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] h-8 rounded-lg disabled:opacity-50"
                            >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                Mark as Resolved
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleReopen}
                                disabled={isLoadingTicket || !ticket || reopenTicket.isPending}
                                className="border-border text-neutral-600 font-bold uppercase tracking-widest text-[10px] h-8 rounded-lg bg-white disabled:opacity-50"
                            >
                                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                Reopen Ticket
                            </Button>
                        )}
                    </div>
                }
            />

            {isLoadingTicket ? (
                <div className="flex flex-1 items-center justify-center bg-[#FAFAFA] pt-20">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium text-neutral-500">Retrieving global ticket details...</p>
                    </div>
                </div>
            ) : !ticket ? (
                <div className="flex flex-1 items-center justify-center bg-[#FAFAFA] pt-10">
                    <div className="text-center">
                        <h2 className="text-xl font-bold">Ticket not found</h2>
                        <Button variant="link" onClick={() => router.back()}>Go back</Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col md:flex-row gap-5 p-4 md:p-5 lg:p-6 max-w-screen-2xl mx-auto w-full overflow-hidden">
                    {/* Sidebar Info */}
                    <div className="w-full md:w-72 flex flex-col gap-4 shrink-0">
                        {/* Assignment Card */}
                        <Card className="p-4 border-border shadow-sm bg-white rounded-xl gap-0">
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Management</h3>
                            <div className="space-y-2">
                                {isAuthorizedToAssign && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Assigned To</label>
                                        <SelectControlled
                                            mode="single"
                                            items={assigneeStaff}
                                            value={assigneeStaff.find((u: Account) => u.id === ticket.assignedTo)}
                                            getId={(u: Account) => u.id}
                                            getLabel={(u: Account) => u.name}
                                            onChange={(u) => u && handleAssign(u.id)}
                                            onSearch={setAssigneeSearch}
                                            isLoading={updateTicket.isPending}
                                            placeholder="Unassigned"
                                            buttonClassName="h-10 border-border rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">CC List</label>
                                    <SelectControlled
                                        mode="multiple"
                                        items={ccStaff.filter((u: Account) => u.id !== ticket.assignedTo)}
                                        value={ccStaff.filter((u: Account) => (ticket.cc || []).includes(u.id))}
                                        getId={(u: Account) => u.id}
                                        getLabel={(u: Account) => u.name}
                                        onChange={(selected) => handleCCChange(selected)}
                                        onSearch={setCcSearch}
                                        isLoading={updateTicket.isPending}
                                        placeholder="Add people to CC"
                                        buttonClassName="min-h-10 border-border rounded-lg text-sm bg-white h-auto py-2"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-xs text-neutral-500 font-medium">Status</span>
                                    <Badge variant="outline" className="capitalize rounded-full px-2 py-0.5 text-[9px] font-bold border-blue-100 bg-blue-50 text-blue-700">
                                        {ticket.status}
                                    </Badge>
                                </div>
                            </div>
                        </Card>

                        {/* Customer Info Card */}
                        <Card className="p-4 border-border gap-0 shadow-sm bg-white rounded-xl">
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Customer</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-neutral-400" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-neutral-900 truncate">{ticket.author?.name || ticket.createdBy}</span>
                                        <span className="text-[9px] text-neutral-400">Submitter</span>
                                    </div>
                                </div>
                                <div className="pt-1 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-3 w-3 text-neutral-400 shrink-0" />
                                        <span className="text-[11px] text-neutral-600 truncate">{(ticket as any).organization?.name || "Org ID: " + ticket.organizationId.slice(0, 8)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-neutral-400 shrink-0" />
                                        <span className="text-[11px] text-neutral-600">Opened {format(new Date(ticket.createdAt), "MMM d, HH:mm")}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Original Issue Card */}
                        <Card className="p-4 gap-0 border-border shadow-sm bg-neutral-900 text-white rounded-xl">
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Original Issue</h3>
                            <h4 className="text-sm font-bold leading-snug mb-2">{ticket.title}</h4>
                            <p className="text-[11px] text-neutral-400 leading-relaxed italic line-clamp-4">
                                "{ticket.description}"
                            </p>
                        </Card>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0 h-full bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-4 py-3 border-b border-muted/30 bg-neutral-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Internal Responses</span>
                            </div>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{messages.length} Messages</span>
                        </div>

                        <ScrollArea className="flex-1 p-4 lg:p-5">
                            <div className="flex flex-col gap-4">
                                {messages.map((msg, index) => {
                                    const isMe = msg.senderType === TicketSenderType.INTERNAL
                                    return (
                                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] sm:max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-3 py-2.5 rounded-xl text-xs leading-relaxed ${isMe
                                                    ? 'bg-primary text-white rounded-tr-none'
                                                    : 'bg-neutral-100 text-neutral-800 rounded-tl-none'
                                                    }`}>
                                                    <div className="flex items-center gap-1.5 mb-1 opacity-70">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">
                                                            {msg.senderType}
                                                        </span>
                                                    </div>
                                                    {msg.message}
                                                    {/* Attachments inside message */}
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="mt-3 flex flex-col gap-2">
                                                            {msg.attachments.map((att, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={att.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`flex items-center gap-2 p-2 rounded-lg text-[10px] border transition-colors ${isMe
                                                                        ? 'bg-white/10 border-white/20 hover:bg-white/20'
                                                                        : 'bg-white border-border hover:bg-neutral-50'
                                                                        }`}
                                                                >
                                                                    <Paperclip className="h-3 w-3 shrink-0" />
                                                                    <span className="truncate flex-1">{att.fileUrl.split('/').pop()}</span>
                                                                    <Download className="h-3 w-3" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-neutral-400 mt-2 font-medium">
                                                    {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={scrollBottomRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-muted/30">
                            <form onSubmit={handleSendMessage} className="relative group">
                                <div className="flex flex-col gap-2 bg-neutral-50 rounded-2xl border border-border focus-within:border-primary/50 transition-all p-2">
                                    <Input
                                        placeholder={isResolved ? "This ticket is resolved and closed" : "Type your internal response..."}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isResolved}
                                        className="border-none bg-transparent focus-visible:ring-0 shadow-none text-sm min-h-12 disabled:opacity-50"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 ml-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={isResolved}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-8 w-8 rounded-lg hover:bg-neutral-200/50 text-neutral-500 disabled:opacity-30"
                                            >
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isResolved || addMessage.isPending || (!newMessage.trim() && attachments.length === 0)}
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center shrink-0 disabled:opacity-50"
                                        >
                                            {addMessage.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {/* Attachment Previews */}
                                <AnimatePresence>
                                    {attachments.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="flex flex-wrap gap-2 mt-3"
                                        >
                                            {attachments.map((file, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full text-[10px] font-bold text-neutral-600">
                                                    <Paperclip className="h-3 w-3" />
                                                    <span className="max-w-[150px] truncate">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="hover:text-red-500 ml-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
