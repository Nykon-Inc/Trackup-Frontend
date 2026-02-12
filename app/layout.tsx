import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Import Outfit and Inter
import React from "react";

import "./globals.css";
import { Providers } from "./providers"; // We will create this

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Trackup",
  description: "The ultimate workforce management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <Providers>
            <React.Suspense fallback={<div className="h-screen w-screen flex justify-center items-center">Loading...</div>}>
              {children}
            </React.Suspense>
          </Providers>
        </div>
      </body>
    </html>
  );
}
