"use client";

export default function AppFooter() {
  return (
    <footer className="border-t bg-background/50 px-6 py-10 text-center text-sm text-muted-foreground backdrop-blur-sm">
      &copy; {new Date().getFullYear()} YinCheng. 版權所有.
    </footer>
  );
}
