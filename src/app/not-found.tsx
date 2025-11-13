"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notoSerifTC } from "@/app/fonts";
import { motion } from "motion/react";
import { Icon } from "@iconify-icon/react";
import NumberFlow from "@number-flow/react";
import { Button } from "@/components/ui/button";

type Mode = "speed" | "average";

export default function NotFound() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [errorCode, setErrorCode] = useState(0);
  const [displayText, setDisplayText] = useState("");

  const modeData = {
    speed: {
      fullText: "速球經過請注意安全",
      unit: "KPH",
      value: 404,
    },
    average: {
      fullText: "四割人！聯盟頂尖打者",
      unit: "AVG",
      value: 0.404,
    },
  };

  const current = mode ? modeData[mode] : modeData.speed;

  useEffect(() => {
    const initialMode: Mode = Math.random() > 0.5 ? "speed" : "average";
    setMode(initialMode);
    setErrorCode(modeData[initialMode].value);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setErrorCode(current.value);
    }, 100);
  }, [current.value]);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= current.fullText.length) {
        setDisplayText(current.fullText.substring(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [mode, current.fullText]);

  return (
    <div className="bg-background fixed inset-0 flex flex-col items-center justify-center gap-6 select-none">
      <div className="flex items-baseline gap-3">
        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`${notoSerifTC.className} text-8xl font-bold text-red-600 sm:text-9xl dark:text-red-500`}
        >
          <NumberFlow
            value={errorCode}
            format={
              mode === "average"
                ? { minimumFractionDigits: 3, maximumFractionDigits: 3 }
                : {}
            }
          />
        </motion.h2>
        <motion.span
          key={mode + "unit"}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${notoSerifTC.className} text-muted-foreground font-mono text-2xl sm:text-3xl`}
        >
          {current.unit}
        </motion.span>
      </div>
      <p
        className={`${notoSerifTC.className} text-muted-foreground text-center text-base font-bold sm:text-lg`}
      >
        {displayText}
        <span className="bg-primary ml-1 inline-block h-5 w-0.5 animate-pulse" />{" "}
      </p>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button asChild variant="ghost" size="lg" className="font-medium">
          <Link href="/">返回首頁</Link>
        </Button>
      </motion.div>
      <motion.div
        animate={{
          x: [-1200, 1200],
          y: mode === "speed" ? [0, -50, -70, 0] : [0, -30, -50, 0],
          rotate: [-360, 360],
        }}
        transition={{
          duration: mode === "speed" ? 2 : 3.5,
          repeat: Infinity,
          repeatDelay: mode === "speed" ? 8 : 8,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute text-5xl"
        style={{ top: mode === "speed" ? "12%" : "15%" }}
      >
        <Icon icon="mdi:baseball" width={56} />
      </motion.div>
    </div>
  );
}
