"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ExternalLink, ShieldCheck, CheckCircle2, LayoutGrid, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { useDisConnectHubstaff, useGetHubstaffAuthUrl, useGetMyOrganizations } from "@/services/organization.services"
import { toast } from "sonner"
import { AxiosError } from "axios"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    orgId: string
}

export function HubstaffIntegrationDialog({ open, onOpenChange, orgId }: Props) {
    const { data: myOrganizations } = useGetMyOrganizations()
    const { mutate: getHubstaffAuthUrl, isPending: isConnecting } = useGetHubstaffAuthUrl()
    const { mutate: disConnectHubstaff, isPending: isDisconnecting } = useDisConnectHubstaff(orgId)

    const isConnected = (myOrganizations || []).find((org) => org.organizationId === orgId)?.organization?.isHubstaffConnected || false

    const handleConnect = () => {
        getHubstaffAuthUrl(orgId, {
            onSuccess({ url }) {
                window.open(url, "_blank")
                onOpenChange(false)
            },
            onError: (error) => {
                toast.error(((error as AxiosError)?.response?.data as any).message || "Failed to initiate Hubstaff connection")
            }
        })
    }

    const handleToggle = (checked: boolean) => {
        if (checked) {
            handleConnect()
        } else {
            disConnectHubstaff(undefined, {
                onSuccess: () => {
                    toast.success("Hubstaff integration disconnected")
                },
                onError: (error) => {
                    toast.error(((error as AxiosError).response?.data as any).message || "Failed to disconnect Hubstaff")
                }
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-none border-neutral-200">
                <DialogHeader className="px-7 pt-7 pb-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] uppercase tracking-widest text-neutral-400 font-sans mb-0.5">
                                Integration
                            </p>
                            <DialogTitle className="text-xl font-bold text-black tracking-tight">
                                Hubstaff
                            </DialogTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                            <Switch 
                                checked={isConnected} 
                                onCheckedChange={handleToggle}
                                disabled={isConnecting || isDisconnecting}
                                className="data-[state=checked]:bg-black"
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="h-px bg-neutral-100 mt-6" />

                <div className="px-7 py-8">
                    {!isConnected ? (
                        <div className="space-y-6">
                            <p className="text-sm text-neutral-500 leading-relaxed font-sans">
                                Connect your Hubstaff account to sync time tracking, projects, and team productivity data directly into your workspace.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "Sync employee time logs automatically",
                                    "Import project & task data in real-time",
                                    "Monitor productivity across your team"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-black" />
                                        <span className="text-[13px] text-neutral-600 font-sans">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-start gap-4 p-4 bg-neutral-50 border border-neutral-100">
                                    <ShieldCheck className="w-5 h-5 text-neutral-400 mt-0.5" />
                                    <div>
                                        <p className="text-[13px] font-bold text-black mb-1">Secure OAuth 2.0</p>
                                        <p className="text-[12px] text-neutral-500 leading-relaxed">
                                            We only request read permissions for time and project data. You'll be redirected to Hubstaff's secure portal to authorize access.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="w-full rounded-none h-12 text-xs uppercase tracking-widest font-sans bg-black text-white hover:bg-neutral-800 transition-all"
                            >
                                {isConnecting ? "Connecting..." : (
                                    <>
                                        Authorize with Hubstaff
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex flex-col items-center justify-center py-4 space-y-4">
                                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-black">Hubstaff Connected</h3>
                                    <p className="text-sm text-neutral-500 font-sans mt-1">Your account is linked and syncing is active.</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-neutral-100">
                                <p className="text-[11px] font-bold text-black uppercase tracking-widest">Connection Details</p>
                                <div className="p-4 bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white border border-neutral-200 rounded">
                                            <LayoutGrid className="w-4 h-4 text-black" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-black">Active Sync</p>
                                            <p className="text-[11px] text-neutral-500 font-sans">Cloud synchronization active</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-green-600 uppercase">Live</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="w-full rounded-none h-12 text-xs uppercase tracking-widest font-sans border-neutral-200 hover:bg-neutral-50"
                                >
                                    Close Settings
                                </Button>
                                
                                <p className="text-center">
                                    <button 
                                        onClick={() => handleToggle(false)}
                                        disabled={isDisconnecting}
                                        className="text-[10px] text-neutral-400 hover:text-red-500 font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                                    >
                                        {isDisconnecting ? "Disconnecting..." : "Disconnect Hubstaff"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
