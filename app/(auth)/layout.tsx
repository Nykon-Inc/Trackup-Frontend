"use client";

import { Logo } from "@/components/ui/logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isOnboarding = pathname?.includes("/onboarding");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden p-4 md:p-8">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] animate-glow-ambient" />
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-teal-50/30 rounded-full blur-[100px] animate-glow-drift" />
            </div>

            <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center flex-1">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <Link href="/">
                        <Logo size="lg" />
                    </Link>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className={cn("w-full", isOnboarding ? "max-w-4xl" : "max-w-md")}
                >
                    {children}
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="w-full max-w-7xl mx-auto py-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-slate-100 mt-12">
                <p className="text-xs text-slate-400 font-medium font-sans">
                    © 2026 Nykon Inc. All rights reserved.
                </p>
                <div className="flex items-center gap-8 text-xs font-semibold text-slate-500">
                    <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Support</Link>
                </div>
            </footer>
        </div>
    );
}
