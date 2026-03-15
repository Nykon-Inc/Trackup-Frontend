"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function TermsPage() {
    const lastUpdated = "March 15, 2026";

    return (
        <main className="pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 font-logo uppercase italic">
                        Terms of <span className="text-blue-600">Service</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-12">Last Updated: {lastUpdated}</p>
                    
                    <div className="prose prose-slate max-w-none font-sans text-slate-600 space-y-8">
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic font-logo">1. Acceptance of Terms</h2>
                            <p>By accessing or using the Watchtower services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic font-logo">2. Subscription & Billing</h2>
                            <p>Use of Watchtower requires an active subscription. Fees are billed in advance on a recurring and periodic basis (monthly or annually) depending on the plan selected.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic font-logo">3. Content & Responsibility</h2>
                            <p>Users are responsible for the legality, reliability, and appropriateness of all content and data they transmit or create within the platform.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic font-logo">4. Termination</h2>
                            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.</p>
                        </section>

                        <div className="bg-slate-900 p-8 rounded-[32px] text-white">
                            <h2 className="text-xl font-black mb-4 uppercase italic font-logo">Standard Agreement</h2>
                            <p className="mb-0 text-slate-400">These terms constitute a binding legal agreement between you and Nykon Inc. For enterprise-specific SLA agreements, please contact your account manager.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
