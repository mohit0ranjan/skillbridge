import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SkillBridge — Virtual Internships for Students",
  description:
    "Start a real virtual internship with guided tasks, build projects, and earn a verified certificate. No interviews, no experience needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans relative`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
