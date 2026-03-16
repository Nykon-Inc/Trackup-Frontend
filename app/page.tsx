"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketingNavbar } from '@/components/MarketingNavbar';
import { MarketingFooter } from '@/components/MarketingFooter';
import {
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    BarChart3,
    Shield,
    Zap,
    Users,
    Clock,
    LayoutDashboard,
    Menu,
    X,
    Plus,
    Minus,
    Download,
    Github,
    Twitter,
    Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

// --- Components ---

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-slate-200/40 bg-white/70 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo size="md" />
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</Link>
                            <Link href="#use-cases" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Use Cases</Link>
                            <Link href="#integrations" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Integrations</Link>
                            <Link href="#faq" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">FAQ</Link>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="font-semibold text-foreground/80">Log In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold shadow-lg shadow-primary/20">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-4">
                            <Link href="#features" className="block text-base font-medium text-slate-600 p-2" onClick={() => setIsOpen(false)}>Features</Link>
                            <Link href="#use-cases" className="block text-base font-medium text-slate-600 p-2" onClick={() => setIsOpen(false)}>Use Cases</Link>
                            <Link href="#integrations" className="block text-base font-medium text-slate-600 p-2" onClick={() => setIsOpen(false)}>Integrations</Link>
                            <Link href="#faq" className="block text-base font-medium text-slate-600 p-2" onClick={() => setIsOpen(false)}>FAQ</Link>
                            <div className="pt-4 flex flex-col gap-3">
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full h-11">Log In</Button>
                                </Link>
                                <Link href="/signup" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full h-11 bg-slate-950 text-white">Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const Hero = () => {
    const [os, setOs] = useState<{ name: string; link: string; icon: string }>({
        name: "App",
        link: "https://jujjlgwwuhxhjxlkxcfn.storage.supabase.co/storage/v1/object/public/app-releases/latest/Watchtower-desktop.dmg",
        icon: "mac"
    });
    const [version, setVersion] = useState("");

    React.useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await fetch("https://jujjlgwwuhxhjxlkxcfn.supabase.co/storage/v1/object/public/app-releases/latest/update.json");
                const data = await response.json();
                if (data.version) {
                    setVersion(`v${data.version}`);
                }
            } catch (error) {
                console.error("Failed to fetch version info:", error);
            }
        };
        fetchVersion();

        const platform = window.navigator.platform.toLowerCase();
        if (platform.includes('win')) {
            setOs({
                name: "Windows",
                link: "https://jujjlgwwuhxhjxlkxcfn.storage.supabase.co/storage/v1/object/public/app-releases/latest/Watchtower-desktop.exe",
                icon: "windows"
            });
        } else if (platform.includes('mac')) {
            setOs({
                name: "macOS",
                link: "https://jujjlgwwuhxhjxlkxcfn.storage.supabase.co/storage/v1/object/public/app-releases/latest/Watchtower-desktop.dmg",
                icon: "mac"
            });
        } else if (platform.includes('linux')) {
            setOs({
                name: "Linux",
                link: "https://jujjlgwwuhxhjxlkxcfn.storage.supabase.co/storage/v1/object/public/app-releases/latest/Watchtower-desktop.AppImage",
                icon: "linux"
            });
        }
    }, []);

    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] animate-glow-ambient" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-teal-50/50 rounded-full blur-[100px] animate-glow-drift" />
            </div>

            <div className="max-w-7xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[12px] font-bold tracking-tight uppercase mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Introducing Watchtower {version || "2.0"}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6 font-logo">
                        Workforce Management <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary italic">
                            Reimagined.
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-sans">
                        The ultimate platform for productivity tracking, project insights, and seamless team optimization. Build high-performing teams with state-of-the-art surveillance and analytics.
                    </p>
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <Button size="lg" className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-base font-bold shadow-xl shadow-primary/20 group">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <a href={os.link} download>
                                    <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-base font-semibold bg-white border-slate-200 hover:bg-slate-50 transition-colors">
                                        <Download className="mr-2 h-5 w-5" />
                                        Download for {os.name}
                                    </Button>
                                </a>
                            </div>
                        </div>
                        <Link href="/downloads" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 group">
                            Looking for other platforms?
                            <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                                View all downloads <ChevronRight className="h-4 w-4" />
                            </span>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-16 relative"
                >
                    <div className="relative mx-auto max-w-[1000px] p-2 bg-linear-to-b from-slate-200/50 to-slate-100/20 rounded-3xl border border-white shadow-2xl backdrop-blur-sm">
                        <div className="rounded-2xl overflow-hidden shadow-inner bg-slate-900 relative aspect-video">
                            <Image
                                src="/hero-dashboard.png"
                                alt="Watchtower Dashboard"
                                fill
                                className="object-cover opacity-90"
                                priority
                            />
                        </div>
                    </div>
                    {/* Floating accents */}
                    <div className="absolute -top-10 -right-10 hidden lg:block bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-800">Team Active: 84%</span>
                        </div>
                    </div>
                    <div className="absolute -bottom-6 -left-10 hidden lg:block bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float" style={{ animationDelay: '1s' }}>
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-bold text-slate-800">+12% Productivity</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const Features = () => {
    const features = [
        {
            title: "Advanced Tracking",
            description: "Real-time activity monitoring with optional screenshots and automated focus analysis.",
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "Smart Analytics",
            description: "Deep dive into team performance with AI-driven insights and productivity scores.",
            icon: BarChart3,
            color: "text-teal-500",
            bg: "bg-teal-50"
        },
        {
            title: "Enterprise Security",
            description: "Military-grade encryption and granular role-based access control for your data.",
            icon: Shield,
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        },
        {
            title: "Project Optimization",
            description: "Allocate resources efficiently with automated project cost calculation and time logs.",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-50"
        }
    ];

    return (
        <section id="features" className="py-24 bg-muted/50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Capabilities</h2>
                    <h3 className="text-4xl font-bold text-foreground mb-4 font-logo">A platform built for every stage.</h3>
                    <p className="max-w-xl mx-auto text-muted-foreground">From early startups to enterprise-level organizations, Watchtower provides the tools you need to stay in control.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6", feature.bg)}>
                                <feature.icon className={cn("h-6 w-6", feature.color)} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const UseCases = () => {
    const [activeTab, setActiveTab] = useState('managers');

    const content = {
        managers: {
            title: "Precision Management",
            subtitle: "Lead with data, not guesswork.",
            description: "Empower your managers with real-time dashboards to track team progress, approve manual time requests, and monitor project health without micro-managing.",
            image: "/use-case-manager.png",
            points: ["Approve time requests instantly", "Monitor team work-life balance", "Detailed activity reports"]
        },
        members: {
            title: "Focus & Productivity",
            subtitle: "Designed for modern workflows.",
            description: "A non-intrusive desktop app that helps team members track their time effectively, manage their tasks, and stay focused on what matters most.",
            image: "/use-case-member.png",
            points: ["Easy-to-use desktop widget", "Track time across projects", "Privacy-first approach"]
        }
    };

    return (
        <section id="use-cases" className="py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 w-full lg:w-1/2">
                        <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-3">Use Cases</h2>
                        <h3 className="text-4xl font-bold text-foreground mb-8 font-logo">Tailored for your team.</h3>

                        <div className="flex gap-4 mb-10 p-1 bg-slate-100 rounded-full w-fit">
                            <button
                                onClick={() => setActiveTab('managers')}
                                className={cn(
                                    "px-8 py-2.5 rounded-full text-sm font-bold transition-all",
                                    activeTab === 'managers' ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                For Managers
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={cn(
                                    "px-8 py-2.5 rounded-full text-sm font-bold transition-all",
                                    activeTab === 'members' ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                For Members
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h4 className="text-xs font-extrabold text-blue-600 uppercase mb-2">{(content as any)[activeTab].subtitle}</h4>
                                <h5 className="text-3xl font-bold text-slate-900 mb-6 font-logo">{(content as any)[activeTab].title}</h5>
                                <p className="text-slate-500 mb-8 leading-relaxed italic text-lg">
                                    "{(content as any)[activeTab].description}"
                                </p>
                                <ul className="space-y-4">
                                    {(content as any)[activeTab].points.map((point: string, i: number) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                            </div>
                                            <span className="text-slate-700 font-medium">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 relative">
                        <div className="relative z-10 w-full aspect-square rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full w-full relative"
                                >
                                    <Image
                                        src={(content as any)[activeTab].image}
                                        alt={activeTab}
                                        fill
                                        className="object-cover"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* Decorative background circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border-2 border-slate-100 rounded-full z-0" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-2 border-slate-100 rounded-full z-0" />
                    </div>
                </div>
            </div>
        </section>
    );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: "How does the time tracking work?",
            a: "Watchtower provides a lightweight desktop application for Mac and Windows. Users select a project and hit 'Start'. The app logs work sessions and, if enabled, takes occasional screenshots."
        },
        {
            q: "Is my team's privacy protected?",
            a: "Absolutely. Screenshots can be blurred or disabled entirely project-by-project. We believe in transparency and autonomy for every team member."
        },
        {
            q: "Does Watchtower integrate with other tools?",
            a: "Yes, we currently support full integration with Hubstaff projects and provide a robust API for custom connections to your internal CRM or project management software."
        },
        {
            q: "Can I manage different organizations?",
            a: "Yes! Watchtower is built with a multi-org architecture, allowing managers and owners to toggle between workspace environments seamlessly."
        }
    ];

    return (
        <section id="faq" className="py-24 bg-background">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-bold text-slate-900 mb-4 font-logo">FAQs</h3>
                    <p className="text-slate-500">Everything you need to know about getting started.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={cn(
                                "border rounded-2xl overflow-hidden transition-all",
                                openIndex === i ? "border-slate-200 bg-slate-50/50 shadow-sm" : "border-slate-100 hover:border-slate-200"
                            )}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex justify-between items-center p-6 text-left"
                            >
                                <span className="font-bold text-slate-800">{faq.q}</span>
                                {openIndex === i ? <Minus className="h-4 w-4 text-slate-400" /> : <Plus className="h-4 w-4 text-slate-400" />}
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CTASection = () => {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto bg-linear-to-br from-slate-950 to-blue-900 rounded-[40px] p-12 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 font-logo leading-tight">
                        Give your team the <span className="text-secondary/80">Watchtower</span> edge.
                    </h3>
                    <p className="text-white/80 max-w-xl mx-auto mb-10 text-lg">
                        Ready to optimize? Join hundreds of teams already scaling with Watchtower. Start your 14-day free trial today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <Button size="lg" className="h-14 px-10 bg-white text-slate-950 hover:bg-slate-100 rounded-full text-base font-bold shadow-xl">
                                Create My Account
                            </Button>
                        </Link>
                        <Button variant="ghost" className="text-white hover:bg-white/10 font-bold px-8 h-14 rounded-full border border-white/20">
                            Book a Demo
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};


export default function Home() {
    return (
        <main className="min-h-screen bg-background">
            <MarketingNavbar />
            <Hero />
            <div className="max-w-7xl mx-auto px-4 py-12 flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                {/* Mock logos */}
                <div className="text-2xl font-black text-slate-900 tracking-tighter italic font-logo">Linear</div>
                <div className="text-2xl font-black text-slate-900 tracking-tighter lowercase font-logo">vercel</div>
                <div className="text-2xl font-black text-slate-900 tracking-tighter font-logo">RAILWAY</div>
                <div className="text-2xl font-black text-slate-900 tracking-tighter italic font-logo">Supabase</div>
                <div className="text-2xl font-black text-slate-900 tracking-tighter uppercase font-logo">Nykon</div>
            </div>
            <Features />
            <UseCases />
            <CTASection />
            <FAQSection />
            <MarketingFooter />
        </main>
    );
}
