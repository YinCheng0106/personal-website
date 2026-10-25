"use client";

import Link from "next/link";
import { playfairDisplay, notoSerifTC } from "@/app/fonts";
import { Icon } from "@iconify-icon/react";

import { ModeToggle } from "@/components/app/themeSwitch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "專案", href: "/projects" },
  { label: "部落格", href: "/blog" },
  { label: "關於我", href: "/about" },
];

export default function AppHeader() {
  return (
    <div
      className={`sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-8 backdrop-blur-sm select-none min-[375px]:px-8 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4`}
    >
      <Link href="/" aria-label="YinCheng 首頁" className="shrink-0">
        <h1
          className={`${playfairDisplay.className} hidden text-2xl font-bold md:block`}
        >
          YinCheng
        </h1>
        <h1
          className={`${playfairDisplay.className} block text-2xl font-bold md:hidden`}
        >
          YC
        </h1>
      </Link>
      <nav
        aria-label="主要導覽"
        className="flex shrink-0 items-center gap-2 min-[375px]:gap-4"
      >
        <div className="hidden gap-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${notoSerifTC.className} link text-lg font-bold`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/projects"
              aria-label="專案"
              className="link block md:hidden"
              target="_self"
            >
              <Icon
                icon="ri:git-repository-line"
                className="block"
                width={24}
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent>專案</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/blog"
              aria-label="部落格"
              className="link block md:hidden"
              target="_self"
            >
              <Icon icon="ri:article-line" className="block" width={24} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>部落格</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/about"
              aria-label="關於我"
              className="link block md:hidden"
              target="_self"
            >
              <Icon icon="ri:information-line" className="block" width={24} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>關於我</TooltipContent>
        </Tooltip>

        <Link
          className="link"
          href="https://www.threads.com/@_yincheng_"
          aria-label="Threads"
          target="_blank"
        >
          <Icon icon="ri:threads-line" className="block" width={24} />
        </Link>
        <Link
          className="link"
          href="https://www.instagram.com/_yincheng_"
          aria-label="Instagram"
          target="_blank"
        >
          <Icon icon="ri:instagram-line" className="block" width={24} />
        </Link>
        <Link
          className="link"
          href="https://github.com/YinCheng0106"
          aria-label="GitHub"
          target="_blank"
        >
          <Icon icon="ri:github-line" className="block" width={24} />
        </Link>
        <ModeToggle />
      </nav>
    </div>
  );
}
