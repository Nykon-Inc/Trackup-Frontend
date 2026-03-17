"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import ShareDB from "sharedb/lib/client";
import { Doc, Socket } from "sharedb/lib/sharedb";
import ReconnectingWebSocket from "reconnecting-websocket";
import { Loader2, Check, X, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTriggerOrgNarrative } from "@/services/ai.services";
import { format } from "date-fns";
import { queryClient } from "@/lib/react-query";

// --- CONFIGURATION ---
const COLLECTION_NAME = "organization-naratives";

// Define the expected document structure and status types
type JobStatus = 'pending' | 'progress' | "processing" | 'done' | "completed" | 'success' | 'failure' | 'error' | 'ready' | null;

interface JobMessage {
    status?: JobStatus;
    [key: string]: any;
}

interface JobDocData {
    messages: JobMessage[];
}

// Interface for useRef to hold connection instances
interface ConnectionRef {
    socket: ReconnectingWebSocket | null;
    connection: ShareDB.Connection | null;
    doc: Doc<JobDocData> | null;
    initialized: boolean;
}

interface JobTrackerRefreshProps {
    orgId: string;
    date: Date | undefined;
}

export default function JobTrackerRefresh({ orgId: DOCUMENT_KEY, date }: JobTrackerRefreshProps) {
    const [currentJobStatus, setCurrentJobStatus] = useState<JobStatus>(null);

    // Use useRef to store the connection instances across renders
    const connectionRef = useRef<ConnectionRef>({
        socket: null,
        connection: null,
        doc: null,
        initialized: false,
    });

    const { mutate: triggerNarrative, isPending: isTriggering } = useTriggerOrgNarrative();

    // --- URL RESOLUTION ---
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    let wsUrl = baseUrl.replace("http://", "ws://").replace("https://", "wss://");
    
    // Remove /v1 from the URL if present
    wsUrl = wsUrl.replace("/v1/", "/").replace("/v1", "");

    if (!baseUrl.includes("localhost")) {
        // Ensure we don't end up with //socket if we already have a trailing slash
        wsUrl = wsUrl.endsWith("/") ? wsUrl + 'socket' : wsUrl + '/socket';
    }
    const WS_URL = wsUrl;

    // --- JOB STATUS DETERMINATION ---
    const isJobActive = currentJobStatus === 'pending' || currentJobStatus === 'progress' || currentJobStatus === 'processing';
    const isJobFinished = currentJobStatus === 'done' || currentJobStatus === 'success' || currentJobStatus === 'failure' || currentJobStatus === 'completed' || currentJobStatus === 'ready';
    const isSuccess = currentJobStatus === 'success' || currentJobStatus === 'done' || currentJobStatus === 'completed' || currentJobStatus === 'ready';

    /**
     * Resets state when the job document is deleted.
     */
    const clearLogsAndReset = useCallback(() => {
        setCurrentJobStatus(null);
    }, []);

    // --- LIFECYCLE EFFECT ---
    useEffect(() => {
        const ref = connectionRef.current;

        if (ref.initialized) return;
        if (!WS_URL) return;

        const handleOp = () => {
            const document = ref.doc;
            if (document) {
                const messages = document.data.messages;
                let newStatus: JobStatus = null;

                if (messages && messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage && lastMessage.status) {
                        newStatus = lastMessage.status;
                    }
                }

                if (newStatus !== currentJobStatus) {
                    setCurrentJobStatus(newStatus);

                    if (newStatus === "ready" || newStatus === "success") {
                        toast.success("Insights are ready!");
                        queryClient.invalidateQueries({ queryKey: ["org-insights"] });
                        queryClient.invalidateQueries({ queryKey: ["insights-to-review"] });
                    } else if (newStatus === "error" || newStatus === "failure") {
                        toast.error("Failed to generate insights.");
                    }
                }
            }
        };

        async function setup() {
            try {
                ref.socket = new ReconnectingWebSocket(WS_URL, [], { maxEnqueuedMessages: 0 });
                ref.connection = new ShareDB.Connection(ref.socket as Socket);
                ref.doc = ref.connection.get(COLLECTION_NAME, DOCUMENT_KEY);

                ref.doc.on("op", handleOp);
                ref.doc.on("del", () => {
                    clearLogsAndReset();
                });

                ref.doc.subscribe(async (err) => {
                    if (err) return;
                    if (ref.doc!.data) handleOp();
                });

                ref.initialized = true;
            } catch (error) {
                console.error("Socket setup failed:", error);
                if (ref.socket) ref.socket.close();
            }
        }

        setup();

        return () => {
            if (ref.doc) {
                ref.doc.off("op", handleOp);
                ref.doc.destroy();
            }
            if (ref.socket) {
                ref.socket.close();
            }
            ref.initialized = false;
        };

    }, [DOCUMENT_KEY, WS_URL, currentJobStatus, clearLogsAndReset]);

    const handleRefreshNarrative = () => {
        if (!DOCUMENT_KEY || !date) return;

        const batchId = `${DOCUMENT_KEY}_${format(date, 'yyyy-MM-dd-HH')}`;

        // Reset status to ensure we show loading from peak click
        setCurrentJobStatus('pending');

        triggerNarrative({
            batchId,
            organizationId: DOCUMENT_KEY
        }, {
            onSuccess: () => {
                toast.info("Insight generation started...");
            },
            onError: (err: any) => {
                setCurrentJobStatus(null);
                toast.error(err?.response?.data?.message || "Failed to trigger narrative refresh");
            }
        });
    };

    const fabContent = (isJobActive || isTriggering) ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    ) : isSuccess ? (
        <Check className="h-4 w-4 text-green-500" />
    ) : currentJobStatus === 'failure' || currentJobStatus === 'error' ? (
        <X className="h-4 w-4 text-red-500" />
    ) : (
        <RotateCw className="h-4 w-4 text-muted-foreground" />
    );

    return (
        <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefreshNarrative}
                            disabled={isTriggering || isJobActive}
                            className="h-[38px] w-[38px]"
                        >
                            {fabContent}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isJobActive ? `Processing: ${currentJobStatus}` : (isJobFinished ? "Insights Ready" : "Refresh Narrative")}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
