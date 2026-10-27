import type { Metadata, Viewport } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/sanad/i18n";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PWAInstallBanner } from "@/components/sanad/PWAInstallBanner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["700", "800", "900"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "مَقَرّ — المساحة الافتراضية السيادية للاستشارات والعمليات",
  description:
    "مقرّك المهني المتكامل لإدارة الاستشارات، القضايا، العقود، والفوترة مع بوابة موكلين تفاعلية وسيادة تامة على بياناتك.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://maqar.sa"),
  keywords: [
    "مقر",
    "Maqar",
    "مساحة عمل افتراضية",
    "مكتب افتراضي",
    "بوابة الموكلين",
    "صياغة عقود",
    "استشارات قانونية",
    "نظام المعاملات المدنية",
    "نظام العمل السعودي",
    "امتثال نظامي",
  ],
  authors: [{ name: "Maqar Technologies" }],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: process.env.NEXTAUTH_URL || "https://maqar.sa",
    siteName: "مَقَرّ (Maqar Workspace)",
    title: "مَقَرّ — المساحة الافتراضية السيادية للاستشارات والعمليات",
    description:
      "مقرّك المهني المتكامل لإدارة الاستشارات، القضايا، العقود، وبوابات الموكلين التفاعلية.",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "مَقَرّ — مساحتك المهنية المتكاملة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مَقَرّ — المساحة الافتراضية السيادية للاستشارات والعمليات",
    description:
      "مقرّك المهني المتكامل لإدارة الاستشارات، القضايا، العقود، وبوابات الموكلين التفاعلية.",
    images: ["/og-preview.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "مَقَرّ",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F7A46",
  width: "device-width",
  initialScale: 1,
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
        className={`${cairo.variable} ${plexArabic.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-arabic), system-ui, sans-serif' }}
      >
        <SessionProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
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
