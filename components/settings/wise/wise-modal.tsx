"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Key, ShieldCheck, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { PaymentIntegrationProvider } from "@/interfaces/organizations.interfaces"
import { useUpdatePaymentIntegration, useRevealPaymentIntegrationKey } from "@/services/organization.services"
import { toast } from "sonner"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { useEffect } from "react"
import { AxiosError } from "axios"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    orgId: string
}

export function WiseIntegrationDialog({ open, onOpenChange, orgId }: Props) {
    const { activeOrg } = useWorkspace()
    const [isEnabled, setIsEnabled] = useState(false)
    const [token, setToken] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [showKey, setShowKey] = useState(false)
    const { mutate: updateIntegration, isPending: isSaving } = useUpdatePaymentIntegration()
    const { mutate: revealKey, isPending: isRevealing } = useRevealPaymentIntegrationKey()

    // Get initial config
    const config = activeOrg?.organization?.paymentIntegrations?.find(
        p => p.provider === PaymentIntegrationProvider.WISE
    )
    const initialIsEnabled = config?.isEnabled || false
    const initialToken = config?.accessToken || ""

    const hasChanged = isEnabled !== initialIsEnabled || token !== initialToken

    // Sync state with activeOrg
    useEffect(() => {
        if (open) {
            setIsEnabled(initialIsEnabled)
            setToken(initialToken)
        }
    }, [open, initialIsEnabled, initialToken])

    const handleReveal = () => {
        revealKey({ organizationId: orgId, provider: PaymentIntegrationProvider.WISE }, {
            onSuccess: (data) => {
                setToken(data.apiKey)
                setShowKey(true)
                toast.success("API Key revealed")
            },
            onError: (error: any) => {
                toast.error(error?.message || "Failed to reveal API Key")
            }
        })
    }

    const handleSave = () => {
        if (!token && isEnabled) return

        updateIntegration({
            organizationId: orgId,
            provider: PaymentIntegrationProvider.WISE,
            isEnabled: isEnabled,
            apiKey: token,
        }, {
            onSuccess: () => {
                setIsSuccess(true)
                toast.success("Wise integration updated successfully")
                setTimeout(() => {
                    onOpenChange(false)
                    setIsSuccess(false)
                }, 2000)
            },
            onError: (error) => {
                toast.error(((error as AxiosError).response?.data as any).message || "Failed to update Deel integration")
            }
        })
    }

    const handleToggle = (checked: boolean) => {
        setIsEnabled(checked)

        // If toggling off, call mutation immediately
        if (!checked) {
            updateIntegration({
                organizationId: orgId,
                provider: PaymentIntegrationProvider.WISE,
                isEnabled: false,
            }, {
                onSuccess: () => {
                    setToken("")
                    setShowKey(false)
                    toast.success("Wise integration disabled")
                },
                onError: (error: any) => {
                    setIsEnabled(true) // Revert on failure
                    toast.error(error?.message || "Failed to disable Wise integration")
                }
            })
        }
    }

    const handleOpenChange = (val: boolean) => {
        if (!val) {
            setIsSuccess(false)
        }
        onOpenChange(val)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-none border-neutral-200">
                <DialogHeader className="px-7 pt-7 pb-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] uppercase tracking-widest text-neutral-400 font-sans mb-0.5">
                                Integration
                            </p>
                            <DialogTitle className="text-xl font-bold text-black tracking-tight">
                                Wise
                            </DialogTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                {isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <Switch
                                checked={isEnabled}
                                onCheckedChange={handleToggle}
                                className="data-[state=checked]:bg-black"
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="h-px bg-neutral-100 mt-6" />

                <div className="px-7 py-8">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-4 space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-black">Connection Successful</h3>
                                <p className="text-sm text-neutral-500 font-sans mt-1">Your Wise API token has been securely stored.</p>
                            </div>
                        </div>
                    ) : !isEnabled ? (
                        <div className="space-y-6">
                            <p className="text-sm text-neutral-500 leading-relaxed font-sans">
                                Connect your Wise account to automate payroll and secure international payments. By enabling this, you'll be using your own (BYO) Wise Business account.
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-start gap-4 p-4 bg-neutral-50 border border-neutral-100">
                                    <ShieldCheck className="w-5 h-5 text-neutral-400 mt-0.5" />
                                    <div>
                                        <p className="text-[13px] font-bold text-black mb-1">BYO Account Model</p>
                                        <p className="text-[12px] text-neutral-500 leading-relaxed">Your funds remain in your Wise account. We only trigger payments through your authorized API token.</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleToggle(true)}
                                className="w-full rounded-none h-12 text-xs uppercase tracking-widest font-sans bg-black text-white hover:bg-neutral-800 transition-all"
                            >
                                Enable Wise Integration
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Setup Instructions</h4>
                                    <a
                                        href="https://wise.com/help/articles/2c9XYYpx8v7y2XWq0D5E7X/how-do-i-use-the-wise-api"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-neutral-400 hover:text-black flex items-center gap-1 transition-colors"
                                    >
                                        Detailed Guide <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { step: 1, text: "Log in to your Wise Business account", link: "https://wise.com/login" },
                                        { step: 2, text: "Navigate to Settings > API tokens" },
                                        { step: 3, text: "Generate a new 'Read & Write' API token" },
                                        { step: 4, text: "Copy and paste the token below" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex-none w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white">
                                                {item.step}
                                            </div>
                                            <p className="text-[13px] text-neutral-600 font-sans">
                                                {item.text}
                                                {item.link && (
                                                    <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center ml-1 text-black font-semibold hover:underline">
                                                        <ExternalLink className="w-3 h-3 ml-0.5" />
                                                    </a>
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-neutral-100">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Wise API Token</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            type={showKey ? "text" : "password"}
                                            placeholder="Paste your API token here..."
                                            className="pl-10 pr-12 rounded-none border-neutral-200 focus-visible:ring-black h-12 text-sm font-sans"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={showKey ? () => setShowKey(false) : handleReveal}
                                            disabled={isRevealing}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-neutral-400 hover:text-black hover:bg-transparent"
                                        >
                                            {isRevealing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 italic">
                                        Note: We recommend using a Restricted Token if possible.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !token || !hasChanged}
                                    className={cn(
                                        "w-full rounded-none h-12 text-xs uppercase tracking-widest font-sans transition-all",
                                        "bg-black text-white hover:bg-neutral-800",
                                        "disabled:bg-neutral-100 disabled:text-neutral-400"
                                    )}
                                >
                                    {isSaving ? "Encrypting & Saving..." : "Save Connection"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
