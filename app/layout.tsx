import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import React from "react";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PPID Digital — Dinas Cipta Karya & Sumber Daya Air Prov. Sulteng",
  description: "Portal Layanan Informasi dan Dokumentasi Publik Digital Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-plus-jakarta bg-paper text-midnight-ink">{children}</body>
    </html>
  );
}
