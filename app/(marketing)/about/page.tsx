"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <main className="pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 font-logo uppercase italic">
                        About <span className="text-blue-600">Watchtower</span>
                    </h1>
                    
                    <div className="prose prose-slate max-w-none prose-lg prose-headings:font-logo prose-headings:uppercase prose-headings:italic">
                        <p className="text-xl text-slate-600 leading-relaxed mb-8 font-sans">
                            Watchtower is a cutting-edge workforce management platform designed to help modern teams reach their full potential. Based in the heart of innovation, we build tools that bridge the gap between effort and impact.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Our Mission</h2>
                        <p className="text-slate-600 mb-6">
                            To empower organizations with deep, actionable insights into their operations, enabling them to build more productive, healthy, and successful teams. We believe that transparency and data-driven decision-making are the cornerstones of high-performance culture.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">The Story</h2>
                        <p className="text-slate-600 mb-6">
                            Founded in 2024, Watchtower arose from a simple realization: the tools used to manage remote and hybrid teams were lagging behind the reality of modern work. We set out to build a platform that doesn't just "track time," but provides a holistic view of team health and project momentum.
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 mt-16">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h4 className="font-black text-blue-600 mb-2 uppercase italic">Precision</h4>
                                <p className="text-sm text-slate-500">Accurate to the second, providing data you can trust for every billing cycle.</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h4 className="font-black text-blue-600 mb-2 uppercase italic">Insight</h4>
                                <p className="text-sm text-slate-500">Beyond numbers—we provide the context needed to understand team productivity.</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h4 className="font-black text-blue-600 mb-2 uppercase italic">Security</h4>
                                <p className="text-sm text-slate-500">Enterprise-grade protection for your most sensitive operational data.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
