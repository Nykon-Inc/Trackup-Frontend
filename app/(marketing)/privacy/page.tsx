"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
                        Privacy <span className="text-blue-600">Policy</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-12">Last Updated: {lastUpdated}</p>
                    
                    <div className="prose prose-slate max-w-none font-sans text-slate-600 space-y-8">
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic font-logo">1. Data Collection</h2>
                            <p>We collect information that you provide directly to us when you create an account, use our services, or communicate with us. This includes name, email, company details, and technical data related to your use of the Watchtower platform.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic font-logo">2. Monitoring Data</h2>
                            <p>The Watchtower desktop application collects data intended to help manage workforce productivity. This may include time logs, application usage, and system-level activity as configured by your organization. All such data is encrypted at rest and in transit.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic font-logo">3. Data Usage</h2>
                            <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect Watchtower and our users.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic font-logo">4. Your Choices</h2>
                            <p>You may access, update, or delete your personal information at any time through your account settings or by contacting our support team.</p>
                        </section>

                        <section className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 mb-4 uppercase italic font-logo">Questions?</h2>
                            <p className="mb-0">Contact our privacy team at <a href="mailto:privacy@watchtower.com" className="text-blue-600 font-bold underline">privacy@watchtower.com</a> for any clarifications regarding your data.</p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
