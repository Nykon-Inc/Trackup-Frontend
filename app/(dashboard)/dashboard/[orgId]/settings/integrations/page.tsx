"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutGrid, ArrowRight, LineChart, Wallet } from "lucide-react"
import { useState } from "react"
import { HubstaffIntegrationDialog } from "@/components/settings/hubstaff/hubstaff-modal"
import { WiseIntegrationDialog } from "@/components/settings/wise/wise-modal"
import { Badge } from "@/components/ui/badge"
import { useGetMyOrganizations } from "@/services/organization.services"

export default function AllIntegrationsPage() {
    const params = useParams()
    const { data: myOrganizations } = useGetMyOrganizations()
    const [isHubStaffOpen, setIsHubStaffOpen] = useState(false)
    const [isWiseOpen, setIsWiseOpen] = useState(false)

    const orgId = (params?.orgId || "") as string
    const isHubstaffConnected = (myOrganizations || []).find((org) => org.organizationId === orgId)?.organization?.isHubstaffConnected || false

    const integrations = [
        {
            id: 'hubstaff',
            name: 'Hubstaff',
            description: 'Sync employee time logs, projects, and productivity data automatically into your workspace.',
            icon: <LineChart className="w-6 h-6 text-black" />,
            status: isHubstaffConnected ? 'Connected' : 'Disconnected',
            onConfigure: () => setIsHubStaffOpen(true)
        },
        {
            id: 'wise',
            name: 'Wise',
            description: 'Automate payroll and international payments securely via your own Wise Business account.',
            icon: <Wallet className="w-6 h-6 text-black" />,
            status: 'Available',
            onConfigure: () => setIsWiseOpen(true)
        }
    ]

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader
                title="Integrations"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Settings", href: `/dashboard/${params?.orgId}/settings`, active: false },
                    { label: "All Integrations", href: "#", active: true }
                ]}
            />
            
            <div className="p-4 lg:p-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-black">App Directory</h2>
                    <p className="text-neutral-500 font-sans mt-1">Enhance your workflow with third-party connections.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((app) => (
                        <Card key={app.id} className="rounded-none border-neutral-200 overflow-hidden flex flex-col group hover:border-black transition-all duration-300 gap-0">
                            <CardHeader className="p-6 pb-2">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-neutral-100 transition-colors">
                                        {app.icon}
                                    </div>
                                    <Badge 
                                        variant="outline" 
                                        className="rounded-none text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 font-bold border-neutral-200 bg-white"
                                    >
                                        {app.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-bold tracking-tight mb-3">{app.name}</CardTitle>
                                <CardDescription className="text-[13px] text-neutral-500 font-sans leading-relaxed min-h-[60px]">
                                    {app.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-4 mt-auto">
                                <Button 
                                    variant="outline" 
                                    className="w-full rounded-none h-12 text-[10px] uppercase tracking-[0.15em] font-sans border-black hover:bg-black hover:text-white transition-all group/btn"
                                    onClick={app.onConfigure}
                                >
                                    Configure Integration
                                    <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Coming Soon Card */}
                    <Card className="rounded-none border-dashed border-neutral-200 bg-neutral-50/30 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                        <div className="w-12 h-12 rounded-full border border-dashed border-neutral-300 flex items-center justify-center mb-4">
                            <LayoutGrid className="w-5 h-5 text-neutral-300" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">More Coming Soon</h3>
                        <p className="text-xs text-neutral-400 font-sans mt-2 max-w-[200px]">We're working on more integrations to streamline your HR operations.</p>
                    </Card>
                </div>
            </div>

            <HubstaffIntegrationDialog
                open={isHubStaffOpen}
                onOpenChange={setIsHubStaffOpen}
                orgId={orgId}
            />
            <WiseIntegrationDialog
                open={isWiseOpen}
                onOpenChange={setIsWiseOpen}
                orgId={orgId}
            />
        </div>
    )
}
