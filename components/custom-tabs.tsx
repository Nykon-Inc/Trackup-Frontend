"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface CustomTabsProps {
    tabs: Tab[];
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    persistInRoute?: boolean;
    queryKey?: string;
    className?: string;
}

export function CustomTabs({
    tabs,
    defaultValue,
    value,
    onChange,
    persistInRoute = false,
    queryKey = "tab",
    className,
}: CustomTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [internalActiveTab, setInternalActiveTab] = useState(
        defaultValue || tabs[0]?.value
    );

    // Use controlled value if provided, otherwise internal state
    const activeTab = value !== undefined ? value : internalActiveTab;

    // Sync with URL if persistInRoute is true
    useEffect(() => {
        if (persistInRoute) {
            const currentTab = searchParams.get(queryKey);
            if (currentTab && tabs.some((t) => t.value === currentTab)) {
                setInternalActiveTab(currentTab);
            } else if (defaultValue) {
                setInternalActiveTab(defaultValue);
            }
        }
    }, [searchParams, queryKey, persistInRoute, tabs, defaultValue]);

    const handleTabClick = (newValue: string) => {
        if (value === undefined) {
            setInternalActiveTab(newValue);
        }

        if (onChange) onChange(newValue);

        if (persistInRoute) {
            const params = new URLSearchParams(searchParams.toString());
            params.set(queryKey, newValue);
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
    };

    return (
        <div
            className={cn(
                "inline-flex items-center p-1 bg-[#f5f5f7] dark:bg-muted/50 rounded-xl",
                className
            )}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                    <motion.button
                        key={tab.value}
                        onClick={() => handleTabClick(tab.value)}
                        initial={false}
                        animate={{
                            backgroundColor: isActive ? "white" : "transparent",
                        }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors outline-none",
                            isActive
                                ? "text-[#1d1d1f] dark:text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:bg-background"
                                : "text-[#86868b] hover:text-[#1d1d1f] dark:text-muted-foreground dark:hover:text-foreground"
                        )}
                    >
                        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                        <span>{tab.label}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
