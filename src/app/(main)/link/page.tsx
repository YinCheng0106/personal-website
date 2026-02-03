"use client";

import Link from "next/link";
import Image from "next/image";
import { notoSerifTC } from "@/app/fonts";

export default function LinkPage() {
  const links = [
    { href: "https://github.com/YinCheng0106", label: "GitHub" },
    {
      href: "https://www.instagram.com/_yincheng_",
      label: "Instagram",
      icon: "",
    },
    { href: "https://www.threads.com/@_yincheng_", label: "Threads" },
    {
      href: "https://www.linkedin.com/in/yin-cheng-wen-94b18a27a/",
      label: "LinkedIn",
    },
  ];

  return (
    <div className="container flex flex-col items-center select-none">
      <div className="my-8 flex w-full flex-col items-center gap-4">
        <Image
          src="/me/avatar.jpg"
          alt="YinCheng"
          width={120}
          height={120}
          className="rounded-full"
        />
        <h2 className={`text-4xl font-bold ${notoSerifTC.className}`}>
          YinCheng
        </h2>
      </div>
      <div className="flex w-full flex-col items-center">
        {links.map((link) => (
          <div key={link.href} className="w-full">
            <Link href={link.href} target="_blank" rel="noopener noreferrer">
              <div
                className={`bg-accent hover:bg-accent/80 my-2 rounded-xl px-6 py-3 text-center transition-transform duration-200 active:scale-95`}
              >
                {link.label}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
