"use client";

import Link from "next/link";
import { playfairDisplay, notoSerifTC } from "@/app/fonts";
import { ModeToggle } from "@/component/app/themeSwitch";
import { Icon } from "@iconify-icon/react";

const navItems = [
  { label: "專案", href: "/projects" },
  { label: "部落格", href: "/blog" },
  { label: "關於我", href: "/about" },
];

export default function AppHeader() {
  return (
    <div className={`flex items-center justify-between p-8 select-none`}>
      <Link href="/">
        <h1 className={`${playfairDisplay.className} text-2xl font-bold`}>
          YinCheng
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
        <Link
          className="link"
          href="https://www.threads.com/@_yincheng_"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="ri:threads-line" className="hidden md:block" width={24} />
        </Link>
        <Link
          className="link"
          href="https://www.instagram.com/_yincheng_"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon
            icon="ri:instagram-line"
            className="hidden md:block"
            width={24}
          />
        </Link>
        <Link
          className="link"
          href="https://github.com/YinCheng0106"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="ri:github-line" className="block" width={24} />
        </Link>
        <ModeToggle />
      </div>
    </div>
  );
}
