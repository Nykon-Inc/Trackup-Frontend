import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import React from "react"
import { NotificationsTrigger } from "@/components/notifications/notifications-trigger"
import { GlobalSearch } from "@/components/global-search"
import { PaymentNudgeBanner } from "./dashboard/payment-nudge-banner"

interface BreadcrumbItem {
    label: string
    href?: string
    active?: boolean
}

interface PageHeaderProps {
    title: string
    breadcrumbs?: BreadcrumbItem[]
    rightElement?: React.ReactNode
}

export function PageHeader({ title, breadcrumbs, rightElement }: PageHeaderProps) {
    return (
        <div className="flex flex-col w-full sticky top-0 z-10">
            <header className="flex h-12 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 w-full bg-white border-b px-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-0 h-4" />
                    <div className="flex flex-col gap-0.5 leading-none">
                        <h1 className="font-semibold">{title}</h1>
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <Breadcrumb>
                                <BreadcrumbList className="gap-1 sm:gap-1">
                                    {breadcrumbs.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <BreadcrumbItem className="text-[10px] text-muted-foreground">
                                                {!item.active && item.href ? (
                                                    <BreadcrumbLink href={item.href} className="hover:text-foreground">
                                                        {item.label}
                                                    </BreadcrumbLink>
                                                ) : (
                                                    <BreadcrumbPage className="text-[10px] text-muted-foreground font-normal">{item.label}</BreadcrumbPage>
                                                )}
                                            </BreadcrumbItem>
                                            {index < breadcrumbs.length - 1 && (
                                                <BreadcrumbSeparator className="[&>svg]:size-3.5" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-64">
                        <GlobalSearch />
                    </div>
                    <NotificationsTrigger />
                    {rightElement}
                </div>
            </header>
            <PaymentNudgeBanner />
        </div>
    )
}
