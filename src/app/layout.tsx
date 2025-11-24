import {
  geistMono,
  geistSans,
  notoSerifTC,
  playfairDisplay,
} from "@/app/fonts";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/app/theme-provider";
import AppHeader from "@/components/app/appHeader";
import AppFooter from "@/components/app/appFooter";

export const metadata: Metadata = {
  title: {
    default: "YinCheng",
    template: "%s | YinCheng",
  },
  description: "Personal website of YinCheng",
  openGraph: {
    title: "YinCheng",
    description: "Personal website of YinCheng",
    url: "https://yincheng.app",
    siteName: "YinCheng",
    images: [
      {
        url: "https://yincheng.app/api/og",
        width: 1200,
        height: 630,
        alt: "YinCheng",
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YinCheng",
    description: "Personal website of YinCheng",
    images: ["https://yincheng.app/api/og"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-tw" suppressHydrationWarning>
      <body
        className={`${notoSerifTC.variable} ${playfairDisplay.variable} ${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppHeader />
          <main className="flex flex-1 flex-col">
            {children}
            <SpeedInsights />
            <Analytics />
          </main>
          <AppFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
