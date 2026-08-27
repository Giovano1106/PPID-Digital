import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import React from "react";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PPID Digital — Dinas Cipta Karya & Sumber Daya Air Prov. Sulteng",
  description:
    "Portal Layanan Informasi dan Dokumentasi Publik Digital Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah.",
  icons: {
    icon: "/logo-sulteng.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-plus-jakarta bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
