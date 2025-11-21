import {
  geistMono,
  geistSans,
  notoSerifTC,
  playfairDisplay,
} from "@/app/fonts";
import type { Metadata } from "next";
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
            <Analytics />
          </main>
          <AppFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
