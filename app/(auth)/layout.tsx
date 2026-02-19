"use client";

import { Logo } from "@/components/ui/logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isOnboarding = pathname?.includes("/onboarding");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
            <div className={cn(
                "w-full space-y-6",
                isOnboarding ? "max-w-4xl" : "max-w-md"
            )}>
                <div className="flex justify-center mb-8">
                    <Logo size="lg" />
                </div>
                {children}
            </div>
        </div>
    );
}
