"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

export default function StatusPage() {
    const services = [
        { name: "Web Application", status: "operational" },
        { name: "API Gateway", status: "operational" },
        { name: "Time Tracking API", status: "operational" },
        { name: "Real-time Notifications", status: "operational" },
        { name: "Screenshot Storage", status: "operational" },
    ];

    return (
        <main className="pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse" />
                        <h1 className="text-3xl font-black text-slate-900 font-logo uppercase italic">All Systems <span className="text-emerald-500">Operational</span></h1>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/50 overflow-hidden mb-12">
                        <div className="p-8 border-b border-slate-50 italic font-logo text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Current Status by Service
                        </div>
                        <div className="divide-y divide-slate-50">
                            {services.map((service, i) => (
                                <div key={i} className="px-8 py-6 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                                    <span className="font-bold text-slate-700">{service.name}</span>
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Operational
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-xl font-black text-slate-900 font-logo uppercase italic">Recent Incidents</h3>
                        
                        <div className="pl-6 border-l-2 border-slate-100 space-y-12">
                            <div className="relative">
                                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-slate-200 border-4 border-white" />
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans">March 12, 2026</div>
                                <h4 className="font-bold text-slate-900 mb-2">Scheduled Maintenance</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Completed backend database optimization. No downtime was experienced by end users.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-slate-200 border-4 border-white" />
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans">March 05, 2026</div>
                                <h4 className="font-bold text-slate-900 mb-2">Service Disruption - Resolved</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Minor latency issues were reported with the time tracking sync. Our engineers deployed a fix within 14 minutes.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
