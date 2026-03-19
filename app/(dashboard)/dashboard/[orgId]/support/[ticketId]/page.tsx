"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from "@/components/page-header"
import {
    useGetTicket,
    useGetTicketMessages,
    useResolveTicket,
    useReopenTicket,
    useAddTicketMessage
} from "@/services/tickets.services"
import { TicketStatus, TicketPriority, TicketSenderType } from "@/interfaces/tickets.interfaces"
import { useAuthStore } from "@/stores/auth.store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import {
    Send,
    Paperclip,
    CheckCircle2,
    RefreshCw,
    ChevronLeft,
    User,
    Clock,
    X,
    MessageSquare,
    Download
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function TicketDetailPage() {
    const params = useParams()
    const router = useRouter()
    const orgId = params.orgId as string
    const ticketId = params.ticketId as string
    const { account } = useAuthStore()
    const myType = account?.accountType || TicketSenderType.CLIENT

    const [newMessage, setNewMessage] = useState("")
    const [attachments, setAttachments] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const scrollBottomRef = useRef<HTMLDivElement>(null)

    const { data: ticket, isLoading: isLoadingTicket } = useGetTicket(ticketId, orgId)
    const messages = ticket?.messages || []

    const resolveTicket = useResolveTicket()
    const reopenTicket = useReopenTicket()
    const addMessage = useAddTicketMessage()

    const isResolved = ticket?.status === TicketStatus.RESOLVED || ticket?.status === TicketStatus.CLOSED

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
            organizationId: orgId,
            message: newMessage,
            attachments: attachments.length > 0 ? attachments : undefined
        }, {
            onSuccess: () => {
                setNewMessage("")
                setAttachments([])
                toast.success("Message sent")
            },
            onError: () => {
                toast.error("Failed to send message")
            }
        })
    }

    const handleResolve = () => {
        resolveTicket.mutate({ id: ticketId, organizationId: orgId }, {
            onSuccess: () => toast.success("Ticket resolved"),
            onError: () => toast.error("Failed to resolve ticket")
        })
    }

    const handleReopen = () => {
        reopenTicket.mutate({ id: ticketId, organizationId: orgId }, {
            onSuccess: () => toast.success("Ticket reopened"),
            onError: () => toast.error("Failed to reopen ticket")
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
                    { label: "Dashboard", href: `/dashboard/${orgId}`, active: false },
                    { label: "Support", href: `/dashboard/${orgId}/support`, active: false },
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
                                Resolve Ticket
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
                        <p className="text-sm font-medium text-neutral-500">Loading ticket details...</p>
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
                <div className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-hidden">
                    {/* Sidebar Info */}
                    <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
                        <Card className="p-5 border-border shadow-sm bg-white rounded-2xl">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Ticket Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-500">Current Status</span>
                                    <Badge variant="outline" className="capitalize rounded-full px-2 py-0.5 text-[10px] font-bold border-emerald-100 bg-emerald-50 text-emerald-700">
                                        {ticket.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-500">Priority</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                        <span className="text-[10px] font-bold uppercase text-orange-600">
                                            {ticket.priority || 'Medium'}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-muted/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                                            <User className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-neutral-900 line-clamp-1">{ticket.author?.name || ticket.createdBy}</span>
                                            <span className="text-[10px] text-neutral-400">Creator</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                        <span className="text-[10px] text-neutral-400">Created {format(new Date(ticket.createdAt), "MMM d, yyyy HH:mm")}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-5 border-border shadow-sm bg-neutral-900 text-white rounded-2xl overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 opacity-10">
                                <MessageSquare className="h-24 w-24" />
                            </div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Issue Details</h3>
                            <h4 className="text-lg font-bold leading-tight mb-3">{ticket.title}</h4>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                                {ticket.description}
                            </p>
                        </Card>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0 h-full bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-muted/30 bg-neutral-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-white border border-border">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-neutral-900">Conversation Thread</span>
                            </div>
                            <span className="text-[10px] font-medium text-neutral-400">{messages.length} Messages</span>
                        </div>

                        <ScrollArea className="flex-1 p-4 lg:p-6">
                            <div className="flex flex-col gap-6">
                                {messages.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                                        <MessageSquare className="h-12 w-12 text-neutral-300 mb-4" />
                                        <p className="text-sm font-medium text-neutral-500">Wait for our staff to respond...<br />Or add more details below.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMe = msg.senderType === myType
                                        return (
                                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isMe
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
                                                        {format(new Date(msg.createdAt), "HH:mm")}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={scrollBottomRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-muted/30">
                            <form onSubmit={handleSendMessage} className="relative group">
                                <div className="flex flex-col gap-2 bg-neutral-50 rounded-2xl border border-border focus-within:border-primary/50 transition-all p-2">
                                    <Input
                                        placeholder={isResolved ? "This ticket is resolved and closed" : "Type your message here..."}
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
                                            {addMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
        </svg>
    )
}
