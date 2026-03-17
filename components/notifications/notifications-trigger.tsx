"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import ShareDB from "sharedb/lib/client";
import { Doc, Socket } from "sharedb/lib/sharedb";
import ReconnectingWebSocket from "reconnecting-websocket";
import { Bell, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import http from "@/services/base";

// --- CONFIGURATION ---
const COLLECTION_NAME = "notifications";

interface NotificationItem {
    id: string;
    title: string;
    message?: string;
    type?: "info" | "success" | "warning" | "error";
    read?: boolean;
    link?: string;
    createdAt: string;
    [key: string]: any;
}

interface NotificationsDocData {
    messages: NotificationItem[];
}

interface ConnectionRef {
    socket: ReconnectingWebSocket | null;
    connection: ShareDB.Connection | null;
    doc: Doc<NotificationsDocData> | null;
    initialized: boolean;
}

export function NotificationsTrigger() {
    const { account } = useAuthStore();
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // Use useRef to store the connection instances across renders
    const connectionRef = useRef<ConnectionRef>({
        socket: null,
        connection: null,
        doc: null,
        initialized: false,
    });

    // --- URL RESOLUTION ---
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const WS_URL = useMemo(() => {
        if (!baseUrl) return "";
        let url = baseUrl.replace("http://", "ws://").replace("https://", "wss://");
        
        // Remove /v1 from the URL if present
        url = url.replace("/v1/", "/").replace("/v1", "");

        if (!baseUrl.includes("localhost")) {
            // Ensure we don't end up with //socket if we already have a trailing slash
            url = url.endsWith("/") ? url + 'socket' : url + '/socket';
        }
        return url;
    }, [baseUrl]);


    const prevCountRef = useRef(0);
    const [initialLoaded, setInitialLoaded] = useState(false);

    const playNotification = () => {
        const context = new (window.AudioContext)();

        // Create two oscillators for a "chord" effect
        const playTone = (freq: number, delay: number) => {
            const osc = context.createOscillator();
            const gain = context.createGain();

            osc.type = 'sine'; // Sine waves are soft and round
            osc.frequency.setValueAtTime(freq, context.currentTime + delay);

            gain.gain.setValueAtTime(0, context.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.1, context.currentTime + delay + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + delay + 0.4);

            osc.connect(gain);
            gain.connect(context.destination);

            osc.start(context.currentTime + delay);
            osc.stop(context.currentTime + delay + 0.5);
        };

        // Play a quick "bi-phet" (two notes close together)
        playTone(880, 0);      // High A
        playTone(1046.5, 0.08); // High C (played slightly after)
    };

    // --- LIFECYCLE EFFECT (Connect, Subscribe, Listen, Cleanup) ---
    useEffect(() => {
        const ref = connectionRef.current;

        // Safety check: Don't connect if already initialized or no user or no URL
        if (ref.initialized || !account?.id || !WS_URL) return;

        const DOCUMENT_KEY = account.id;

        const handleOp = () => {
            const document = ref.doc;
            if (document && document.data) {
                // Assume data structure has an 'items' array, or fallback to empty
                // Copy the array to ensure state updates trigger re-renders and we don't mutate doc directly
                const items = [...(document.data.messages || [])];
                // Sort by createdAt desc
                items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setNotifications(items);
            }
        };

        // Custom WebSocket factory to add Authorization header or query param
        // ShareDB/ReconnectingWebSocket doesn't support custom headers easily in browser
        // So we pass token as query param
        const setup = async () => {
            try {
                // Get token from auth store
                const { access } = useAuthStore.getState();
                const token = access?.token;

                // detailed connection logging
                console.log(`Connecting to WS: ${WS_URL}`);

                // Construct WS URL with token
                const wsUrlWithToken = token ? `${WS_URL}?token=${token}` : WS_URL;

                ref.socket = new ReconnectingWebSocket(wsUrlWithToken, [], { maxEnqueuedMessages: 0 });

                await new Promise((resolve, reject) => {
                    if (!ref.socket) return reject("No socket");
                    ref.socket.onopen = () => {
                        console.log("WS Connected");
                        resolve(true);
                    };
                    ref.socket.onerror = (e) => {
                        console.error("WS Error", e);
                        reject(e);
                    }
                });

                setIsConnected(true);

                ref.connection = new ShareDB.Connection(ref.socket as Socket);
                ref.doc = ref.connection.get(COLLECTION_NAME, DOCUMENT_KEY);

                ref.doc.subscribe(async (err) => {
                    if (err) {
                        console.error("Notifications ShareDB subscription error:", err);
                        return;
                    }

                    let initialCount = 0;

                    if (!ref.doc!.type) {
                        // If doc doesn't exist, fetch from API
                        try {
                            const response = await http.get({ url: '/notifications' });
                            if (response && Array.isArray(response)) {
                                ref.doc!.create({ messages: response });
                                initialCount = response.length;
                            } else {
                                ref.doc!.create({ messages: [] });
                            }
                        } catch (error) {
                            console.error("Failed to fetch initial notifications:", error);
                            ref.doc!.create({ messages: [] });
                        }
                    } else {
                        handleOp();
                        if (ref.doc!.data && ref.doc!.data.messages) {
                            initialCount = ref.doc!.data.messages.length;
                        }
                    }

                    prevCountRef.current = initialCount;
                    setInitialLoaded(true);
                });

                ref.doc.on("op", handleOp);
                ref.initialized = true;

            } catch (error) {
                console.error("Notifications connection failed:", error);
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
            setIsConnected(false);
        };

    }, [account?.id, WS_URL]);

    // Sound effect trigger
    useEffect(() => {

        if (!initialLoaded) return;

        if (notifications.length > prevCountRef.current) {
            try {
                playNotification()
            } catch (e) {
                console.error("Audio init failed:", e);
            }
        }

        prevCountRef.current = notifications.length;
    }, [notifications, initialLoaded]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (id: string) => {
        const doc = connectionRef.current.doc;
        if (!doc || !doc.data || !doc.data.messages) return;

        const messages = doc.data.messages;
        const index = messages.findIndex((n) => n.id === id);

        if (index === -1) return;

        const oldItem = messages[index];
        if (oldItem.read) return; // Already read

        const newItem = { ...oldItem, read: true };

        const op = [{ p: ['messages', index], ld: oldItem, li: newItem }];

        doc.submitOp(op);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                        <Bell className="h-4 w-4" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                    {isConnected && unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 bg-background border-border">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {unreadCount} unread
                        </span>
                    )}
                </div>

                <div className="max-h-[40vh] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className={`
                    relative flex gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors group cursor-pointer
                    ${!notification.read ? 'bg-muted/10' : ''}
                  `}
                                >
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notification.read ? 'bg-primary' : 'bg-transparent'}`} />

                                    <div className="flex flex-col flex-1 gap-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className={`text-sm ${!notification.read ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground'}`}>
                                                {notification.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                                                {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        {notification.message && (
                                            <p className="text-xs text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: notification.message }} />
                                        )}

                                        {notification.link && (
                                            <div className="mt-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-6 text-xs px-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                        if (notification.link?.includes('http')) {
                                                            window.open(notification.link, '_blank');
                                                        } else {
                                                            router.push(notification.link!);
                                                        }
                                                    }}
                                                >
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
