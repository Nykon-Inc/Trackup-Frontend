"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactPage() {
    return (
        <main className="pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 font-logo uppercase italic">
                        Contact <span className="text-blue-600">Us</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Have questions about Watchtower? Our team is here to help you optimize your workforce operations.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1 border-slate-100 shadow-xl shadow-slate-200/50 rounded-[32px]">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase italic font-logo">Get in Touch</h3>
                            
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                        <p className="text-slate-900 font-bold">hello@watchtower.com</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                                        <Phone className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Sales</p>
                                        <p className="text-slate-900 font-bold">+1 (555) 000-0000</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Office</p>
                                        <p className="text-slate-900 font-bold">Lagos, Nigeria</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-slate-100 shadow-xl shadow-slate-200/50 rounded-[32px]">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase italic font-logo">Send a Message</h3>
                            
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                        <input type="text" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 focus:ring-2 focus:ring-blue-600 transition-all font-sans" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                        <input type="email" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 focus:ring-2 focus:ring-blue-600 transition-all font-sans" placeholder="john@company.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Subject</label>
                                    <input type="text" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 focus:ring-2 focus:ring-blue-600 transition-all font-sans" placeholder="I have a question about enterprise plans" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Message</label>
                                    <textarea rows={4} className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-600 transition-all font-sans resize-none" placeholder="Tell us how we can help..." />
                                </div>
                                
                                <Button className="w-full h-14 bg-slate-950 text-white hover:bg-slate-800 rounded-xl font-bold gap-2 text-base shadow-lg shadow-slate-200 transition-all">
                                    Send Message
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
