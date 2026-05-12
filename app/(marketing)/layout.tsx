"use client";

import React from 'react';
import { MarketingNavbar } from '@/components/MarketingNavbar';
import { MarketingFooter } from '@/components/MarketingFooter';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingNavbar />
      <div className="grow">
        {children}
      </div>
      <MarketingFooter />
    </div>
  );
}
