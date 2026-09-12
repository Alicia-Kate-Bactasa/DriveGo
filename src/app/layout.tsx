import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { SubmitModalProvider } from "@/components/drive/submit-modal-context";
import { RouteLoadingOverlay } from "@/components/ui/route-loading-indicator";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "600"],
  display: "swap",
});

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
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        <SubmitModalProvider>
          <RouteLoadingOverlay />
          {children}
        </SubmitModalProvider>
      </body>
    </html>
  );
}
