import type { Metadata } from "next";
import { Geist, Geist_Mono,Merriweather_Sans } from "next/font/google";
import { AuthProvider } from "@/context/auth-context"
import "./globals.css";

const merriweather = Merriweather_Sans({
  subsets: ["latin"],
  variable: "--font-merriweather-sans",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fridge",
  description: "cool fridge app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.variable} ${geistMono.variable} antialiased dark`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
