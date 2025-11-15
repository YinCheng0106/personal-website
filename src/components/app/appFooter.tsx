"use client";

import { notoSerifTC } from "@/app/fonts";

export default function AppFooter() {
  return (
    <footer
      className={`${notoSerifTC.className} bg-background/50 text-muted-foreground border-t px-6 py-10 text-center text-sm backdrop-blur-sm`}
    >
      &copy; {new Date().getFullYear()} YinCheng. 版權所有.
    </footer>
  );
}
