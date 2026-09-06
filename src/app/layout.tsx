import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DriveGo — Centralized Donation Drives",
  description:
    "Discover, access, and manage donation drives in one place. Browse campaigns, track progress, and support your community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-serif antialiased`}>
        {children}
      </body>
    </html>
  );
}
