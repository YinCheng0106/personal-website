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
      className={`sticky top-0 z-40 flex items-center justify-between p-8 backdrop-blur-sm select-none`}
    >
      <Link href="/">
        <h1
          className={`${playfairDisplay.className} fixed top-8 left-8 hidden text-2xl font-bold md:block`}
        >
          YinCheng
        </h1>
        <h1
          className={`${playfairDisplay.className} fixed top-8 left-8 block text-2xl font-bold md:hidden`}
        >
          YC
        </h1>
      </Link>
      <div className="flex items-center justify-around gap-4">
        <nav className="hidden gap-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${notoSerifTC.className} link text-lg font-bold`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/projects" className="link block md:hidden" target="_self">
          <Tooltip>
            <TooltipTrigger className="block">
              <Icon
                icon="ri:git-repository-line"
                className="block"
                width={24}
              />
            </TooltipTrigger>
            <TooltipContent>專案</TooltipContent>
          </Tooltip>
        </Link>
        <Link href="/blog" className="link block md:hidden" target="_self">
          <Tooltip>
            <TooltipTrigger className="block">
              <Icon icon="ri:article-line" className="block" width={24} />
            </TooltipTrigger>
            <TooltipContent>部落格</TooltipContent>
          </Tooltip>
        </Link>
        <Link href="/about" className="link block md:hidden" target="_self">
          <Tooltip>
            <TooltipTrigger className="block">
              <Icon icon="ri:information-line" className="block" width={24} />
            </TooltipTrigger>
            <TooltipContent>關於我</TooltipContent>
          </Tooltip>
        </Link>

        <Link
          className="link hidden md:block"
          href="https://www.threads.com/@_yincheng_"
          target="_blank"
        >
          <Icon icon="ri:threads-line" className="block" width={24} />
        </Link>
        <Link
          className="link"
          href="https://www.instagram.com/_yincheng_"
          target="_blank"
        >
          <Icon icon="ri:instagram-line" className="block" width={24} />
        </Link>
        <Link
          className="link"
          href="https://github.com/YinCheng0106"
          target="_blank"
        >
          <Icon icon="ri:github-line" className="block" width={24} />
        </Link>
        <ModeToggle />
      </div>
    </div>
  );
}
