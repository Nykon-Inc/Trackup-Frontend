"use client";

import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export const MarketingFooter = () => {
    return (
        <footer className="pt-20 pb-10 bg-white border-t border-slate-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="col-span-2 lg:col-span-1">
                    <Link href="/" className="flex items-center gap-2 mb-6">
                        <Logo size="md" />
                    </Link>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                        Watchtower is the next generation of workforce management, built with scalability and productivity at its core.
                    </p>
                </div>
                <div>
                    <h5 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Product</h5>
                    <ul className="space-y-4 text-sm text-slate-500 font-medium">
                        <li><Link href="/#features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                        <li><Link href="/#use-cases" className="hover:text-blue-600 transition-colors">Use Cases</Link></li>
                        <li><Link href="/downloads" className="hover:text-blue-600 transition-colors">Downloads</Link></li>
                        <li><Link href="/request-demo" className="hover:text-blue-600 transition-colors">Request a Demo</Link></li>
                        <li><Link href="/login" className="hover:text-blue-600 transition-colors">Member Sign In</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Company</h5>
                    <ul className="space-y-4 text-sm text-slate-500 font-medium">
                        <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                        <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Support</h5>
                    <ul className="space-y-4 text-sm text-slate-500 font-medium">
                        <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                        <li><Link href="/resources" className="hover:text-blue-600 transition-colors">Resources</Link></li>
                        <li><Link href="/status" className="hover:text-blue-600 transition-colors">System Status</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-50 gap-6">
                <p className="text-xs text-slate-400 font-medium font-sans">
                    © 2026 Nykon Inc. All rights reserved. Registered trademark of Nykon.
                </p>
                <div className="flex items-center gap-6">
                    <Twitter className="h-4 w-4 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
                    <Linkedin className="h-4 w-4 text-slate-400 hover:text-blue-700 cursor-pointer transition-colors" />
                    <Github className="h-4 w-4 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors" />
                </div>
            </div>
        </footer>
    );
};
