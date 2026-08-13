import type { Metadata } from "next";
import React from "react";

import "./globals.css";
import { Providers } from "./providers"; // We will create this

export const metadata: Metadata = {
  title: {
    default: "Watchtower | Workforce Management & Analytics",
    template: "%s | Watchtower"
  },
  description: "The ultimate workforce management and analytics platform. Monitor productivity, track time, and optimize your team's performance with state-of-the-art insights.",
  keywords: ["workforce management", "time tracking", "productivity analytics", "employee monitoring", "Watchtower", "team optimization"],
  authors: [{ name: "Nykon Inc" }],
  creator: "Nykon Inc",
  publisher: "Nykon Inc",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://watchtower.nykon.cloud"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Watchtower",
    title: "Watchtower | Workforce Management & Analytics",
    description: "The ultimate workforce management and analytics platform. Monitor productivity, track time, and optimize your team's performance.",
    images: [
      {
        url: "/og-watchtower-v2.png",
        width: 1200,
        height: 630,
        alt: "Watchtower Workspace Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watchtower | Workforce Management & Analytics",
    description: "The ultimate workforce management and analytics platform.",
    images: ["/og-watchtower-v2.png"],
    creator: "@nykoninc",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
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
