"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify-icon/react";
import { SectionTitle } from "@/components/app/sectionTitle";

export function AboutSection() {
  return (
    <section id="about" className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <SectionTitle title="關於我" />

        <div className="mt-12 grid items-center gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="bg-muted relative aspect-square overflow-hidden rounded-full">
              {/* 放你的頭貼 */}
              <Image
                src="/me/avatar.jpg"
                alt="YinCheng"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <p className="text-lg leading-relaxed">
              嗨！我是 <strong>YinCheng</strong>，目前就讀大學，主修資訊工程。
            </p>
            <p className="text-muted-foreground">
              我熱愛用程式解決問題，從前端介面到後端邏輯都親手實作。 特別喜歡{" "}
              <strong>Next.js</strong>、<strong>TypeScript</strong> 和{" "}
              <strong>Tailwind CSS</strong>。
            </p>
            <p className="text-muted-foreground">
              除了寫 code，我也喜歡打棒球、看書、寫技術文章。
              相信技術能讓生活更有溫度
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
