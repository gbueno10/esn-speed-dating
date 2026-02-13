import type { Metadata } from "next";
import { Inter, Work_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scan & Match - ESN Porto",
  description: "Scan QR codes, meet people, find your match!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${workSans.variable} antialiased font-sans`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
