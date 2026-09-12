import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";
import { SubmitModalProvider } from "@/components/drive/submit-modal-context";
import { DriveModalProvider } from "@/components/drive/drive-modal-context";
import { NavigationLoader } from "@/components/ui/navigation-loader";

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
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        <AuthModalProvider>
          <SubmitModalProvider>
            <DriveModalProvider>{children}</DriveModalProvider>
          </SubmitModalProvider>
        </AuthModalProvider>
      </body>
    </html>
  );
}
