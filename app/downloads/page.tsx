"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Download,
    Apple,
    Monitor,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Shield,
    Zap,
    Cpu,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { MarketingNavbar } from '@/components/MarketingNavbar';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Card, CardContent } from '@/components/ui/card';


export default function DownloadsPage() {
    const [version, setVersion] = React.useState("v3.5.18");
    const [size, setSize] = React.useState("78.2 MB");

    const formatBytes = (bytes: number, decimals = 1) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    React.useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await fetch("https://jujjlgwwuhxhjxlkxcfn.supabase.co/storage/v1/object/public/app-releases/latest/update.json");
                const data = await response.json();
                if (data.version) {
                    setVersion(`v${data.version}`);
                }
                // Try to get size from a common platform
                const commonPlatform = data.platforms?.["darwin-aarch64"] || data.platforms?.["darwin-x86_64"];
                if (commonPlatform?.content_length) {
                    setSize(formatBytes(commonPlatform.content_length));
                }
            } catch (error) {
                console.error("Failed to fetch version info:", error);
            }
        };
        fetchVersion();
    }, []);

    const platforms = [
        {
            name: "macOS",
            version: version,
            size: size,
            icon: Apple,
            primary: true,
            requirements: "macOS 11.0 or later",
            link: "https://jujjlgwwuhxhjxlkxcfn.storage.supabase.co/storage/v1/object/public/app-releases/latest/Watchtower-desktop.dmg",
            type: "Disk Image (.dmg)"
        },
        {
            name: "Windows",
            version: version,
            size: size,
            icon: Monitor,
            primary: false,
            requirements: "Windows 10/11 (64-bit)",
            link: "https://jujjlgwwuhxhjxlkxcfn.storage.supabase.co/storage/v1/object/public/app-releases/latest/Watchtower-desktop.exe",
            type: "Executable (.exe)"
        },
        {
            name: "Linux",
            version: version,
            size: size,
            icon: Cpu,
            primary: false,
            requirements: "Ubuntu, Fedora, Debian",
            link: "https://jujjlgwwuhxhjxlkxcfn.storage.supabase.co/storage/v1/object/public/app-releases/latest/Watchtower-desktop.AppImage",
            type: "AppImage (.AppImage)"
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            <MarketingNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-teal-50/50 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-12">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors group">
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>
                    </div>

                    <div className="max-w-3xl mb-16">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 font-logo uppercase italic">
                            Get the <span className="text-blue-600">Watchtower</span> App
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed font-sans">
                            High-performance desktop applications designed for seamless time tracking and productivity monitoring. Choose your platform below to get started.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-24">
                        {platforms.map((platform, i) => (
                            <motion.div
                                key={platform.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className={`h-full border-slate-200/60 shadow-2xl shadow-slate-100 rounded-[32px] overflow-hidden transition-all hover:scale-[1.02] ${platform.primary ? 'ring-2 ring-blue-600 ring-offset-4' : ''}`}>
                                    <CardContent className="p-8 flex flex-col h-full">
                                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-8 ${platform.primary ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                            <platform.icon className="h-8 w-8" />
                                        </div>

                                        <div className="mb-8 grow">
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-logo uppercase">{platform.name}</h3>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md tracking-wider uppercase">{platform.version}</span>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{platform.size}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-6">
                                                {platform.type} for {platform.requirements}
                                            </p>
                                        </div>

                                        <a href={platform.link} download>
                                            <Button className={`w-full h-12 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${platform.primary ? 'bg-slate-950 text-white hover:bg-slate-800 shadow-slate-200' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}`}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download for {platform.name}
                                            </Button>
                                        </a>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Features checklist */}
                    <div className="grid md:grid-cols-2 gap-16 items-center bg-slate-50/50 rounded-[40px] p-12 border border-slate-100">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6 font-logo uppercase">Why use the desktop app?</h2>
                            <ul className="space-y-6">
                                {[
                                    { title: "Offline Tracking", desc: "Keep tracking time even when your internet connection drops.", icon: Shield },
                                    { title: "Smart Screenshots", desc: "Automated, non-intrusive activity monitoring for accurate billing.", icon: CheckCircle2 },
                                    { title: "Native Performance", desc: "Lightweight application that won't slow down your computer.", icon: Zap }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                            <item.icon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1 uppercase tracking-tight">{item.title}</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed font-sans">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative aspect-video rounded-3xl overflow-hidden border-8 border-white shadow-2xl bg-slate-900">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 to-teal-500/20 mix-blend-overlay" />
                            <div className="flex items-center justify-center h-full">
                                <Logo size="lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
