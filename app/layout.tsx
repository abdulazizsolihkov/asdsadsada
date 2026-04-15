import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meros Kalkulyatori — Islomiy Meros Taqsimoti",
  description: "Islomiy meros (meros/mirath) taqsimotini hisoblash uchun onlayn kalkulyator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="h-full">
      <body className={`${geist.className} min-h-full bg-gray-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
