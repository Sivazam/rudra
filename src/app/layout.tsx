import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DataStoreProvider } from "@/lib/data-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rudra Store - Authentic Spiritual Products",
  description: "Premium quality Rudraksha beads, malas, and spiritual products. Authentic Nepali Rudraksha with lab certification. Free shipping across India.",
  keywords: ["Rudraksha", "Spiritual Products", "Nepali Rudraksha", "Rudraksha Mala", "Spiritual Beads", "Meditation", "Yoga Accessories", "Hindu Spiritual Items"],
  authors: [{ name: "Rudra Store" }],
  openGraph: {
    title: "Rudra Store - Authentic Spiritual Products",
    description: "Premium quality Rudraksha beads and spiritual products. Authentic Nepali Rudraksha with lab certification.",
    url: "https://rudrastore.com",
    siteName: "Rudra Store",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rudra Store - Authentic Spiritual Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rudra Store - Authentic Spiritual Products",
    description: "Premium quality Rudraksha beads and spiritual products.",
    images: ["/twitter-image.jpg"],
  },
  other: {
    "twitter:site": "@rudrastore",
    "twitter:creator": "@rudrastore",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <DataStoreProvider>
          {children}
          <Toaster />
        </DataStoreProvider>
      </body>
    </html>
  );
}
