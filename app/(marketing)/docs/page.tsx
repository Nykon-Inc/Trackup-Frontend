"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Terminal, Book, Cpu, Search, ChevronRight } from 'lucide-react';

export default function DocsPage() {
    const categories = [
        { title: "Authentication", desc: "Learn how to authenticate your API requests.", icon: Terminal },
        { title: "Team Management", desc: "Manage members, roles, and permissions via API.", icon: Code2 },
        { title: "Reporting", desc: "Programmatically export productivity and time data.", icon: Book },
    ];

    return (
        <main className="pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-4 gap-12">
                    {/* Sidebar */}
                    <aside className="hidden lg:block space-y-8">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Getting Started</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-sm font-bold text-blue-600">Quickstart Guide</a></li>
                                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">API Keys</a></li>
                                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Rate Limits</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Core Resources</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Organizations</a></li>
                                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Projects</a></li>
                                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Time Entries</a></li>
                            </ul>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 font-logo uppercase italic">
                                API <span className="text-blue-600">Documentation</span>
                            </h1>
                            <p className="text-xl text-slate-500 mb-12 max-w-2xl leading-relaxed">
                                Build powerful custom workflows and integrations with the Watchtower developer platform.
                            </p>

                            <div className="relative mb-16">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search the docs..." 
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-blue-600 transition-all font-sans outline-none" 
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 mb-16">
                                {categories.map((cat, i) => (
                                    <div key={i} className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
                                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                            <cat.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-2 font-logo uppercase italic">{cat.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed font-sans">{cat.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-950 rounded-[40px] p-10 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black mb-4 font-logo uppercase italic">Authentication Example</h2>
                                    <pre className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-blue-400 text-sm overflow-x-auto font-mono">
                                        <code>{`curl -X GET "https://api.watchtower.com/v1/user" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                                    </pre>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
