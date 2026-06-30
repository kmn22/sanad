import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/sanad/i18n";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PWAInstallBanner } from "@/components/sanad/PWAInstallBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "سند — لوحة العمليات اليومية للامتثال والمحاماة",
  description:
    "لوحة العمليات اليومية للمحامين والمنشآت الصغيرة في السعودية. تتبع الامتثال، إدارة القضايا، جلسات تركيز، ولا تفوّت أي تجديد.",
  keywords: [
    "سند",
    "Sanad",
    "محاماة السعودية",
    "امتثال المنشآت",
    "تجديد إقامة",
    "وزارة العدل",
    "الموارد البشرية",
    "إدارة قضايا",
  ],
  authors: [{ name: "Sanad" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "سند",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f5132",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${plexArabic.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-arabic), var(--font-geist-sans), system-ui, sans-serif' }}
      >
        <SessionProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              <LanguageProvider>
                {children}
                <PWAInstallBanner />
              </LanguageProvider>
              <Toaster />
            </ThemeProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
