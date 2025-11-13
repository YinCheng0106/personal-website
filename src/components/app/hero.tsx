"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { notoSerifTC } from "@/app/fonts";
import { Icon } from "@iconify-icon/react";

const slogans = [
  "每一個專案，都是我成長的足跡",
  "寫程式是我的熱情，也是我與世界溝通的方式",
  "在代碼的世界裡，我尋找無限的可能性",
  "相信技術能讓生活更有溫度",
  "靜靜思考、專注創造，讓每一行程式都成為故事的開端",
  "休息是為了走更長遠的路",
  "但我一休息就半天過去了:)",
  "希望看到這句話的妳，也能天天幸福開心！",
];

export function Hero() {
  const [sloganIndex, setSloganIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArrow, setShowArrow] = useState(true);

  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isInView = entry.isIntersecting || entry.boundingClientRect.bottom > window.innerHeight * 0.3;
        setShowArrow(isInView);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px -10px 0px",
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const currentSlogan = slogans[sloganIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText !== currentSlogan) {
      timer = setTimeout(() => {
        setDisplayText(currentSlogan.substring(0, displayText.length + 1));
      }, 80);
    } else if (isDeleting && displayText !== "") {
      timer = setTimeout(() => {
        setDisplayText(currentSlogan.substring(0, displayText.length - 1));
      }, 50);
    } else if (displayText === currentSlogan) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (displayText === "" && isDeleting) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setSloganIndex((prev) => (prev + 1) % slogans.length);
      }, 0);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, sloganIndex]);

  return (
    <section ref={heroRef} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="mx-auto max-w-4xl space-y-8 text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`${notoSerifTC.className} text-5xl font-bold sm:text-6xl md:text-7xl`}
        >
          <span className="text-primary">YinCheng</span>
        </motion.h1>

        <div className="flex h-20 items-center justify-center">
          <p className="text-muted-foreground font-mono text-xl sm:text-2xl">
            <span className="text-accent">{displayText}</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="bg-accent ml-1 inline-block h-6 w-1"
            />
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`${notoSerifTC.className} text-muted-foreground mx-auto max-w-2xl text-lg`}
        >
          大學生・軟體開發・想成為工程師
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col justify-center gap-4 sm:flex-row "
        >
          <Button size="lg" className="" asChild>
            <Link href="#projects">我的專案</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#tools">小工具</Link>
          </Button>
        </motion.div>
      </div>
      {showArrow && (
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="pointer-events-auto fixed bottom-8 left-1/2 z-50 -translate-x-1/2 cursor-pointer md:bottom-12"
          onClick={() => {
            document.getElementById("project")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          <Icon
            icon="mdi:chevron-down"
            width={32}
            className="text-muted-foreground drop-shadow-lg"
          />
        </motion.div>
      )}
    </section>
  );
}
