
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"] });

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    iconOnly?: boolean;
}

export function Logo({ className, size = "md", iconOnly = false }: LogoProps) {
    const sizeClasses = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl",
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-primary-foreground"
                >
                    <path d="M12 2v4" />
                    <path d="m16.2 7.8 2.9-2.9" />
                    <path d="M18 12h4" />
                    <path d="m16.2 16.2 2.9 2.9" />
                    <path d="M12 18v4" />
                    <path d="m4.9 19.1 2.9-2.9" />
                    <path d="M2 12h4" />
                    <path d="m4.9 4.9 2.9 2.9" />
                </svg>
            </div>
            {!iconOnly && <span className={cn("font-bold tracking-tight text-primary", outfit.className, sizeClasses[size])}>
                Watchtower
            </span>}
        </div>
    );
}
