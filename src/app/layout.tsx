import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DataStoreProvider } from "@/lib/data-store";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { GlobalLoaderProvider } from "@/components/providers/GlobalLoaderProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sanathan Rudraksha - Authentic Spiritual Products",
  description: "Premium quality Rudraksha beads, malas, and spiritual products. Authentic Nepali Rudraksha with lab certification. Free shipping across India.",
  keywords: ["Rudraksha", "Spiritual Products", "Nepali Rudraksha", "Rudraksha Mala", "Spiritual Beads", "Meditation", "Yoga Accessories", "Hindu Spiritual Items", "Sanathan Rudraksha"],
  authors: [{ name: "Sanathan Rudraksha" }],
  openGraph: {
    title: "Sanathan Rudraksha - Authentic Spiritual Products",
    description: "Premium quality Rudraksha beads and spiritual products. Authentic Nepali Rudraksha with lab certification.",
    url: "https://sanathanrudraksha.com",
    siteName: "Sanathan Rudraksha",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sanathan Rudraksha - Authentic Spiritual Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanathan Rudraksha - Authentic Spiritual Products",
    description: "Premium quality Rudraksha beads and spiritual products.",
    images: ["/twitter-image.jpg"],
  },
  other: {
    "twitter:site": "@sanathanrudraksha",
    "twitter:creator": "@sanathanrudraksha",
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
          <GlobalLoaderProvider>
            {children}
            <GlobalLoader />
            <Toaster />
          </GlobalLoaderProvider>
        </DataStoreProvider>
      </body>
    </html>
  );
}
