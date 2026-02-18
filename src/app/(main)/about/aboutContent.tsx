"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Icon } from "@iconify-icon/react";
import { notoSerifTC } from "@/app/fonts";

import { SectionTitle } from "@/components/app/sectionTitle";
import { LogoBadge } from "@/components/app/logoBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AboutContent() {
  return (
    <div className="min-h-screen px-4 py-0 select-none md:py-20">
      <div className="mx-auto max-w-5xl space-y-20">
        <section className="grid items-center gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <div className="relative aspect-square overflow-hidden rounded-full">
              <Image
                src="/me/avatar.jpg"
                alt="YinCheng"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className={`${notoSerifTC.className} md:col-span-1`}
          >
            <h1 className={`mb-4 text-4xl font-bold`}> YinCheng</h1>
            <p className="text-muted-foreground text-lg">
              就讀於台灣靜宜大學資訊工程系
            </p>
            <p className="text-muted-foreground text-lg">
              熱愛用程式解決問題，擅長前端開發與使用者體驗設計
            </p>
            <p className="text-muted-foreground text-lg">
              相信技術應該讓生活更簡單、更有溫度
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="secondary" size="sm" asChild>
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
          </motion.div>
        </section>

        <section>
          <SectionTitle title="技能" />
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card
                className={`${notoSerifTC.className} border-muted shadow md:col-span-1`}
              >
                <CardHeader className="flex flex-inline justify-between">
                  <CardTitle className={`text-2xl font-semibold`}>
                    前端架構
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <LogoBadge logo="devicon:nextjs" size={24} />
                    <LogoBadge logo="devicon:react" size={24} />
                    <LogoBadge logo="devicon:tailwindcss" size={24} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground text-lg`}>
                    前端框架是我最熟悉的領域，尤其是 React 和
                    Next.js。我喜歡使用這些工具來構建高效、可維護的用戶界面，並且不斷學習新的前端技術以提升我的技能
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card
                className={`${notoSerifTC.className} border-muted shadow md:col-span-1`}
              >
                <CardHeader className="flex flex-inline justify-between">
                  <CardTitle className={`text-2xl font-semibold`}>
                    應用開發
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <LogoBadge logo="devicon:flutter" size={24} />
                    <LogoBadge logo="devicon:reactnative" size={24} />
                    <LogoBadge logo="devicon:swift" size={24} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground text-lg`}>
                    我在應用開發領域有豐富的經驗，特別是在 Flutter、React Native 和 Swift 等框架上。我擅長使用這些工具來開發高效、可維護的應用程式，並且不斷學習新的應用開發技術以提升我的技能
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card
                className={`${notoSerifTC.className} border-muted shadow md:col-span-1`}
              >
                <CardHeader className="flex flex-inline justify-between">
                  <CardTitle className={`text-2xl font-semibold`}>
                    工具開發
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <LogoBadge logo="devicon:npm" size={24} />
                    <LogoBadge logo="devicon:nodejs" size={24} />
                    <LogoBadge logo="devicon:vscode" size={24} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground text-lg`}>
                    在工具開發方面，為了解決其他開發項目的問題，所以開發了一個iso-cuntries-utils，解決了國家代碼的問題。
                    還有開發VSCode Extension，ErrTracker，可以追蹤當日的所有程式錯誤並且記錄。
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card
                className={`${notoSerifTC.className} border-muted shadow md:col-span-1`}
              >
                <CardHeader className="flex flex-inline justify-between">
                  <CardTitle className={`text-2xl font-semibold`}>
                    機器人開發
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <LogoBadge logo="devicon:discordjs" size={24} />
                    <LogoBadge logo="logos:discord-icon" size={24} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground text-lg`}>
                    在機器人方面，我有開發一個名為「<Link href="/bot" className="link">YINLA</Link>」的 Discord 機器人，
                    擁有翻譯、加入通知、中華職棒賽程資訊、天氣資訊、地震報告(含推播功能)、中油油價等等功能，並且持續開發中。
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
        <section>
          <SectionTitle title="聯絡" />
          <div className="flex items-center justify-center space-x-4">
            <motion.a
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://www.instagram.com/_yincheng_"
              rel="noopener noreferrer"
              target="_blank"
              className="text-2xl link"
            >
              <Icon icon="ri:instagram-line" size={64}/>
            </motion.a>
            <motion.a
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://www.threads.com/@_yincheng_"
              rel="noopener noreferrer"
              target="_blank"
              className="text-2xl link"
            >
              <Icon icon="ri:threads-fill" size={64}/>
            </motion.a>
            <motion.a
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://x.com/Yin_Cheng0106"
              rel="noopener noreferrer"
              target="_blank"
              className="text-2xl link"
            >
              <Icon icon="ri:twitter-x-line" size={64}/>
            </motion.a>
            <motion.a
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://www.linkedin.com/in/yin-cheng-wen-94b18a27a/"
              rel="noopener noreferrer"
              target="_blank"
              className="text-2xl link"
            >
              <Icon icon="ri:linkedin-box-fill" size={64}/>
            </motion.a>
            <motion.a
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://github.com/YinCheng0106"
              rel="noopener noreferrer"
              target="_blank"
              className="text-2xl link"
            >
              <Icon icon="ri:github-fill" size={64}/>
            </motion.a>
          </div>
        </section>
      </div>
    </div>
  );
}
