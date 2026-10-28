"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { notoSerifTC } from "@/app/fonts";
import { Icon } from "@iconify-icon/react";

const slogans = [
  "Hello!",
  "每一個專案，都是我成長的足跡",
  "寫程式是我的熱情，也是我與世界溝通的方式",
  "在代碼的世界裡，我尋找無限的可能性",
  "相信技術能讓生活更有溫度",
  "靜靜思考、專注創造，讓每一行程式都成為故事的開端",
  "休息是為了走更長遠的路",
  "但我一休息就半天過去了:)",
];

const slogans_light = [
  "Hello!",
  "淺色模式很亮齁",
  "要瞎了對不對:)",
  "右上角可以切換深色模式喔！",
  "每一個專案，都是我成長的足跡",
  "寫程式是我的熱情，也是我與世界溝通的方式",
  "休息是為了走更長遠的路",
  "但我一休息就半天過去了:)",
];

// Motion 12.23.24 snapshots this preference in useState without subscribing
// React to later changes. Keep this subscription local to the Hero.
const motionQuery = "(prefers-reduced-motion: reduce)";
const staticSlogan = slogans[1];

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(motionQuery).matches;
}

function getServerMotionSnapshot() {
  return null;
}

function Typewriter() {
  const { theme } = useTheme();
  const [sloganIndex, setSloganIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSlogan =
      theme === "light" ? slogans_light[sloganIndex] : slogans[sloganIndex];
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
  }, [displayText, isDeleting, sloganIndex, theme]);

  return <>{displayText}</>;
}

export function Hero() {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerMotionSnapshot,
  );

  const heroRef = useRef<HTMLDivElement>(null);

  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isInView =
          entry.isIntersecting || entry.boundingClientRect.bottom > 100;
        setShowArrow(isInView);
      },
      {
        root: null,
        rootMargin: "0px -10px -100px 0px",
        threshold: 0,
      },
    );

    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 select-none">
      <div
        ref={heroRef}
        className="mx-auto mb-16 max-w-4xl space-y-8 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion === true ? 0 : 0.6 }}
          className={`${notoSerifTC.className} text-5xl font-bold motion-reduce:!transform-none motion-reduce:!opacity-100 sm:text-6xl md:text-7xl`}
        >
          <span className="text-primary">YinCheng</span>
        </motion.h1>

        <div className="flex h-20 items-center justify-center">
          <p className="text-muted-foreground font-mono text-xl sm:text-2xl">
            {/* CSS resolves the media query before hydration; both initial trees
                match, and reduced motion never starts a hidden typewriter. */}
            <span className="motion-safe:hidden">{staticSlogan}</span>
            <span className="motion-reduce:hidden">
              {reducedMotion === false && <Typewriter />}
            </span>
            <motion.span
              animate={{ opacity: reducedMotion === false ? [1, 0] : 0 }}
              transition={{
                duration: reducedMotion === false ? 0.5 : 0,
                repeat: reducedMotion === false ? Infinity : 0,
              }}
              className="bg-accent ml-1 inline-block h-6 w-1 motion-reduce:!opacity-0"
            />
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion === true ? { duration: 0 } : { delay: 0.3 }}
          className={`${notoSerifTC.className} text-muted-foreground mx-auto max-w-2xl text-lg motion-reduce:!opacity-100`}
        >
          大學生・軟體開發・網頁開發
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion === true ? { duration: 0 } : { delay: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 motion-reduce:!transform-none motion-reduce:!opacity-100 sm:flex-row"
        >
          <Button size="lg" className="w-40" asChild>
            <Link href="#projects" scroll>
              我的專案
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-40" asChild>
            <Link href="/about">關於我</Link>
          </Button>
        </motion.div>
      </div>
      {showArrow && (
        <motion.div
          animate={{ y: reducedMotion === false ? [0, 10, 0] : 0 }}
          transition={{
            duration: reducedMotion === false ? 1.5 : 0,
            repeat: reducedMotion === false ? Infinity : 0,
          }}
          className="pointer-events-auto fixed bottom-8 left-1/2 z-50 -translate-x-1/2 cursor-pointer motion-reduce:!transform-none md:bottom-12"
          onClick={() => {
            document.getElementById("project")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          <Link href="#projects" aria-label="前往我的專案">
            <Icon
              aria-hidden="true"
              icon="mdi:chevron-down"
              width={32}
              className="text-muted-foreground drop-shadow-lg"
            />
          </Link>
        </motion.div>
      )}
    </section>
  );
}
