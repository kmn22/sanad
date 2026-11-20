import type { Metadata, Viewport } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/core/i18n";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PWAInstallBanner } from "@/components/core/PWAInstallBanner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "مقر — المقر الرقمي للعمليات القانونية والحوكمة",
  description:
    "المقر الرقمي للعمليات القانونية والحوكمة — منصتك المؤسسية المتكاملة لإدارة دورة حياة العقود (CLM) للشركات، وإدارة القضايا والمحاكم لمكاتب المحاماة، وبنك السوابق والأنظمة لطلاب وباحثي القانون.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://maqar.sa"),
  keywords: [
    "مقر",
    "Maqar",
    "المقر الرقمي للعمليات القانونية والحوكمة",
    "إدارة دورة حياة العقود",
    "CLM",
    "إدارة مكاتب المحاماة",
    "بنك السوابق القضائية",
    "صياغة عقود",
    "نظام المعاملات المدنية",
    "نظام العمل السعودي",
    "حوكمة قانونية",
  ],
  authors: [{ name: "Maqar Technologies" }],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: process.env.NEXTAUTH_URL || "https://maqar.sa",
    siteName: "مقر (Maqar)",
    title: "مقر — المقر الرقمي للعمليات القانونية والحوكمة",
    description:
      "المقر الرقمي للعمليات القانونية والحوكمة للشركات ومكاتب المحاماة والباحثين القانونيين في المملكة العربية السعودية.",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "مقر — المقر الرقمي للعمليات القانونية والحوكمة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مقر — المقر الرقمي للعمليات القانونية والحوكمة",
    description:
      "المقر الرقمي للعمليات القانونية والحوكمة للشركات ومكاتب المحاماة والباحثين القانونيين في المملكة العربية السعودية.",
    images: ["/og-preview.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "مقر",
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
