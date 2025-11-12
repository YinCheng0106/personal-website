import {
  geistMono,
  geistSans,
  notoSerifTC,
  playfairDisplay,
} from "@/app/fonts";
import type { Metadata } from "next";
import { ThemeProvider } from "@/component/app/theme-provider";
import AppHeader from "@/component/app/appHeader";
import AppFooter from "@/component/app/appFooter";

export const metadata: Metadata = {
  title: "YinCheng",
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
          <main className="flex-1 flex flex-col">{children}</main>
          <AppFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
