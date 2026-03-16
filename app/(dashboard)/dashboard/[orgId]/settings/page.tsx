"use client"

import { PageHeader } from "@/components/page-header"
import { useParams } from "next/navigation";
import {
    LayoutGrid,
    FileText,
    Lightbulb,
    Search,
    Settings as SettingsIcon,
    ShieldCheck,
    CreditCard,
    Puzzle,
    ArrowRight,
    Globe,
    Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useMemo } from "react";
import { HubstaffIntegrationDialog } from "@/components/settings/hubstaff/hubstaff-modal";
import { WiseIntegrationDialog } from "@/components/settings/wise/wise-modal";
import { DeelIntegrationDialog } from "@/components/settings/deel/deel-modal";
import { cn } from "@/lib/utils";

interface SettingItem {
    title: string;
    description: string;
    icon: any;
    href?: string;
    onClick?: () => void;
    tag?: string;
    isComingSoon?: boolean;
}

interface SettingCategory {
    title: string;
    description: string;
    items: SettingItem[];
}

export default function SettingsPage() {
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [isHubStaffOpen, setIsHubStaffOpen] = useState(false);
    const [isWiseOpen, setIsWiseOpen] = useState(false);
    const [isDeelOpen, setIsDeelOpen] = useState(false);

    const categories: SettingCategory[] = [
        {
            title: "Workflow & integrations",
            description: "Connect and manage third-party tools and services.",
            items: [
                {
                    title: "Hubstaff",
                    description: "Configure time tracking and project synchronization.",
                    icon: LayoutGrid,
                    onClick: () => setIsHubStaffOpen(true),
                },
                {
                    title: "Wise",
                    description: "Automate global payroll and contractor payments.",
                    icon: Globe,
                    onClick: () => setIsWiseOpen(true),
                },
                {
                    title: "Deel",
                    description: "Automate global payroll and contractor payments.",
                    icon: Globe,
                    onClick: () => setIsDeelOpen(true),
                }
            ]
        },
        {
            title: "Policies & Rules",
            description: "Define attendance, leave, and break policies.",
            items: [
                {
                    title: "Time off",
                    description: "Paid leave, sick days, and holiday accruals.",
                    icon: FileText,
                    href: `/dashboard/${params?.orgId}/settings/policies/time-off`,
                },
                {
                    title: "Work breaks",
                    description: "Configure mandatory and optional break settings.",
                    icon: FileText,
                    href: `/dashboard/${params?.orgId}/settings/policies/work-breaks`,
                },
                {
                    title: "Holidays",
                    description: "Manage statutory holidays and custom closures.",
                    icon: FileText,
                    href: `/dashboard/${params?.orgId}/settings/policies/holidays`,
                }
            ]
        },
        // {
        //     title: "Organization",
        //     description: "Manage your company profile and team structure.",
        //     items: [
        //         {
        //             title: "General Settings",
        //             description: "Company name, logo, and basic information.",
        //             icon: SettingsIcon,
        //             href: `/dashboard/${params?.orgId}/settings/general`,
        //         },
        //         {
        //             title: "Team Permissions",
        //             description: "Define custom roles and access levels.",
        //             icon: ShieldCheck,
        //             href: `/dashboard/${params?.orgId}/settings/roles`,
        //             isComingSoon: true
        //         },
        //         {
        //             title: "Security",
        //             description: "Two-factor authentication and session management.",
        //             icon: Lock,
        //             href: `/dashboard/${params?.orgId}/settings/security`,
        //             isComingSoon: true
        //         }
        //     ]
        // },
        // {
        //     title: "Finance & Add-ons",
        //     description: "Billing, payments, and premium functionality.",
        //     items: [
        //         {
        //             title: "AI Insights",
        //             description: "Intelligent analytics for apps and URL usage.",
        //             icon: Lightbulb,
        //             href: `/dashboard/${params?.orgId}/settings/insights/classifications`,
        //             tag: "Add-on"
        //         },
        //         {
        //             title: "Billing & Plans",
        //             description: "Manage subscriptions and payment methods.",
        //             icon: CreditCard,
        //             href: `/dashboard/${params?.orgId}/settings/billing`,
        //             isComingSoon: true
        //         }
        //     ]
        // }
    ];

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;

        return categories.map(category => ({
            ...category,
            items: category.items.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(category => category.items.length > 0);
    }, [searchQuery, categories]);

    return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA]">
            <PageHeader
                title="Settings"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Settings", href: `/dashboard/${params?.orgId}/settings`, active: true }
                ]}
            />

            <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Organization Settings</h2>
                        <p className="text-neutral-500 font-sans mt-1">Configure your workspace, integrations, and policies.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Find a setting..."
                            className="pl-10 h-10 bg-white border-neutral-200 focus-visible:ring-black rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-12">
                    {filteredCategories.map((category, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className="border-b border-neutral-200 pb-2 flex items-center justify-between">
                                <div>
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">{category.title}</h3>
                                    <p className="text-[11px] text-neutral-400 mt-0.5">{category.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.items.map((item, itemIdx) => {
                                    const Content = (
                                        <Card className={cn(
                                            "group relative flex flex-col h-full border-neutral-200 rounded-xl transition-all duration-200 hover:border-black hover:shadow-sm overflow-hidden bg-white gap-0",
                                            item.isComingSoon && "opacity-60 cursor-not-allowed"
                                        )}>
                                            <CardHeader className="px-5 pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                                        <item.icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        {item.tag && (
                                                            <Badge variant="secondary" className="bg-neutral-100 text-neutral-900 hover:bg-neutral-100 border-none rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                                                {item.tag}
                                                            </Badge>
                                                        )}
                                                        {item.isComingSoon && (
                                                            <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-neutral-200 text-neutral-400 bg-neutral-50">
                                                                Upcoming
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-5">
                                                    <CardTitle className="text-base font-bold text-neutral-900 leading-tight">{item.title}</CardTitle>
                                                    <CardDescription className="text-xs font-sans mt-2 leading-relaxed text-neutral-500 line-clamp-2">
                                                        {item.description}
                                                    </CardDescription>
                                                </div>
                                            </CardHeader>
                                            <div className="mt-auto p-5 pt-3 flex items-center justify-between border-t border-neutral-50 bg-neutral-50/30">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-black transition-colors">
                                                    {item.isComingSoon ? 'Request Early Access' : 'Manage Settings'}
                                                </span>
                                                <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </Card>
                                    );

                                    if (item.isComingSoon) {
                                        return <div key={itemIdx}>{Content}</div>;
                                    }

                                    if (item.onClick) {
                                        return (
                                            <button
                                                key={itemIdx}
                                                onClick={item.onClick}
                                                className="text-left w-full h-full focus:outline-none"
                                            >
                                                {Content}
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link key={itemIdx} href={item.href || "#"} className="h-full">
                                            {Content}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="bg-neutral-100 p-6 rounded-full mb-6">
                                <Search className="h-10 w-10 text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Search fell short</h3>
                            <p className="text-neutral-500 font-sans mt-2 max-w-sm mx-auto">We couldn't find any settings matching "{searchQuery}". Try a different keyword or browse categories below.</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-6 px-4 py-2 text-sm font-bold text-black bg-neutral-100 hover:bg-neutral-200 transition-colors uppercase tracking-widest"
                            >
                                Reset Search
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <HubstaffIntegrationDialog
                open={isHubStaffOpen}
                onOpenChange={setIsHubStaffOpen}
                orgId={(params?.orgId || "") as string}
            />
            <WiseIntegrationDialog
                open={isWiseOpen}
                onOpenChange={setIsWiseOpen}
                orgId={(params?.orgId || "") as string}
            />
            <DeelIntegrationDialog
                open={isDeelOpen}
                onOpenChange={setIsDeelOpen}
                orgId={(params?.orgId || "") as string}
            />
        </div>
    );
}
