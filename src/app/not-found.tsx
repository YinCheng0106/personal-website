"use client";

import Link from "next/link";
import { notoSerifTC } from "@/app/fonts";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background fixed inset-0 flex flex-col items-center justify-center gap-6 select-none">
      <h2
        className={`${notoSerifTC.className} text-foreground text-8xl font-bold`}
      >
        404
      </h2>
      <p
        className={`${notoSerifTC.className} text-muted-foreground text-center text-base font-bold sm:text-lg`}
      >
        未知
      </p>
      <Button asChild>
        <Link href="/">返回首頁</Link>
      </Button>
    </div>
  );
}
