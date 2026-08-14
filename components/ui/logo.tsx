import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    iconOnly?: boolean;
}

export function Logo({ className, size = "md", iconOnly = false }: LogoProps) {
    const sizeClasses = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl",
        xl: "text-5xl",
    };

    const iconSizeClasses = {
        sm: "h-7 w-7 rounded-md",
        md: "h-10 w-10 rounded-xl",
        lg: "h-14 w-14 rounded-2xl",
        xl: "h-20 w-20 rounded-[28px]",
    };

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className={cn("relative overflow-hidden shrink-0 shadow-lg shadow-blue-100/50", iconSizeClasses[size])}>
                <Image
                    src="/icon.png"
                    alt="Watchtower Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            {!iconOnly && <span className={cn("font-black tracking-tight text-slate-900 font-logo uppercase italic", sizeClasses[size])}>
                Watchtower
            </span>}
        </div>
    );
}
