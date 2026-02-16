"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { notoSerifTC } from "@/app/fonts";

import CircularText from "@/components/ui/circularText";

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
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="my-8 flex w-full flex-col items-center gap-4"
      >
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <Image
              src="/me/avatar.jpg"
              alt="YinCheng"
              width={120}
              height={120}
              className="rounded-full"
            />
          </div>
          <CircularText
            text="YinCheng • YinCheng • YinCheng • "
            className={`text-primary ${notoSerifTC.className} z-20 h-[170px] w-[170px] font-bold`}
            spinDuration={12}
            onHover="slowDown"
          />
        </div>
        <h2 className={`text-4xl font-bold ${notoSerifTC.className}`}>
          YinCheng
        </h2>
      </motion.div>
      <div className="flex w-full flex-col items-center">
        {links.map((link) => (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={link.href}
            className="w-full"
          >
            <Link href={link.href} target="_blank" rel="noopener noreferrer">
              <div
                className={`${notoSerifTC.className} bg-accent hover:bg-accent/80 my-2 transform rounded-full px-6 py-3 text-center font-semibold duration-200 ease-in-out active:scale-95`}
              >
                {link.label}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
