import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StarPath - Loom to Playwright Tests",
  description: "Transform Loom videos into comprehensive Playwright test prompts using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900`}
      >
        {/* Animated background overlay */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="fixed inset-0 bg-grid-white/[0.02] pointer-events-none" />

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}

