"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Icon } from "@iconify-icon/react";
import { notoSerifTC } from "@/app/fonts";
import { LogoBadge } from "@/components/app/logoBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Milestone = {
  period: string;
  title: string;
  description: string;
  logos?: string[];
  image?: string;
  imageAlt?: string;
  href?: string;
};

const milestones: Milestone[] = [
  {
    period: "2021",
    title: "踏入程式世界",
    description:
      "第一次接觸程式，就從 discord.py 入門。發現能親手打造機器人，加上 AI 興起讓學習門檻大幅降低，於是一頭栽了進來，做出一堆現在看來有點無厘頭、卻讓我樂在其中的功能。",
    logos: ["devicon:python"],
  },
  {
    period: "2022",
    title: "學習 JavaScript",
    description:
      "為了突破 discord.py 的限制，轉向 JavaScript 與 Node.js，改用 discord.js 開發機器人，也一步步補齊對語言本身的理解。",
    logos: ["devicon:nodejs", "devicon:javascript"],
  },
  {
    period: "2022",
    title: "開發 YINLA Discord 機器人",
    description:
      "整合翻譯、入群通知、中華職棒賽程、天氣、地震報告（含即時推播）與中油油價等功能，至今仍持續維護與擴充。",
    logos: ["devicon:discordjs", "logos:discord-icon"],
  },
  {
    period: "2023",
    title: "考入靜宜大學資訊工程系",
    description:
      "進入資工系，正式從 C／C++、Java 等基礎語言打底，把過去的自學經驗補上扎實的理論基礎。",
    logos: ["devicon:c", "devicon:cplusplus", "devicon:java"],
  },
  {
    period: "2024",
    title: "投入前端開發",
    description:
      "深入 React 與 Next.js，追求高效且可維護的介面，並持續打磨使用者體驗的每個細節。",
    logos: ["devicon:nextjs", "devicon:react", "devicon:vuejs", "devicon:tailwindcss"],
  },
  {
    period: "2025",
    title: "打造開發工具",
    description:
      "為了解決開發中的痛點，發佈 iso-countries-utils npm 套件，並打造 VSCode 擴充套件 ErrTracker，自動追蹤並記錄每日的程式錯誤。",
    logos: ["devicon:npm", "devicon:nodejs", "devicon:vscode"],
  },
  {
    period: "2025",
    title: "打造個人網站",
    description:
      "以 Next.js 與 Tailwind CSS 從零打造這個網站，作為作品、文章與想法的集散地。",
    logos: ["devicon:nextjs", "devicon:tailwindcss"],
  },
  {
    period: "2025",
    title: "加入 Exptech Studio",
    description:
      "加入 Exptech Studio，和團隊一起投入防災與即時資訊服務的開發，把興趣延伸成能真正影響他人的產品，主要負責前端、UI/UX部分。",
    image: "/roadmap/exptech-studio.png",
    imageAlt: "Exptech Studio",
    href: "https://exptech.com.tw",
  },
];

export function Roadmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // 捲動綁定：當時間軸從視窗中央往上帶時，中軸線逐漸填滿（輕量 Apple 質感）
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 60%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef} className="relative mx-auto max-w-3xl">
      {/* 中軸線（底色） */}
      <div
        aria-hidden
        className="bg-border absolute top-3 bottom-3 left-2 w-px -translate-x-1/2"
      />
      {/* 中軸線（隨捲動填充的前景） */}
      <motion.div
        aria-hidden
        style={{ scaleY: reduce ? 1 : progress }}
        className="bg-foreground absolute top-3 bottom-3 left-2 w-px origin-top -translate-x-1/2"
      />

      <ol className="space-y-10">
        {milestones.map((m) => (
          <li key={`${m.period}-${m.title}`} className="group relative flex gap-5">
            {/* 節點：hover 時亮起 */}
            <motion.span
              aria-hidden
              className="border-foreground bg-background group-hover:bg-foreground group-hover:ring-foreground/10 relative z-10 mt-2 h-4 w-4 flex-none rounded-full border-2 transition-colors duration-300 group-hover:ring-4"
              initial={reduce ? false : { scale: 0.4, opacity: 0 }}
              whileInView={reduce ? undefined : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              viewport={{ once: true, margin: "-45% 0px -45% 0px" }}
            />

            {/* 內容卡片：進場淡入 + hover 浮起 */}
            <motion.div
              className="min-w-0 flex-1"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : 0.05 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              whileHover={
                reduce
                  ? undefined
                  : {
                      y: -6,
                      transition: { type: "spring", stiffness: 300, damping: 20 },
                    }
              }
            >
              <Card
                className={`${notoSerifTC.className} border-muted hover:border-foreground/20 h-full shadow transition-[box-shadow,border-color] duration-300 hover:shadow-lg`}
              >
                <CardHeader className="flex flex-inline items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground font-mono text-sm">
                      {m.period}
                    </p>
                    <CardTitle className="text-2xl font-semibold">
                      {m.title}
                    </CardTitle>
                  </div>
                  {m.logos && m.logos.length > 0 && (
                    <div className="flex flex-none items-center gap-2">
                      {m.logos.map((logo) => (
                        <LogoBadge key={logo} logo={logo} size={24} />
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-lg">
                    {m.description}
                  </p>
                  {m.image &&
                    (m.href ? (
                      <Link
                        href={m.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`前往 ${m.imageAlt ?? m.title}`}
                        className="group/media border-muted hover:border-foreground/20 relative block aspect-8/3 w-full overflow-hidden rounded-lg border bg-white transition-colors duration-300"
                      >
                        <Image
                          src={m.image}
                          alt={m.imageAlt ?? m.title}
                          fill
                          className="object-contain transition-transform duration-500 group-hover/media:scale-105"
                          sizes="(max-width: 768px) 100vw, 48rem"
                        />
                        <span className="bg-background/80 text-foreground absolute right-3 bottom-3 flex items-center gap-1 rounded-md px-2 py-1 text-xs opacity-0 backdrop-blur transition-opacity duration-300 group-hover/media:opacity-100">
                          <Icon icon="mdi:open-in-new" />
                          前往網站
                        </span>
                      </Link>
                    ) : (
                      <div className="border-muted relative aspect-8/3 w-full overflow-hidden rounded-lg border bg-white">
                        <Image
                          src={m.image}
                          alt={m.imageAlt ?? m.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 48rem"
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  );
}
