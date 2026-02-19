import PageTransition from "@/components/ui/page-transition";
import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <PageTransition>
            {children}
        </PageTransition>
    );
}
