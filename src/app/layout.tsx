import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata: Metadata = {
  title: "PresenceAI — Generative Engine Optimization",
  description:
    "Discover how your brand appears across AI models like ChatGPT, Claude, Gemini, Perplexity, and Grok. Get your GEO score and actionable recommendations.",
  keywords: [
    "GEO",
    "generative engine optimization",
    "AI search",
    "brand visibility",
    "ChatGPT",
    "Claude",
    "Gemini",
  ],
  openGraph: {
    title: "PresenceAI — See How AI Sees Your Brand",
    description:
      "Get your Generative Engine Optimization score across 5 AI models in under 2 minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen hero-bg antialiased">
        <SessionWrapper>
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#343135",
                color: "#f5f4f0",
                border: "1px solid #4e4a4f",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#8e6e91",
                  secondary: "#f5f4f0",
                },
              },
            }}
          />
        </SessionWrapper>
      </body>
    </html>
  );
}
