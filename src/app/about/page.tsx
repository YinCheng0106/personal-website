import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { notoSerifTC } from "@/app/fonts";

import { SectionTitle } from "@/components/app/sectionTitle";
import { IconBadge } from "@/components/app/iconBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const skills = [
  { name: "Next.js", icon: "logos:nextjs-icon", learning: true },
  { name: "Nuxt", icon: "logos:nuxt-icon", learning: false },
  { name: "React Native", icon: "logos:react", learning: true },
  { name: "Flutter", icon: "logos:flutter", learning: true },
  { name: "TypeScript", icon: "logos:typescript-icon", learning: false },
  { name: "JavaScript", icon: "logos:javascript", learning: false },
  { name: "Vue", icon: "logos:vue", learning: false },
  { name: "React", icon: "logos:react", learning: false },
  { name: "Tailwind CSS", icon: "logos:tailwindcss-icon", learning: false },
  { name: "C", icon: "logos:c", learning: false },
  { name: "C++", icon: "logos:c-plusplus", learning: false },
  { name: "C#", icon: "logos:c-sharp", learning: true },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-0 md:py-20">
      <div className="mx-auto max-w-5xl space-y-20">
        <section className="grid items-center gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="relative aspect-square overflow-hidden rounded-full">
              <Image
                src="/me/avatar.jpg"
                alt="YinCheng"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className={`${notoSerifTC.className} space-y-4 md:col-span-2`}>
            <h1 className={`text-4xl font-bold`}> Hello! 我是 YinCheng</h1>
            <p className="text-muted-foreground text-lg">
              就讀於台灣靜宜大學資訊工程系
              <br />
              熱愛用程式解決問題，擅長前端開發與使用者體驗設計
            </p>
            <p className="text-muted-foreground">
              相信技術應該讓生活更簡單、更有溫度
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="https://github.com/YinCheng0106" target="_blank">
                  <Icon
                    icon="mdi:github"
                    className="mr-1"
                    width={16}
                    height={16}
                  />
                  GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle title="技能樹" />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className={`bg-muted/50 flex flex-col items-center gap-2 rounded-lg border p-4 transition-transform duration-200 hover:scale-105`}
              >
                <Icon icon={skill.icon} width={36} height={36} />
                <span className="text-sm font-medium">{skill.name}</span>
                {skill.learning && (
                  <Badge variant="secondary" className="text-xs">
                    學習中...
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 text-center">
          <SectionTitle title="聯絡資訊" />
          <div className="mt-6 flex flex-col justify-center gap-4 md:flex-row">
            <IconBadge
              icon="line-md:linkedin"
              label="Yin Cheng Wen"
              link="https://www.linkedin.com/in/yin-cheng-wen-94b18a27a/"
            />
            <IconBadge
              icon="line-md:instagram"
              label="_yincheng_"
              link="https://www.instagram.com/_yincheng_"
            />
            <IconBadge
              icon="ri:threads-line"
              label="_yincheng_"
              link="https://www.threads.com/@_yincheng_"
            />
            <IconBadge
              icon="line-md:twitter-x"
              label="@Yin_Cheng0106"
              link="https://x.com/Yin_Cheng0106"
            />
            <IconBadge icon="line-md:discord" label="_yincheng_" />
          </div>
        </section>
      </div>
    </div>
  );
}
