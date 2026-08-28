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
  openGraph: {
    title: "PPID Digital — Dinas Cipta Karya & Sumber Daya Air",
    description: "Portal Layanan Informasi Publik Digital Resmi Provinsi Sulawesi Tengah.",
    url: "https://ppid.sultengprov.go.id", // Placeholder URL
    siteName: "PPID CIKASDA",
    images: [
      {
        url: "/logo-cikasda.webp",
        width: 800,
        height: 600,
        alt: "Logo CIKASDA Sulteng",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PPID Digital — Dinas Cipta Karya & Sumber Daya Air",
    description: "Portal Layanan Informasi Publik Digital Resmi Provinsi Sulawesi Tengah.",
    images: ["/logo-cikasda.webp"],
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
