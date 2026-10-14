import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { GuestNavbar } from "~/components/layout/GuestNavbar";
import { GuestFooter } from "~/components/layout/GuestFooter";

export const metadata: Metadata = {
  title: "InnKeep Express",
  description: "Find and book your ideal stay in Iloilo City with InnKeep Express. Browse rooms, check availability, and reserve with ease.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
            <GuestNavbar />
            <main className="min-h-screen p-4">{children}</main>
            <GuestFooter />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
