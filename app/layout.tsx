import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

// Font untuk Heading & Display (Modern, tebal, estetik)
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

// Font untuk Body (Sangat mudah dibaca di layar HP)
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DetectiveUang - AI Financial Planner",
  description: "Manajemen Keuangan Cerdas dengan AI",
  themeColor: "#ffffff", // Penting untuk UI Mobile
  manifest: "/manifest.json", // Jika nanti diubah jadi PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
